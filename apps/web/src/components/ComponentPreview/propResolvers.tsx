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

const resolveActionBindings = ({
  props,
  componentPrototype,
  actionBindings,
  createFlowHandler,
  nodeId,
  nodeProps,
}: {
  props: Record<string, unknown>;
  componentPrototype: ComponentPrototype;
  actionBindings?: Record<string, string>;
  createFlowHandler: ReturnType<typeof useActionFlowHandler>['createFlowHandler'];
  nodeId: string;
  nodeProps: Record<string, unknown>;
}) => {
  const events = componentPrototype.supportedEvents || [];
  return events.reduce((acc, event) => {
    const flowId = actionBindings?.[event.eventName];
    if (!flowId) return acc;
    return {
      ...acc,
      [event.eventName]: createFlowHandler(flowId, {
        componentId: nodeId,
        componentProps: nodeProps,
        eventName: event.eventName,
      }),
    };
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
    ...(previewMode === 'edit' ? { previewNodeId: node.id } : {}),
    ...(componentPrototype.defaultProps || {}),
    ...nodeProps,
  };

  if (node.isContainer && typeof mergedProps.children === 'undefined') {
    mergedProps.children = (node.childrenIds ?? []).map((nodeId) => ({
      type: 'nodeRef',
      nodeId,
    }));
  }

  const variableResolvedProps = resolveVariableRefsInValue(mergedProps, variableValues) as Record<
    string,
    unknown
  >;

  const actionResolvedProps = resolveActionBindings({
    props: variableResolvedProps,
    componentPrototype,
    actionBindings: node.actionBindings,
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
