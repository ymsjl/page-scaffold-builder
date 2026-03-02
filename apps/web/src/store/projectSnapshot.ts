import { PROJECT_SNAPSHOT_SCHEMA_VERSION } from '@/types/ProjectSnapshot';
import type { ProjectMeta, ProjectSnapshot } from '@/types/ProjectSnapshot';
import { makeIdCreator } from '@/utils/makeIdCreator';
import { hydrateFromSnapshot as hydrateComponentTree } from './componentTreeSlice/componentTreeSlice';
import { hydrateFromSnapshot as hydrateVariables } from './variablesSlice/variablesSlice';
import { hydrateFromSnapshot as hydrateEntityModels } from './entityModelSlice/entityModelSlice';
import { hydrateFromSnapshot as hydrateActionFlows } from './actionFlows/actionFlowsSlice';
import { setCurrentProject } from './projectSlice/projectSlice';
import type { RootState } from './rootReducer';
import type { AppDispatch } from './storeTypes';

const makeProjectId = makeIdCreator('project');

const createProjectMeta = (name = 'Untitled Project'): ProjectMeta => {
  const now = Date.now();
  return {
    id: makeProjectId(),
    name,
    createdAt: now,
    updatedAt: now,
  };
};

export const buildProjectSnapshot = (
  state: RootState,
  metaOverrides?: Partial<ProjectMeta>,
  options?: { forceNewId?: boolean },
): ProjectSnapshot => {
  const baseMeta = state.project.currentProject ?? createProjectMeta();
  const now = Date.now();
  const nextId = options?.forceNewId ? makeProjectId() : (metaOverrides?.id ?? baseMeta.id);
  const nextMeta: ProjectMeta = {
    ...baseMeta,
    ...metaOverrides,
    id: nextId,
    name: metaOverrides?.name ?? baseMeta.name,
    createdAt: baseMeta.createdAt || now,
    updatedAt: now,
  };

  return {
    schemaVersion: PROJECT_SNAPSHOT_SCHEMA_VERSION,
    meta: nextMeta,
    componentTree: {
      selectedNodeId: state.componentTree.selectedNodeId,
      expandedKeys: state.componentTree.expandedKeys,
      normalizedTree: state.componentTree.normalizedTree,
    },
    variables: {
      variables: state.variables.variables,
      variableValues: state.variables.variableValues,
    },
    entityModels: {
      entityModel: state.entityModel.entityModel,
    },
    actionFlows: {
      flows: state.actionFlows.flows,
      activeFlowId: state.actionFlows.activeFlowId,
      selectedNodeIds: state.actionFlows.selectedNodeIds,
    },
  };
};

export const migrateProjectSnapshot = (snapshot: ProjectSnapshot): ProjectSnapshot => {
  if (snapshot.schemaVersion === PROJECT_SNAPSHOT_SCHEMA_VERSION) return snapshot;

  if (snapshot.schemaVersion < PROJECT_SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported snapshot version: ${snapshot.schemaVersion}. The snapshot is from an older, incompatible schema (current schema version: ${PROJECT_SNAPSHOT_SCHEMA_VERSION}).`,
    );
  }

  throw new Error(
    `Unsupported snapshot version: ${snapshot.schemaVersion}. The snapshot is from a newer, unsupported schema (current schema version: ${PROJECT_SNAPSHOT_SCHEMA_VERSION}).`,
  );
};

export const hydrateProjectSnapshot = (dispatch: AppDispatch, snapshot: ProjectSnapshot) => {
  const migrated = migrateProjectSnapshot(snapshot);
  dispatch(setCurrentProject(migrated.meta));
  dispatch(hydrateComponentTree(migrated.componentTree));
  dispatch(hydrateVariables(migrated.variables));
  dispatch(hydrateEntityModels(migrated.entityModels));
  dispatch(hydrateActionFlows(migrated.actionFlows));
};
