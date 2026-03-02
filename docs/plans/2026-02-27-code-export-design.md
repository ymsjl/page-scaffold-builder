# Code Export Design

Date: 2026-02-27
Status: Validated by user

## Goals
- Export a code package for all pages in the current project as a zip download.
- Keep rendering logic data-driven and consistent with the editor preview.
- Preserve variables and actionFlows behavior in the exported runtime.
- Allow host projects to plug in their own ProTable/BaseSchemaForm implementations.

## Non-Goals
- Static JSX full expansion for every page.
- Multi-user collaboration or permission management.
- Server-side code generation or build pipeline integration.

## Recommended Approach (Option A)
Export a runtime-driven package that includes:
- snapshot.json (single source of truth)
- runtime/* (renderer, props resolver, action flow runtime)
- pages/*.tsx (one file per page)
- index.ts (export entry)

This avoids complex JSX codegen while keeping compatibility with the editor preview, variables, and action flows.

## Exported Package Structure
- snapshot.json
- runtime/
  - renderer.tsx
  - propsResolver.ts
  - actionFlowRuntime.ts
  - registry.ts
  - types.ts
- pages/
  - <PageName>.tsx
- index.ts

## Runtime Design
### renderer.tsx
- Accepts snapshot + rootId to render a page.
- Reads nodes from normalized tree and renders recursively.
- Uses registry to resolve component types to actual React components.
- Injects children for container nodes when children are not provided.

### propsResolver.ts
- Resolves variable references from snapshot.variables.variableValues.
- Resolves NodeRef into real React nodes via renderNodeRef callback.
- Merges default props from prototype with node props.

### actionFlowRuntime.ts
- Exposes createFlowHandler(flowId, ctx).
- Executes actionFlows with context (componentId, props, event payload).
- Errors are caught and logged without breaking rendering.

### registry.ts
- Provides registerComponent(type, component).
- Host project calls registerComponents() to map Table -> ProTable, Form -> BaseSchemaForm, etc.

## Exporter Flow (Frontend)
1) Build snapshot using buildProjectSnapshot().
2) Generate snapshot.json.
3) Generate runtime files from templates (fixed content).
4) Extract all Page nodes from componentTree and generate pages/*.tsx.
5) Zip the directory and download as <project-name>-code-export.zip.

## Error Handling
- Version mismatch: show error, abort export.
- No Page nodes: show error, abort export.
- Missing component registration at runtime: render null + console.warn.
- Missing variables: resolve to undefined.
- Missing action flows: no-op + console.error.

## Compatibility & Migration
- snapshot schema is identical to ProjectSnapshot (schemaVersion enforced).
- runtime is versioned by schemaVersion to allow future migrations.
- Host project controls component registry and can override mappings.

## Testing Plan
- Unit tests for page extraction and file generation.
- Unit tests for propsResolver variable and NodeRef resolution.
- Integration smoke test: export -> unzip -> render a page in host project.

## Open Questions
- Whether to include optional ErrorBoundary in runtime.
- Whether to ship full actionFlow runtime or a minimal subset first.
