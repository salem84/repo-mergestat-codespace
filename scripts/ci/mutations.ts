import { gql } from "graphql-request";


// REPOSITORY 
export const ADD_REPO = gql`
  mutation addRepo($repo: String!, $idProvider: UUID!) {
    createRepo(input: { repo: { repo: $repo, provider: $idProvider } }) {
      repo {
        id
        repo
      }
    }
  }
`;

export const ADD_GIT_SOURCE = gql`
  mutation addGitSource($name: String!, $settings: JSON!, $vendor: String!) {
    createProvider(
      input: { provider: { name: $name, vendor: $vendor, settings: $settings } }
    ) {
      provider {
        id
        name
      }
    }
  }
`;

export const REMOVE_GIT_SOURCE = gql`
  mutation removeGitSource($idProvider: UUID!) {
    deleteProvider(input: {id: $idProvider}) {
      deletedProviderNodeId
    }
  }
`

// SYNC

export const SYNC_NOW = gql`
  mutation sync($syncId: UUID!, $typeGroup: String!) {
    createRepoSyncQueue(
      input: {
        repoSyncQueue: {
          repoSyncId: $syncId
          status: "QUEUED"
          typeGroup: $typeGroup
        }
      }
    ) {
      repoSyncQueue {
        id
        status
        createdAt
      }
    }
  }
`;

export const ADD_CONTAINER_SYNC_SCHEDULE = gql`
  mutation addContainerSyncSchedule($syncId: UUID!) {
    createContainerSyncSchedule(
      input: { containerSyncSchedule: { syncId: $syncId } }
    ) {
      containerSyncSchedule {
        id
      }
    }
  }
`;

export const ENABLE_CONTAINER_SYNC = gql`
  mutation enableContainerSync($repoId: UUID!, $imageId: UUID!) {
    createContainerSync(
      input: { containerSync: { repoId: $repoId, imageId: $imageId } }
    ) {
      containerSync {
        id
        image {
          name
        }
      }
    }
  }
`;

export const ENABLE_CONTAINER_SYNC_FOR_ALL = gql`
  mutation enableCSForAll($imageId: UUID!, $providerId: UUID!) {
    bulkEnableSync(image: $imageId, provider: $providerId)
  }
`;
