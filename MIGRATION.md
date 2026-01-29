# Migration to Redux Toolkit + Reselect

Summary:

- Replaced core state management from Zustand to Redux Toolkit + reselect for `componentTree`, `entityTypes`, `ui`, and `selectedNode` slices.
- Added `store.ts` and typed hooks `useAppSelector`/`useAppDispatch`.
- Converted key components (`Layout`, `ComponentTree`, `TreeNodeItem`, `PropertyPanel`, `SchemaBuilderModal` and `SchemaList`, `EntityTypeDesignerPanel`) to use RTK hooks and actions.
- Migrated unit tests for slices from zustand/vanilla to RTK reducer/thunk tests.

Next steps:

- Install new dependencies: `pnpm add @reduxjs/toolkit react-redux reselect` (or `npm install`/`yarn add`)
- Run tests and fix any remaining type errors (some files still reference `zustand` and `useRuleStore` which were left intact for now).
- Consider replacing `useRuleStore` with an RTK slice and implement a subscription API instead of storing callbacks in state.
- Remove `useBuilderStore.ts` and old zustand slice files after verifying full migration.

Notes:

- Persistence: persisted state should be configured intentionally; the old code persisted the whole zustand store. For RTK, consider `redux-persist` and specify keys to persist. Also, avoid persisting non-serializable values.
- Non-serializable callbacks: refactor `RuleBuilder`'s callback storage into a module-level listener or middleware.
