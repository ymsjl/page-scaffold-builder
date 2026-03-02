import { strToU8, zipSync } from 'fflate';
import type { ComponentNode } from '@/types';
import type { ProjectSnapshot } from '@/types/ProjectSnapshot';

export type CodeExportFileMap = Record<string, string>;

type PageExportInfo = {
  id: string;
  fileBase: string;
  componentName: string;
};

const toFileName = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase();

const toComponentName = (name: string) => {
  const cleaned = name
    .replace(/[^a-zA-Z0-9-_/]/g, '')
    .split(/[-_/]/)
    .filter(Boolean)
    .map((segment) => {
      const first = segment.charAt(0);
      return `${first ? first.toUpperCase() : ''}${segment.slice(1)}`;
    });

  const base = cleaned.join('') || 'ExportedPage';
  return base.match(/^[A-Za-z]/) ? base : `Page${base}`;
};

const collectPageNodes = (snapshot: ProjectSnapshot): ComponentNode[] => {
  const nodes = snapshot.componentTree?.normalizedTree?.entities?.nodes as
    | Record<string, ComponentNode>
    | undefined;
  if (!nodes || typeof nodes !== 'object') {
    return [];
  }
  return Object.values(nodes).filter((node) => node?.type === 'Page');
};

const buildPageExports = (snapshot: ProjectSnapshot): PageExportInfo[] => {
  const pages = collectPageNodes(snapshot);
  if (pages.length === 0) {
    throw new Error('NO_PAGES');
  }

  const usedNames = new Map<string, number>();

  return pages.map((page) => {
    const baseName = toFileName(page.name || page.id || 'page') || 'page';
    const nextIndex = (usedNames.get(baseName) || 0) + 1;
    usedNames.set(baseName, nextIndex);

    const fileBase = nextIndex > 1 ? `${baseName}-${nextIndex}` : baseName;
    const componentName = toComponentName(fileBase);

    return {
      id: page.id,
      fileBase,
      componentName,
    };
  });
};

const buildSnapshotTs = (snapshot: ProjectSnapshot) => {
  const json = JSON.stringify(snapshot, null, 2);
  return `export const snapshot = ${json} as const;\n\nexport type Snapshot = typeof snapshot;\n`;
};

const buildPageFile = (page: PageExportInfo) => `import React from 'react';
import { PageRenderer } from '../runtime/renderer';
import { snapshot } from '../snapshot';

export const ${page.componentName}: React.FC = () => (
  <PageRenderer snapshot={snapshot} rootId="${page.id}" />
);
`;

const buildIndexFile = (pages: PageExportInfo[]) => {
  const exports = pages
    .map((page) => `export { ${page.componentName} } from './pages/${page.fileBase}';`)
    .join('\n');

  return `${exports}\n\nexport { PageRenderer } from './runtime/renderer';\nexport { registerComponent, registerComponents } from './runtime/registry';\nexport { snapshot } from './snapshot';\n`;
};

const buildVitePackageJson = () => `{
  "name": "exported-page-scaffold",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.23.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.2.0"
  }
};
`;

const buildViteIndexHtml = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exported Pages</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const buildViteConfig = () => `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;

const buildTsConfig = () => `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
`;

const buildRegisterComponentsFile = () => `import type { ComponentRegistration } from './types';
import { registerComponents } from './registry';

export const registerRuntimeComponents = () => {
  const components: Record<string, ComponentRegistration> = {
    // TODO: Map your runtime components here.
    // Example:
    // Table: { component: ProTable, supportedEvents: [{ eventName: 'onChange' }] },
    // Form: { component: BaseSchemaForm, supportedEvents: [{ eventName: 'onSubmit' }] },
  };

  registerComponents(components);
};
`;

const buildMainFile = () => `import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { registerRuntimeComponents } from './runtime/registerComponents';
import { router } from './routes';

registerRuntimeComponents();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
`;

const buildAppFile = () => `import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const App: React.FC = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <Link to="/">Home</Link>
      </header>
      <Outlet />
    </div>
  );
};
`;

const buildRoutesFile = (pages: PageExportInfo[]) => {
  const pageImports = pages
    .map((page) => `import { ${page.componentName} } from './pages/${page.fileBase}';`)
    .join('\n');

  const pageList = pages
    .map((page) => `    { path: '/pages/${page.fileBase}', name: '${page.componentName}' },`)
    .join('\n');

  const pageRoutes = pages
    .map((page) => `      { path: 'pages/${page.fileBase}', element: <${page.componentName} /> },`)
    .join('\n');

  return `${pageImports}
