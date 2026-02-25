import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectVariableValues } from '@/store/variablesSlice/selectors';
import { useActionFlowHandler } from '@/services/actionFlows';
import {
  type ComponentNode,
  type ComponentPrototype,
  type NodeRef,
  isNodeRef,
  isVariableRef,
} from '@/types';
import { getValueByPath, setValueByPath } from './slotPath';
import { type PreviewMode, usePreviewMode } from './previewMode';

export type RenderNodeRef = (nodeId: string) => React.ReactNode;

export type ResolvePropsForNode = (args: {
  node: ComponentNode;
  componentPrototype: ComponentPrototype;
}) => Record<string, unknown>;

const RenderNodeRefContext = React.createContext<RenderNodeRef | null>(null);

export const RenderNodeRefProvider: React.FC<{
  renderNodeRef: RenderNodeRef;
  children: React.ReactNode;
}> = ({ renderNodeRef, children }) => {
  return (
    <RenderNodeRefContext.Provider value={renderNodeRef}>{children}</RenderNodeRefContext.Provider>
  );
};

export const useRenderNodeRefs = (nodeRefs: unknown[]): React.ReactNode[] => {
  const renderNodeRef = React.useContext(RenderNodeRefContext);
  const validRefs = React.useMemo(() => nodeRefs.filter(isNodeRef) as NodeRef[], [nodeRefs]);

  if (!renderNodeRef) {
    throw new Error('RenderNodeRefProvider not initialized');
  }

  return React.useMemo(
    () => validRefs.map((ref) => renderNodeRef(ref.nodeId)),
    [validRefs, renderNodeRef],
  );
};

const resolveVariableRefsInValue = (
  value: unknown,
  variableValues: Record<string, unknown>,
): unknown => {
  if (isVariableRef(value)) {
    return variableValues[value.variableName];
  }

  if (React.isValidElement(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveVariableRefsInValue(item, variableValues));
  }

  if (isNodeRef(value) || value === null || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [key, childValue]) => {
      acc[key] = resolveVariableRefsInValue(childValue, variableValues);
      return acc;
    },
    {} as Record<string, unknown>,
  );
};

const getActionFlowPropPaths = (componentPrototype: ComponentPrototype): string[] => {
  return Object.values(componentPrototype.propsTypes || {})
    .filter((prop) => prop.type === 'actionFlow')
    .map((prop) => prop.name);
};

const resolveActionFlowProps = ({
  props,
  actionFlowPropPaths,
  createFlowHandler,
  nodeId,
  nodeProps,
}: {
  props: Record<string, unknown>;
  actionFlowPropPaths: string[];
  createFlowHandler: ReturnType<typeof useActionFlowHandler>['createFlowHandler'];
  nodeId: string;
  nodeProps: Record<string, unknown>;
}): Record<string, unknown> => {
  return actionFlowPropPaths.reduce((acc, propPath) => {
    const flowId = getValueByPath(acc, propPath);
    if (typeof flowId !== 'string' || !flowId) {
      return acc;
    }

    return setValueByPath(
      acc,
      propPath,
      createFlowHandler(flowId, {
        componentId: nodeId,
        componentProps: nodeProps,
        eventName: propPath,
      }),
    );
  }, props);
};

const resolvePropsForNode = ({
  node,
  componentPrototype,
  previewMode,
  variableValues,
  createFlowHandler,
}: {
  node: ComponentNode;
  componentPrototype: ComponentPrototype;
  previewMode: PreviewMode;
  variableValues: Record<string, unknown>;
  createFlowHandler: ReturnType<typeof useActionFlowHandler>['createFlowHandler'];
}): Record<string, unknown> => {
  const nodeProps = node.props || {};
  const mergedProps: Record<string, unknown> = {
    ...(previewMode === 'edit' && (node.type === 'Table' || node.isContainer)
      ? { previewNodeId: node.id }
      : {}),
    ...(componentPrototype.defaultProps || {}),
    ...nodeProps,
  };

  if (node.isContainer) {
    mergedProps.children = (node.childrenIds ?? []).map((nodeId) => ({
      type: 'nodeRef',
      nodeId,
    }));
  }

  const variableResolvedProps = resolveVariableRefsInValue(mergedProps, variableValues) as Record<
    string,
    unknown
  >;

  const actionFlowPropPaths = getActionFlowPropPaths(componentPrototype);
  const actionResolvedProps = resolveActionFlowProps({
    props: variableResolvedProps,
    actionFlowPropPaths,
    createFlowHandler,
    nodeId: node.id,
    nodeProps,
  });

  return actionResolvedProps;
};

export const usePropResolver = (): ResolvePropsForNode => {
  const previewMode = usePreviewMode();
  const variableValues = useAppSelector(selectVariableValues);
  const { createFlowHandler } = useActionFlowHandler();

  return React.useCallback(
    ({ node, componentPrototype }) => {
      return resolvePropsForNode({
        node,
        componentPrototype,
        previewMode,
        variableValues,
        createFlowHandler,
      });
    },
    [createFlowHandler, previewMode, variableValues],
  );
};
