// #!/usr/bin/env node

import { request, gql, GraphQLClient } from 'graphql-request';
import { GET_ALL_CONTAINER_IMAGES, GET_CONTAINER_SYNCS, GET_GIT_SOURCES_LIST, GET_REPOS_STATUS } from './queries';
import {
  AddGitSourceMutation,
  AddRepoMutation,
  EnableContainerSyncMutation,
  GetAllContainerImagesQuery,
  GetContainerSyncsQuery,
  GetGitSourcesListQuery,
  GetReposStatusQuery,
  RemoveGitSourceMutation,
  SyncNowContainerMutation,
} from "./schema";
import {
  ADD_CONTAINER_SYNC_SCHEDULE,
  ADD_GIT_SOURCE,
  REMOVE_GIT_SOURCE,
  ADD_REPO,
  ENABLE_CONTAINER_SYNC,
  ENABLE_CONTAINER_SYNC_FOR_ALL,
  SYNC_NOW,
} from "./mutations";
import { UUID } from 'crypto';
import { ConfigReader, ConfigRepository, ConfigRoot } from './configuration';

const defaultEndpoint = `https://salem84-orange-parakeet-rrww9ppqxhwwpg-5433.preview.app.github.dev/graphql`;
const defaultGitSource = 'ReposCI';

let graphQLClient : GraphQLClient;

async function main() {
  let configPath = process.argv[2];

  if(!configPath) {
    console.error('ConfigPath is not valid: ' + configPath);
    process.exit(1);
  }
  console.log(configPath);
  const config : ConfigRoot = ConfigReader.read(configPath);

  let endpoint = process.argv[3];
  console.log('Endpoint: ' + endpoint);
  if(!endpoint) {
    endpoint = defaultEndpoint;
  }
  graphQLClient= new GraphQLClient(endpoint);

  await create(config.repositories);
  
  let syncCompleted = false;
  const total = config.repositories.length;
  do {
    const status = await getReposStatus();
    console.log(status);
    console.log('Wait completing count repositories: ' + total);
    syncCompleted = await checkSyncCompleted(status, total);
    await sleep(5000);
  }
  while(!syncCompleted)


}

async function create(configRepos: ConfigRepository[]) {
   

  let idProvider = await getGitSourcesList(defaultGitSource);
  
  if(idProvider) {
    console.log('Removing IdProvider ' + idProvider);
    await removeGitSource(idProvider);
    console.log('Removed git source');
  }

  
      console.log('Creating provider ' + defaultGitSource);
      idProvider = await addGitSource(defaultGitSource);
      
    console.log("IdProvider created: " + idProvider);
    
    const images = await getAllContainerImages();

    configRepos.forEach(async configRepo => {
      console.log('Adding repo: ' + configRepo.url);
      const repoId = await addRepo(configRepo.url, idProvider);
      console.log('Added repo: ' + repoId);

      images.containerImages?.nodes.forEach(async image =>  {
          if(configRepo.syncs.includes(image.name)) {
              console.log('Enabling Repo Sync: ' + image.name);
              const syncId = await enableContainerSync(image.id, repoId);
              await addContainerSyncSchedule(syncId);
          }
      });

      console.log('Repo Sync completed for ' + configRepo.url);
    });
    

}

async function getGitSourcesList(searchCriteria: string): Promise<UUID | undefined> {
  const variables = {
    search: searchCriteria,
    first: 5,
    offset: 0,
  };

  const data = await graphQLClient.request<GetGitSourcesListQuery>(
    GET_GIT_SOURCES_LIST,
    variables
  );
  // console.log("Total: " + data?.providers?.nodes.length);
  return data?.providers?.nodes[0]?.id;
}

// async function getCurrentUser() {
//   const query = gql`
//     query currentUser {
//       currentMergeStatUser
//     }
//   `;

//   interface Response {
//     currentMergeStatUser: string;
//   }

//   const data = await graphQLClient.request<Response>(query);
//   console.log(data);
// }

async function getContainerSyncs() : Promise<GetContainerSyncsQuery> {
    const variables = {
        id: undefined,
        search: '',
        first: 5,
        offset: 0,
      };
    
      const result = await graphQLClient.request<GetContainerSyncsQuery>(
        GET_CONTAINER_SYNCS,
        variables
      );
      return result;
}

async function getAllContainerImages() : Promise<GetAllContainerImagesQuery> {
      const result = await graphQLClient.request<GetAllContainerImagesQuery>(
        GET_ALL_CONTAINER_IMAGES,
      );
      return result;
}


async function enableContainerSyncForAll(imageId: string, providerId: string) {
  const variables = {
    imageId: imageId,
    providerId: providerId,
  };

  const result = await graphQLClient.request(
    ENABLE_CONTAINER_SYNC_FOR_ALL,
    variables
  );
  console.log(result);
}

async function enableContainerSync(imageId: UUID, repoId: UUID | undefined) : Promise<UUID | undefined>{
    const variables = {
      imageId: imageId,
      repoId: repoId,
    };
  
    const result = await graphQLClient.request<EnableContainerSyncMutation>(
      ENABLE_CONTAINER_SYNC,
      variables
    );
    // console.log(result);

    return result.createContainerSync?.containerSync?.id
  }

async function addContainerSyncSchedule(syncId: UUID | undefined) {
  const variables = {
    syncId: syncId,
  };

  const data = await graphQLClient.request<SyncNowContainerMutation>(
    ADD_CONTAINER_SYNC_SCHEDULE,
    variables
  );
  // console.log(data);
}

async function syncNowContainer() {
  const variables = {
    syncId: "",
    typeGroup: "",
  };

  const data = await graphQLClient.request<SyncNowContainerMutation>(
    SYNC_NOW,
    variables
  );
  console.log(data);
}

async function addRepo(repoUrl: string, idProvider: UUID | undefined) : Promise<UUID | undefined> {
  const variables = {
    repo: repoUrl,
    idProvider: idProvider,
  };

  const result = await graphQLClient.request<AddRepoMutation>(
    ADD_REPO,
    variables
  );

  return result.createRepo?.repo?.id;
}

async function addGitSource(sourceName: string) : Promise<UUID | undefined> {
  const variables = {
    name: sourceName,
    vendor: "github",
    settings: {
      url: "https://github.com",
    },
  };

  const result = await graphQLClient.request<AddGitSourceMutation>(
    ADD_GIT_SOURCE,
    variables
  );
  return result.createProvider?.provider?.id;
}

async function getReposStatus() : Promise<GetReposStatusQuery> {

  const result = await graphQLClient.request<GetReposStatusQuery>(GET_REPOS_STATUS);
  return result;
}

async function checkSyncCompleted(statusResult: GetReposStatusQuery, total: number) {
    if (!statusResult.repos) {
      return false;
    }
  
    const nodes = statusResult.repos.nodes;
    if (!nodes || nodes.length !== statusResult.repos.totalCount || nodes.length !== total) {
      return false;
    }
  
    for (const node of nodes) {
      if (!node.stats || node.stats.last_sync_time === null) {
        return false;
      }
    }
  
    return true;
}

async function removeGitSource(idProvider: UUID) : Promise<boolean> {
  const variables = {
    idProvider: idProvider,
  };

  const result = await graphQLClient.request<RemoveGitSourceMutation>(
    REMOVE_GIT_SOURCE,
    variables
  );

  return true;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log("start script");

main()
  .catch((err) => {
    console.log("ex script " + err);
  })
  .finally(() => {
    console.log("end script");
  });
