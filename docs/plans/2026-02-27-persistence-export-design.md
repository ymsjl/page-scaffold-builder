# Page Scaffold Builder Persistence + Export Design

Date: 2026-02-27
Status: Draft (validated by user)

## Goals
- Persist edited page data to backend storage.
- Export data as JSON for transfer.
- Import JSON to restore a page reliably.
- Keep preview and saved data consistent.

## Non-Goals (for this phase)
- Multi-user collaboration.
- Fine-grained permissions.
- Database migration tooling on the server.

## Recommended Approach (Option A)
Use a single, versioned snapshot JSON as the canonical artifact. The backend stores and serves the snapshot as files. Export and import are the same snapshot format, enabling portability and restoration.

## Snapshot Schema (v1)
Top-level structure:
- schemaVersion: number
- meta: { id, name, description?, createdAt, updatedAt }
- componentTree: { nodes, rootIds, ... }
- variables: { entities, ids, values? }
- entityModels: { entities, ids }
- actionFlows: { flows, bindings }
- ui?: { selectedNodeId?, panels? }

Notes:
- ui is optional; used only to restore editing state.
- schemaVersion enables forward compatibility and migrations.

## Frontend Flow
- Save: gather Redux slices into snapshot -> PUT /api/projects/:id.
- Save As: modify meta.name -> POST /api/projects.
- Export: download snapshot.json locally.
- Import: upload JSON -> validate -> POST /api/projects -> auto-load.
- Load: GET /api/projects/:id -> migrateSnapshot -> hydrateAll(snapshot).

Hydration:
- Each domain slice exposes hydrateFromSnapshot.
- A root hydrateAll(snapshot) dispatches each domain hydrate.

## Backend API (Fastify)
- GET /api/projects: list { id, name, updatedAt }
- GET /api/projects/:id: full snapshot
- POST /api/projects: create new snapshot
- PUT /api/projects/:id: update snapshot
- DELETE /api/projects/:id: delete snapshot

Storage:
- Directory: data/projects/
- File name: {id}.json
- Write strategy: write temp file then rename.

## Migration Strategy
- Client-side migrateSnapshot(snapshot) handles schema changes.
- Server remains storage-only, no migration logic.
- On incompatible versions, show a blocking error and keep current editor state.

## Error Handling
- Network failure: show toast, allow export as fallback.
- Invalid import: show validation error, do not overwrite.
- Version mismatch: prompt or block with guidance.

## Testing
- Frontend: import/export round-trip should preserve selectors.
- Backend: CRUD integration tests with file writes.

## Open Questions
- Where to surface project list UI (top bar vs. modal)?
- Which UI state (if any) should be stored in snapshot ui?