import React from 'react';
import { createBrowserRouter, Link } from 'react-router-dom';
import { App } from './App';

const pageList = [
${pageList}
];

const Home: React.FC = () => (
  <div>
    <h2>Pages</h2>
    <ul>
      {pageList.map((page) => (
        <li key={page.path}>
          <Link to={page.path}>{page.name}</Link>
        </li>
      ))}
    </ul>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
${pageRoutes}
    ],
  },
]);
`;
};

const buildRuntimeFiles = (): CodeExportFileMap => ({
  'runtime/types.ts': `import type React from 'react';\n\nexport type PrimitiveVariableValue = boolean | string | number;\n\nexport type NodeRef = { type: 'nodeRef'; nodeId: string };\nexport type VariableRef = { type: 'variableRef'; variableName: string };\n\nexport type ComponentNode = {\n  id: string;\n  name?: string;\n  type: string;\n  props?: Record<string, unknown>;\n  isContainer?: boolean;\n  parentId?: string | null;\n  childrenIds?: string[];\n  actionBindings?: Record<string, string>;\n};\n\nexport type NormalizedComponentTree = {\n  entities: {\n    nodes: Record<string, ComponentNode>;\n  };\n  result: string[];\n};\n\nexport type ProjectSnapshot = {\n  schemaVersion: number;\n  meta: {\n    id: string;\n    name: string;\n    createdAt: number;\n    updatedAt: number;\n    description?: string;\n  };\n  componentTree: {\n    normalizedTree: NormalizedComponentTree;\n    selectedNodeId?: string | null;\n    expandedKeys?: string[];\n  };\n  variables?: {\n    variableValues?: Record<string, PrimitiveVariableValue>;\n  };\n  actionFlows?: {\n    flows?: {\n      ids?: string[];\n      entities?: Record<string, ActionFlow>;\n    };\n  };\n};\n\nexport type ActionNodeBase = {\n  id: string;\n  type: string;\n  label: string;\n  params?: Record<string, unknown>;\n  inputs?: Array<{ id: string; defaultValue?: unknown }>;\n  outputs?: Array<{ id: string }>;\n  disabled?: boolean;\n};\n\nexport type ActionEdge = {\n  id: string;\n  source: string;\n  target: string;\n  sourcePort?: string;\n  targetPort?: string;\n  condition?: string;\n};\n\nexport type ActionFlow = {\n  id: string;\n  name: string;\n  nodes: ActionNodeBase[];\n  edges: ActionEdge[];\n  entryNodeId?: string;\n};\n\nexport type NodeExecutionResult = {\n  nodeId: string;\n  success: boolean;\n  outputs: Record<string, unknown>;\n  error?: string;\n  duration?: number;\n};\n\nexport type FlowExecutionContext = {\n  flowId: string;\n  componentId?: string;\n  componentProps?: Record<string, unknown>;\n  eventData?: {\n    eventName?: string;\n    payload?: unknown;\n    args?: unknown[];\n  };\n  variables: Record<string, PrimitiveVariableValue>;\n  nodeOutputs: Record<string, Record<string, unknown>>;\n  services?: {\n    message?: {\n      success?: (content: string, duration?: number) => void;\n      error?: (content: string, duration?: number) => void;\n      warning?: (content: string, duration?: number) => void;\n      info?: (content: string, duration?: number) => void;\n    };\n    navigate?: (url: string, options?: { replace?: boolean; openInNewTab?: boolean }) => void;\n    setVariableValue?: (name: string, value: PrimitiveVariableValue) => void;\n  };\n};\n\nexport type ComponentRegistration = {\n  component: React.ComponentType<any> | string;\n  defaultProps?: Record<string, unknown>;\n  supportedEvents?: Array<{\n    eventName: string;\n    label?: string;\n    description?: string;\n  }>;\n};\n`,
  'runtime/registry.ts': `import type { ComponentRegistration } from './types';\n\nconst registry = new Map<string, ComponentRegistration>();\n\nexport const registerComponent = (key: string, registration: ComponentRegistration) => {\n  registry.set(key, registration);\n};\n\nexport const registerComponents = (components: Record<string, ComponentRegistration>) => {\n  Object.entries(components).forEach(([key, registration]) => {\n    registerComponent(key, registration);\n  });\n};\n\nexport const getRegisteredComponent = (key: string): ComponentRegistration | undefined =>\n  registry.get(key);\n`,
  'runtime/propsResolver.ts': `import React from 'react';\nimport type {\n  ComponentNode,\n  ComponentRegistration,\n  PrimitiveVariableValue,\n  VariableRef,\n  NodeRef,\n} from './types';\n\nexport const isNodeRef = (value: unknown): value is NodeRef =>\n  typeof value === 'object' &&\n  value !== null &&\n  'type' in value &&\n  (value as NodeRef).type === 'nodeRef' &&\n  'nodeId' in value &&\n  typeof (value as NodeRef).nodeId === 'string';\n\nexport const isVariableRef = (value: unknown): value is VariableRef =>\n  typeof value === 'object' &&\n  value !== null &&\n  'type' in value &&\n  (value as VariableRef).type === 'variableRef' &&\n  'variableName' in value &&\n  typeof (value as VariableRef).variableName === 'string';\n\nexport const resolveVariableRefsInValue = (\n  value: unknown,\n  variableValues: Record<string, PrimitiveVariableValue>,\n): unknown => {\n  if (isVariableRef(value)) {\n    return variableValues[value.variableName];\n  }\n\n  if (Array.isArray(value)) {\n    return value.map((item) => resolveVariableRefsInValue(item, variableValues));\n  }\n\n  if (isNodeRef(value) || value === null || typeof value !== 'object') {\n    return value;\n  }\n\n  return Object.entries(value as Record<string, unknown>).reduce(\n    (acc, [key, childValue]) => {\n      acc[key] = resolveVariableRefsInValue(childValue, variableValues);\n      return acc;\n    },\n    {} as Record<string, unknown>,\n  );\n};\n\nexport const resolveNodeRefsInValue = (\n  value: unknown,\n  renderNodeRef: (nodeId: string) => React.ReactNode,\n): unknown => {\n  if (isNodeRef(value)) {\n    return renderNodeRef(value.nodeId);\n  }\n\n  if (Array.isArray(value)) {\n    return value.map((item) => resolveNodeRefsInValue(item, renderNodeRef));\n  }\n\n  if (value === null || typeof value !== 'object') {\n    return value;\n  }\n\n  return Object.entries(value as Record<string, unknown>).reduce(\n    (acc, [key, childValue]) => {\n      acc[key] = resolveNodeRefsInValue(childValue, renderNodeRef);\n      return acc;\n    },\n    {} as Record<string, unknown>,\n  );\n};\n\nexport const resolveActionBindings = ({\n  props,\n  registration,\n  actionBindings,\n  createFlowHandler,\n  nodeId,\n  nodeProps,\n}: {\n  props: Record<string, unknown>;\n  registration: ComponentRegistration;\n  actionBindings?: Record<string, string>;\n  createFlowHandler: (\n    flowId: string,\n    options?: {\n      componentId?: string;\n      componentProps?: Record<string, unknown>;\n      eventName?: string;\n    },\n  ) => (eventData?: unknown, ...args: unknown[]) => Promise<void>;\n  nodeId: string;\n  nodeProps: Record<string, unknown>;\n}): Record<string, unknown> => {\n  const events = registration.supportedEvents || [];\n  return events.reduce((acc, event) => {\n    const flowId = actionBindings?.[event.eventName];\n    if (!flowId) return acc;\n    return {\n      ...acc,\n      [event.eventName]: createFlowHandler(flowId, {\n        componentId: nodeId,\n        componentProps: nodeProps,\n        eventName: event.eventName,\n      }),\n    };\n  }, props);\n};\n\nexport const resolvePropsForNode = ({\n  node,\n  registration,\n  variableValues,\n  renderNodeRef,\n  createFlowHandler,\n}: {\n  node: ComponentNode;\n  registration: ComponentRegistration;\n  variableValues: Record<string, PrimitiveVariableValue>;\n  renderNodeRef: (nodeId: string) => React.ReactNode;\n  createFlowHandler: (\n    flowId: string,\n    options?: {\n      componentId?: string;\n      componentProps?: Record<string, unknown>;\n      eventName?: string;\n    },\n  ) => (eventData?: unknown, ...args: unknown[]) => Promise<void>;\n}): Record<string, unknown> => {\n  const nodeProps = node.props || {};\n  const mergedProps: Record<string, unknown> = {\n    ...(registration.defaultProps || {}),\n    ...nodeProps,\n  };\n\n  if (node.isContainer && typeof mergedProps.children === 'undefined') {\n    mergedProps.children = (node.childrenIds || []).map((nodeId) => ({\n      type: 'nodeRef',\n      nodeId,\n    }));\n  }\n\n  const variableResolvedProps = resolveVariableRefsInValue(\n    mergedProps,\n    variableValues,\n  ) as Record<string, unknown>;\n\n  const nodeResolvedProps = resolveNodeRefsInValue(\n    variableResolvedProps,\n    renderNodeRef,\n  ) as Record<string, unknown>;\n\n  return resolveActionBindings({\n    props: nodeResolvedProps,\n    registration,\n    actionBindings: node.actionBindings,\n    createFlowHandler,\n    nodeId: node.id,\n    nodeProps,\n  });\n};\n`,
  'runtime/actionFlowRuntime.ts': `import type {\n  ActionEdge,\n  ActionFlow,\n  ActionNodeBase,\n  FlowExecutionContext,\n  NodeExecutionResult,\n  PrimitiveVariableValue,\n} from './types';\n\nexport type FlowHandlerOptions = {\n  componentId?: string;\n  componentProps?: Record<string, unknown>;\n  eventName?: string;\n};\n\nexport type CreateFlowHandler = (\n  flowId: string,\n  options?: FlowHandlerOptions,\n) => (eventData?: unknown, ...args: unknown[]) => Promise<void>;\n\ntype NodeStrategy = {\n  type: string;\n  execute: (\n    node: ActionNodeBase,\n    inputs: Record<string, unknown>,\n    context: FlowExecutionContext,\n  ) => Promise<Record<string, unknown>>;\n};\n\nclass NodeStrategyRegistry {\n  private strategies = new Map<string, NodeStrategy>();\n\n  register(strategy: NodeStrategy) {\n    this.strategies.set(strategy.type, strategy);\n  }\n\n  hasStrategy(type: string) {\n    return this.strategies.has(type);\n  }\n\n  getStrategy(type: string) {\n    const strategy = this.strategies.get(type);\n    if (!strategy) {\n      throw new Error('No strategy registered for type: ' + type);\n    }\n    return strategy;\n  }\n}\n\nclass FlowExecutor {\n  private static readonly CONDITION_OPERATOR_REGEX = /(===|!==|>=|<=|>|<)/;\n\n  constructor(private registry: NodeStrategyRegistry) {}\n\n  async executeFlow(flow: ActionFlow, context: FlowExecutionContext): Promise<NodeExecutionResult[]> {\n    const results: NodeExecutionResult[] = [];\n    const nodeMap = new Map(flow.nodes.map((node) => [node.id, node]));\n    const edgesBySource = FlowExecutor.groupEdgesBySource(flow.edges);\n    const entryNodes = FlowExecutor.findEntryNodes(flow);\n\n    if (entryNodes.length === 0) {\n      throw new Error('No entry nodes found in flow');\n    }\n\n    const queue = [...entryNodes];\n    const executed = new Set<string>();\n\n    await this.executeQueueBatch(queue, executed, results, flow, context, nodeMap, edgesBySource);\n    return results;\n  }\n\n  private async executeQueueBatch(\n    queue: ActionNodeBase[],\n    executed: Set<string>,\n    results: NodeExecutionResult[],\n    flow: ActionFlow,\n    context: FlowExecutionContext,\n    nodeMap: Map<string, ActionNodeBase>,\n    edgesBySource: Map<string, ActionEdge[]>,\n  ): Promise<void> {\n    if (queue.length === 0) return;\n\n    const readyNodes = queue.filter((node) =>\n      FlowExecutor.areInputsSatisfied(node, flow.edges, executed),\n    );\n\n    if (readyNodes.length === 0) {\n      throw new Error('Circular dependency detected in flow');\n    }\n\n    const batchResults = await Promise.all(\n      readyNodes.map((node) => this.executeNode(node, flow, context)),\n    );\n\n    results.push(...batchResults);\n    batchResults.forEach((result) => {\n      executed.add(result.nodeId);\n      context.nodeOutputs[result.nodeId] = result.outputs;\n    });\n\n    readyNodes.forEach((node) => {\n      const index = queue.indexOf(node);\n      if (index >= 0) queue.splice(index, 1);\n\n      const outgoingEdges = edgesBySource.get(node.id) || [];\n      outgoingEdges.forEach((edge) => {\n        if (edge.condition && !FlowExecutor.evaluateCondition(edge.condition, context)) {\n          return;\n        }\n        const targetNode = nodeMap.get(edge.target);\n        if (targetNode && !executed.has(targetNode.id) && !queue.includes(targetNode)) {\n          queue.push(targetNode);\n        }\n      });\n    });\n\n    await this.executeQueueBatch(queue, executed, results, flow, context, nodeMap, edgesBySource);\n  }\n\n  private async executeNode(\n    node: ActionNodeBase,\n    flow: ActionFlow,\n    context: FlowExecutionContext,\n  ): Promise<NodeExecutionResult> {\n    if (node.disabled) {\n      return { nodeId: node.id, success: true, outputs: {} };\n    }\n\n    const startTime = Date.now();\n    try {\n      const strategyType = this.resolveStrategyType(node.type);\n      if (!this.registry.hasStrategy(strategyType)) {\n        throw new Error('Unknown node type: ' + node.type);\n      }\n\n      const strategy = this.registry.getStrategy(strategyType);\n      const inputs = FlowExecutor.resolveNodeInputs(node, flow, context);\n      const outputs = await strategy.execute(node, inputs, context);\n\n      return {\n        nodeId: node.id,\n        success: true,\n        outputs,\n        duration: Date.now() - startTime,\n      };\n    } catch (error) {\n      return {\n        nodeId: node.id,\n        success: false,\n        outputs: {},\n        error: error instanceof Error ? error.message : String(error),\n        duration: Date.now() - startTime,\n      };\n    }\n  }\n\n  private resolveStrategyType(nodeType: string): string {\n    const aliasMap: Record<string, string> = {\n      'action.httpRequest': 'httpRequest',\n      'action.navigate': 'navigate',\n      'action.showMessage': 'showMessage',\n      'action.setVariable': 'setVariable',\n      'control.delay': 'delay',\n    };\n\n    const mapped = aliasMap[nodeType];\n    if (mapped && this.registry.hasStrategy(mapped)) {\n      return mapped;\n    }\n\n    return nodeType;\n  }\n\n  private static resolveNodeInputs(\n    node: ActionNodeBase,\n    flow: ActionFlow,\n    context: FlowExecutionContext,\n  ): Record<string, unknown> {\n    const inputs: Record<string, unknown> = {};\n    const incomingEdges = flow.edges.filter((edge) => edge.target === node.id);\n\n    incomingEdges.forEach((edge) => {\n      const sourceOutputs = context.nodeOutputs[edge.source];\n      if (\n        sourceOutputs &&\n        typeof edge.sourcePort === 'string' &&\n        typeof edge.targetPort === 'string' &&\n        edge.sourcePort in sourceOutputs\n      ) {\n        inputs[edge.targetPort] = sourceOutputs[edge.sourcePort];\n      }\n    });\n\n    (node.inputs || []).forEach((port) => {\n      if (!(port.id in inputs) && port.defaultValue !== undefined) {\n        inputs[port.id] = port.defaultValue;\n      }\n    });\n\n    return inputs;\n  }\n\n  private static areInputsSatisfied(\n    node: ActionNodeBase,\n    edges: ActionEdge[],\n    executed: Set<string>,\n  ): boolean {\n    const incomingEdges = edges.filter((edge) => edge.target === node.id);\n    if (incomingEdges.length === 0) return true;\n    return incomingEdges.every((edge) => executed.has(edge.source));\n  }\n\n  private static findEntryNodes(flow: ActionFlow): ActionNodeBase[] {\n    if (flow.entryNodeId) {\n      const entry = flow.nodes.find((node) => node.id === flow.entryNodeId);\n      return entry ? [entry] : [];\n    }\n\n    const nodesWithInput = new Set(flow.edges.map((edge) => edge.target));\n    return flow.nodes.filter((node) => !nodesWithInput.has(node.id));\n  }\n\n  private static groupEdgesBySource(edges: ActionEdge[]): Map<string, ActionEdge[]> {\n    const map = new Map<string, ActionEdge[]>();\n    edges.forEach((edge) => {\n      if (!map.has(edge.source)) {\n        map.set(edge.source, []);\n      }\n      map.get(edge.source)!.push(edge);\n    });\n    return map;\n  }\n\n  private static evaluateCondition(condition: string, context: FlowExecutionContext): boolean {\n    const trimmed = condition.trim();\n    if (!trimmed) return true;\n    if (trimmed === 'true') return true;\n    if (trimmed === 'false') return false;\n\n    const orSegments = trimmed.split('||').map((segment) => segment.trim());\n    if (orSegments.length > 1) {\n      return orSegments.some((segment) => FlowExecutor.evaluateCondition(segment, context));\n    }\n\n    const andSegments = trimmed.split('&&').map((segment) => segment.trim());\n    if (andSegments.length > 1) {\n      return andSegments.every((segment) => FlowExecutor.evaluateCondition(segment, context));\n    }\n\n    return FlowExecutor.evaluateAtomicCondition(trimmed, context);\n  }\n\n  private static evaluateAtomicCondition(\n    expression: string,\n    context: FlowExecutionContext,\n  ): boolean {\n    const operatorMatch = expression.match(FlowExecutor.CONDITION_OPERATOR_REGEX);\n    if (!operatorMatch) {\n      return Boolean(FlowExecutor.resolveConditionValue(expression, context));\n    }\n\n    const operator = operatorMatch[0];\n    const [leftToken, rightToken] = expression.split(operator).map((part) => part.trim());\n    const leftValue = FlowExecutor.resolveConditionValue(leftToken, context);\n    const rightValue = FlowExecutor.resolveConditionValue(rightToken, context);\n\n    switch (operator) {\n      case '===':\n        return leftValue === rightValue;\n      case '!==':\n        return leftValue !== rightValue;\n      case '>=':\n        return Number(leftValue) >= Number(rightValue);\n      case '<=':\n        return Number(leftValue) <= Number(rightValue);\n      case '>':\n        return Number(leftValue) > Number(rightValue);\n      case '<':\n        return Number(leftValue) < Number(rightValue);\n      default:\n        return false;\n    }\n  }\n\n  private static resolveConditionValue(token: string, context: FlowExecutionContext): unknown {\n    const trimmed = token.trim();\n    const { variables } = context;\n\n    if (trimmed === 'true') return true;\n    if (trimmed === 'false') return false;\n    if (trimmed === 'null') return null;\n\n    if (\n      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||\n      (trimmed.startsWith("'") && trimmed.endsWith("'"))\n    ) {\n      return trimmed.slice(1, -1);\n    }\n\n    if (trimmed.length > 0 && !Number.isNaN(Number(trimmed))) {\n      return Number(trimmed);\n    }\n\n    if (trimmed.startsWith('variables.')) {\n      return FlowExecutor.getValueByPath(variables, trimmed.slice('variables.'.length));\n    }\n\n    if (trimmed in variables) {\n      return variables[trimmed];\n    }\n\n    return FlowExecutor.getValueByPath(context, trimmed);\n  }\n\n  private static getValueByPath(source: unknown, path: string): unknown {\n    if (!source || typeof source !== 'object' || !path) {\n      return undefined;\n    }\n\n    return path.split('.').reduce<unknown>((current, key) => {\n      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {\n        return (current as Record<string, unknown>)[key];\n      }\n      return undefined;\n    }, source);\n  }\n}\n\nconst toPrimitiveValue = (value: unknown): PrimitiveVariableValue => {\n  if (typeof value === 'boolean' || typeof value === 'number') return value;\n  if (typeof value === 'string') return value;\n  return '';\n};\n\nconst defaultRegistry = () => {\n  const registry = new NodeStrategyRegistry();\n\n  registry.register({\n    type: 'httpRequest',\n    async execute(node, inputs) {\n      const params = node.params || {};\n      const url = (inputs.url ?? params.url) as string;\n      const method = ((inputs.method ?? params.method) as string) || 'GET';\n      const headers = {\n        ...(params.headers as Record<string, unknown>),\n        ...(inputs.headers as Record<string, unknown>),\n      };\n      const body = inputs.body ?? params.body;\n      const timeout = (inputs.timeout ?? params.timeout) as number | undefined;\n\n      const controller = new AbortController();\n      const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : undefined;\n\n      const response = await fetch(url, {\n        method,\n        headers: {\n          'Content-Type': 'application/json',\n          ...(headers || {}),\n        },\n        body: body ? JSON.stringify(body) : undefined,\n        signal: controller.signal,\n      });\n\n      if (timeoutId) clearTimeout(timeoutId);\n\n      let data: unknown;\n      const contentType = response.headers.get('content-type');\n      if (contentType && contentType.includes('application/json')) {\n        data = await response.json();\n      } else {\n        data = await response.text();\n      }\n\n      return {\n        response: data,\n        status: response.status,\n        statusText: response.statusText,\n        success: response.ok,\n        headers: Object.fromEntries(response.headers.entries()),\n      };\n    },\n  });\n\n  registry.register({\n    type: 'navigate',\n    async execute(node, inputs, context) {\n      const params = node.params || {};\n      const path = (inputs.path ?? params.path) as string;\n      const query = (inputs.query ?? params.query) as Record<string, unknown> | undefined;\n      const openInNewTab = Boolean(inputs.openInNewTab ?? params.openInNewTab);\n      const replace = Boolean(inputs.replace ?? params.replace);\n\n      const url = new URL(path, window.location.origin);\n      if (query) {\n        Object.entries(query).forEach(([key, value]) => {\n          url.searchParams.append(key, String(value));\n        });\n      }\n\n      if (context.services?.navigate) {\n        context.services.navigate(url.toString(), { replace, openInNewTab });\n      } else if (openInNewTab) {\n        window.open(url.toString(), '_blank');\n      } else if (replace) {\n        window.location.replace(url.toString());\n      } else {\n        window.location.href = url.toString();\n      }\n\n      return { success: true, url: url.toString() };\n    },\n  });\n\n  registry.register({\n    type: 'showMessage',\n    async execute(node, inputs, context) {\n      const params = node.params || {};\n      const messageType = (inputs.messageType ?? params.messageType) as string;\n      const content = (inputs.content ?? params.content) as string;\n      const duration = Number(inputs.duration ?? params.duration ?? 3000);\n      const message = context.services?.message;\n\n      if (message && typeof message[messageType as keyof typeof message] === 'function') {\n        (message[messageType as keyof typeof message] as (\n          content: string,\n          duration?: number,\n        ) => void)(content, duration / 1000);\n      } else {\n        // eslint-disable-next-line no-console\n        console.info('[' + messageType + ']', content);\n      }\n\n      return { success: true, messageType, content };\n    },\n  });\n\n  registry.register({\n    type: 'delay',\n    async execute(node, inputs) {\n      const params = node.params || {};\n      const duration = Number(inputs.duration ?? params.duration ?? 0);\n      await new Promise<void>((resolve) => {\n        setTimeout(resolve, duration);\n      });\n      return { success: true, duration };\n    },\n  });\n\n  registry.register({\n    type: 'setVariable',\n    async execute(node, inputs, context) {\n      const params = node.params || {};\n      const variableName = String(inputs.variableName ?? params.variableName ?? '');\n      const value = toPrimitiveValue(inputs.value ?? params.value);\n\n      if (!variableName) {\n        throw new Error('Variable name is required');\n      }\n\n      context.variables[variableName] = value;\n      if (context.services?.setVariableValue) {\n        context.services.setVariableValue(variableName, value);\n      }\n\n      return { variableName, value, success: true };\n    },\n  });\n\n  return registry;\n};\n\nexport const createFlowHandlerFactory = ({\n  flows,\n  variables,\n  services,\n  setVariableValue,\n}: {\n  flows?: { ids?: string[]; entities?: Record<string, ActionFlow> };\n  variables: Record<string, PrimitiveVariableValue>;\n  services?: FlowExecutionContext['services'];\n  setVariableValue?: (name: string, value: PrimitiveVariableValue) => void;\n}): CreateFlowHandler => {\n  const registry = defaultRegistry();\n  const executor = new FlowExecutor(registry);\n\n  return (flowId, options) => async (eventData, ...args) => {\n    const flow = flows?.entities?.[flowId];\n    if (!flow) {\n      // eslint-disable-next-line no-console\n      console.warn('Flow ' + flowId + ' not found');\n      return;\n    }\n\n    const context: FlowExecutionContext = {\n      flowId: flow.id,\n      componentId: options?.componentId,\n      componentProps: options?.componentProps,\n      eventData: {\n        eventName: options?.eventName,\n        payload: eventData,\n        args,\n      },\n      variables,\n      nodeOutputs: {},\n      services: {\n        ...services,\n        setVariableValue,\n      },\n    };\n\n    try {\n      await executor.executeFlow(flow, context);\n    } catch (error) {\n      // eslint-disable-next-line no-console\n      console.error('Flow execution failed', error);\n    }\n  };\n};\n`,
  'runtime/renderer.tsx': `import React from 'react';\nimport type {\n  ComponentNode,\n  ProjectSnapshot,\n  PrimitiveVariableValue,\n} from './types';\nimport { getRegisteredComponent } from './registry';\nimport { createFlowHandlerFactory } from './actionFlowRuntime';\nimport { resolvePropsForNode } from './propsResolver';\n\nexport type PageRendererProps = {\n  snapshot: ProjectSnapshot;\n  rootId: string;\n  services?: {\n    message?: {\n      success?: (content: string, duration?: number) => void;\n      error?: (content: string, duration?: number) => void;\n      warning?: (content: string, duration?: number) => void;\n      info?: (content: string, duration?: number) => void;\n    };\n    navigate?: (url: string, options?: { replace?: boolean; openInNewTab?: boolean }) => void;\n  };\n};\n\nexport const PageRenderer: React.FC<PageRendererProps> = ({ snapshot, rootId, services }) => {\n  const nodes = snapshot.componentTree?.normalizedTree?.entities?.nodes || {};\n  const [variableValues, setVariableValues] = React.useState<Record<\n    string,\n    PrimitiveVariableValue\n  >>(() => snapshot.variables?.variableValues || {});\n\n  const setVariableValue = React.useCallback((name: string, value: PrimitiveVariableValue) => {\n    setVariableValues((prev) => ({ ...prev, [name]: value }));\n  }, []);\n\n  const createFlowHandler = React.useMemo(\n    () =>\n      createFlowHandlerFactory({\n        flows: snapshot.actionFlows?.flows,\n        variables: variableValues,\n        services: { ...services, setVariableValue },\n        setVariableValue,\n      }),\n    [services, setVariableValue, snapshot.actionFlows?.flows, variableValues],\n  );\n\n  const renderNode = React.useCallback(\n    (nodeId: string): React.ReactNode => {\n      const node = nodes[nodeId] as ComponentNode | undefined;\n      if (!node) return null;\n\n      const registration = getRegisteredComponent(node.type);\n      if (!registration) {\n        // eslint-disable-next-line no-console\n        console.warn('Component ' + node.type + ' not registered');\n        return null;\n      }\n\n      const props = resolvePropsForNode({\n        node,\n        registration,\n        variableValues,\n        renderNodeRef: renderNode,\n        createFlowHandler,\n      });\n\n      const Component = registration.component;\n      if (typeof Component === 'string') {\n        const { children, ...restProps } = props;\n        return React.createElement(Component, { ...restProps, key: node.id }, children);\n      }\n\n      return (\n        <Component key={node.id} {...props}>\n          {props.children as React.ReactNode}\n        </Component>\n      );\n    },\n    [createFlowHandler, nodes, variableValues],\n  );\n\n  return <>{renderNode(rootId)}</>;\n};\n`,
});

export const buildCodeExportFiles = (snapshot: ProjectSnapshot): CodeExportFileMap => {
  const pages = buildPageExports(snapshot);
  const files: CodeExportFileMap = {
    'package.json': buildVitePackageJson(),
    'index.html': buildViteIndexHtml(),
    'vite.config.ts': buildViteConfig(),
    'tsconfig.json': buildTsConfig(),
    'src/main.tsx': buildMainFile(),
    'src/App.tsx': buildAppFile(),
    'src/routes.tsx': buildRoutesFile(pages),
    'src/snapshot.json': JSON.stringify(snapshot, null, 2),
    'src/snapshot.ts': buildSnapshotTs(snapshot),
    'src/index.ts': buildIndexFile(pages),
    'src/runtime/registerComponents.ts': buildRegisterComponentsFile(),
    ...Object.fromEntries(
      Object.entries(buildRuntimeFiles()).map(([path, content]) => [`src/${path}`, content]),
    ),
  };

  pages.forEach((page) => {
    files[`src/pages/${page.fileBase}.tsx`] = buildPageFile(page);
  });

  return files;
};

export const buildCodeExportZip = (snapshot: ProjectSnapshot): Blob => {
  const files = buildCodeExportFiles(snapshot);
  const zipData = zipSync(
    Object.fromEntries(Object.entries(files).map(([path, content]) => [path, strToU8(content)])),
    { level: 6 },
  );

  const arrayBuffer = zipData.buffer.slice(
    zipData.byteOffset,
    zipData.byteOffset + zipData.byteLength,
  ) as ArrayBuffer;
  const data = new Uint8Array(arrayBuffer);
  return new Blob([data], { type: 'application/zip' });
};
