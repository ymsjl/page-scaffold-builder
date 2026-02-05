# Slot System Plan (Deliverable)

## Slot Metadata
- Add `slots?: SlotDefinition[]` to ComponentPrototype.
- SlotDefinition fields:
  - id: string
  - path: string (e.g. "toolbar.actions")
  - label: string
  - kind: "reactNode" | "reactNodeArray"
  - acceptTypes?: ComponentType[]
  - renderMode?: "inline" | "panel"
  - wrap?: boolean
  - placeholder?: string

## Runtime
- SlotResolver: read slots from prototype, read values by path, build DropZone config.
- DropZone injection:
  - panel: list all slots above preview
  - inline: used by component-specific adapter/render hook
- Renderer:
  - resolve NodeRef to ReactElement
  - if wrap: wrap with SlotItemWrapper

## Wrapper
- SlotItemWrapper:
  - shows hover border
  - provides remove action
  - click selects node in tree
  - optional edit entry point

## Refactor
- Remove Table-specific DropZone injection.
- Replace with generic slot handling.

## Validation
- Drag Button to Table.toolbar.actions
- Add another component with slot metadata and confirm same flow
