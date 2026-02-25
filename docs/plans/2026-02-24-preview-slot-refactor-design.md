# Preview Slot Refactor Design (2026-02-24)

## Goal

Reduce preview complexity by removing slot + add-component rendering from shared prop resolution logic. Each preview component owns how its ReactNode props are rendered, including add-UI placement and wrapper behavior.

## Success Criteria

- `propResolvers` only handles variable refs and action flow handlers (plus basic prop merging and container children refs).
- Preview components render ReactNode props (NodeRef arrays) themselves.
- ProTable pilot works with end-only add UI for row actions.
- Slot metadata remains for property panel and DnD, but no longer drives preview rendering.

## Architecture

- `usePropResolver` returns normalized props:
  - Merge default props + node props.
  - Replace container `children` with NodeRef[] derived from `childrenIds`.
  - Resolve variable refs.
  - Resolve action-flow handler props.
  - Do NOT resolve NodeRefs to ReactNode.
  - Do NOT apply slot wrapping or add-button logic.
- `RenderNodeRefProvider` remains the shared mechanism to render a NodeRef into a preview subtree.
- `useRenderNodeRefs` stays as a small helper, used by preview components to render NodeRef arrays.

## Component Responsibilities

### ProTable (pilot)
- `ProTableForPreview` owns UI for:
  - `rowActions` (existing slot, end-only add UI).
  - `toolbar.actions` (new slot handling, end-only add UI).
- `ProTableForPurePreview` renders row actions without wrapper/add UI.
- `ColumnCellSlot` remains a lightweight local slot renderer for row actions.

### Container Components
- Page and Modal preview components render `children` (NodeRef[]), applying:
  - `SlotItemWrapper` per element in edit mode.
  - A single add UI at the end in edit mode.
  - No wrapper/add UI in pure mode.

## Data Flow

1. Resolve node props in `usePropResolver` (variables + action flows).
2. Preview component receives NodeRef arrays as raw values.
3. Preview component calls `useRenderNodeRefs` to render NodeRefs.
4. Preview component decides how to wrap and where to place add UI.

## Error Handling

- Missing NodeRef renders as `null` (skip element).
- Empty lists render only the end add UI (edit mode).
- Non-array ReactNode props are treated as empty unless they are a single NodeRef.

## Testing

- ProTable preview tests:
  - Edit mode: row actions are wrapped and add UI appears once at the end.
  - Pure mode: row actions render without wrappers or add UI.
  - Empty row actions: only add UI appears in edit mode.
  - Toolbar actions follow the same rules.
- Container previews (Page/Modal) tests can be added after pilot stabilization.

## Migration Notes

- Keep `ComponentPrototype.slots` for configuration and property panel usage.
- Remove slot rendering from `propResolvers` and `previewLogic` where no longer needed.
- Update preview components to own UI for ReactNode props.
