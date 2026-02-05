# Notes: Slot System Expansion

## Current State

- Table uses special-case toolbar.actions injection in ComponentPreview.
- DropZone supports acceptTypes and writes NodeRef into props by path.
- ReactNode rendering resolves NodeRef to actual components.

## Gaps

-- None (slot metadata and wrapper added).

## Ideas

-- Slot metadata now used to drive DropZone injection and NodeRef rendering.
-- Inline slots inject DropZone into props arrays; panel slots render above preview.
