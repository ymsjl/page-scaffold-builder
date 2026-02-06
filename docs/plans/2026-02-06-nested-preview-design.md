# Nested Component Preview Design (2026-02-06)

## Goal

Enable a full-tree preview rendered from the Page root, with click-to-select behavior, always-visible drop zones, and `children` derived only from `childrenIds`.

## Key Decisions

- Render from the Page root instead of the selected node.
- Treat `childrenIds` as the sole source of `children` in preview (ignore `props.children`).
- Use the existing slot + NodeRef rendering pipeline for both explicit slots and `children`.
- Keep DropZone always visible for editable feedback.

## Data Flow

1. Select the preview root node (Page) from the component tree.
2. Normalize node props for preview:
   - Merge default props + node props.
   - Map `columns` into renderable props for Pro components.
   - Replace `children` with NodeRef array derived from `childrenIds`.
3. Resolve slots and NodeRefs to React elements.
4. Render the resolved tree from the root, injecting DropZones and wrappers.

## Interaction Model

- Clicking any rendered node selects it.
- Slot items use the existing wrapper for selection and removal.
- The Page root is selectable via its preview wrapper.

## Error Handling

- No Page root: show empty state.
- Unknown component type: render a placeholder in place (do not break layout).
- Dangling `childrenIds`: skip missing nodes; keep DropZones for insertion.

## Testing

- Selector returns the Page root (or null when absent).
- Normalization maps `childrenIds` to NodeRef `children` and ignores `props.children`.
- Normalization maps `columns` using existing Pro column helper.
