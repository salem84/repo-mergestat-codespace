import { UUID } from "crypto";

export type GetGitSourcesListQuery = {
  all?: { totalCount: number } | null;
  providers?: {
    totalCount: number;
    nodes: Array<{
      id: UUID;
      name: string;
      description?: string | null;
      createdAt: any;
      settings: any;
      vendor: string;
      reposByProvider: { totalCount: number };
    }>;
  } | null;
};

export type AddGitSourceMutation = {
  createProvider?: {
    provider?: {
      id: UUID;
      name: string;
    } | null;
  } | null;
};

export type AddRepoMutation = {
  createRepo?: {
    repo?: {
      id: UUID;
      repo: string;
    } | null;
  } | null;
};

export type SyncNowContainerMutation = {
  syncNow?: {
    boolean?: boolean | null;
  } | null;
};

export type AddContainerSyncScheduleMutation = {
  createContainerSyncSchedule?: {
    containerSyncSchedule?: {
      id: UUID;
    } | null;
  } | null;
};

export type EnableContainerSyncMutation = {
  createContainerSync?: {
    containerSync?: {
      id: UUID;
      image?: {
        name: string;
      } | null;
    } | null;
  } | null;
};

export type GetContainerSyncsQuery = {
  containerSyncs?: {
    nodes: Array<{
      id: UUID;
      parameters: any;
      latestSyncRuns?: any | null;
      image?: { id: any } | null;
      repo?: { id: any } | null;
      schedule?: { id: any } | null;
    }>;
  } | null;
  all?: {
    totalCount: number;
  } | null;
  containerImages?: {
    totalCount: number;
    nodes: Array<{
      id: UUID;
      name: string;
      description?: string | null;
    }>;
  } | null;
};

export type GetAllContainerImagesQuery = {
  containerImages?: {
    totalCount: number;
    nodes: Array<{
      id: any;
      name: string;
      description?: string | null;
    }>;
  } | null;
};

export type GetReposStatusQuery = {
  repos?: {
    totalCount: number;
    nodes: Array<{
      id: any;
      repo: string;
      createdAt?: any | null;
      stats?: {
        error: number;
        pending: number;
        running: number;
        success: number;
        warning: number;
        sync_count: number;
        last_sync_time: any | null;
      } | null
    }>;
  } | null;
};

export type RemoveGitSourceMutation = { deleteProvider?: { deletedProviderNodeId?: string | null } | null };