import { gql } from 'graphql-request'

export const GET_GIT_SOURCES_LIST = gql`
    query getGitSourcesList($search: String!, $first: Int, $offset: Int) {
      # all: providers {
      #   totalCount
      # }
      providers(
        filter: { name: { includesInsensitive: $search } }
        first: $first
        offset: $offset
      ) {
        totalCount
        nodes {
          id
          #   name
          #   description
          #   createdAt
          #   settings
          #   vendor
          #   reposByProvider {
          #     totalCount
          #   }
        }
      }
    }
  `;


export const GET_CONTAINER_SYNCS = gql`
  query getContainerSyncs($id: UUID!, $search: String!, $first: Int, $offset: Int) {
    containerSyncs(condition: {repoId: $id}) {
      nodes {
        id
        parameters
        image {
          id
        }
        repo {
          id
        }
        schedule: containerSyncScheduleBySyncId {
          id
        }
        latestSyncRuns
      }
    }
    all: containerImages {
      totalCount
    }
    containerImages(
      filter: {
        or: [
          {name: {includesInsensitive: $search}}
        ]
      }
      first: $first
      offset: $offset
    ) {
      totalCount
      nodes {
        id
        name
        description
      }
    }
  }
`

export const GET_ALL_CONTAINER_IMAGES = gql`
  query getAllContainerImages {
    containerImages(orderBy: NAME_ASC) {
      totalCount
      nodes {
        id
        name
        description
      }
    }
  }
`

export const GET_SYNC_HISTORY_LOGS = gql`
  query getSyncHistoryLogs($repoId: UUID!, $syncId: UUID!) {
    repo(id: $repoId) {
      id
      repo
      provider: providerByProvider {
        id
        name
        vendor
        settings
      }
      repoSyncs(condition: {id: $syncId}) {
        nodes {
          id
          syncType
          scheduleEnabled
          repoSyncTypeBySyncType {
            shortName
            description
            typeGroup
          }
          repoSyncQueues(first: 50, orderBy: CREATED_AT_DESC) {
            nodes {
              id
              status
              createdAt
              doneAt
              startedAt
              hasError
              warnings: repoSyncLogs(condition: {logType: "WARNING"}) {
                totalCount
              }
              repoSyncLogs {
                totalCount
                nodes {
                  logType
                  message
                  createdAt
                }
              }
            }
          }
        }
      }
    }
  }
`

export const GET_REPOS_STATUS = gql`
  query getReposContainers {
    repos(
      orderBy: [CREATED_AT_DESC, REPO_DESC]
    ) {
      totalCount
      nodes {
        id
        repo
        createdAt
        stats
      }
    } 
  }
`
