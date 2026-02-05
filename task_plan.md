# Task Plan: Extend Slot System Across Components

## Goal

Implement a unified slot metadata system so any component can declare ReactNode/ReactNode[] insertion points with DropZone support and wrapped interactive rendering.

## Phases

- [x] Phase 1: Define slot metadata model
- [x] Phase 2: Implement slot resolver and DropZone injection
- [x] Phase 3: Implement wrapper for interactive rendering
- [x] Phase 4: Refactor existing Table-specific logic
- [ ] Phase 5: Validate and document usage

## Key Questions

1. How should slot metadata be represented and stored in component prototypes?
2. Where should DropZone be injected: inline at render site, or in a unified slot panel?
3. What wrapper behaviors are required for selection/edit/delete?

## Decisions Made

- Slot metadata lives on ComponentPrototype as `slots`.
- Inline slots inject DropZone into props; panel slots render DropZone above preview.
- Dropped nodes render through SlotItemWrapper for selection/removal.

## Errors Encountered

- None yet

## Status

**Currently in Phase 5** - ready for validation and usage checks
