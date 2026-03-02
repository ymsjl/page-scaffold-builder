export const PROJECT_SNAPSHOT_SCHEMA_VERSION = 1;

export type ProjectMeta = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type ProjectSnapshot = {
  schemaVersion: number;
  meta: ProjectMeta;
  componentTree: Record<string, any>;
  variables: Record<string, any>;
  entityModels: Record<string, any>;
  actionFlows: Record<string, any>;
  ui?: Record<string, any>;
};

export type ProjectListItem = Pick<ProjectMeta, 'id' | 'name' | 'updatedAt'> & {
  description?: string;
};
