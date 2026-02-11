# SQL Import Backend Design (Fastify + Workspace)

## Goals

- Add a lightweight backend to parse MySQL DDL into a JSON entity model.
- Keep the current frontend workflow fast and simple.
- Organize frontend and backend in one repository with clear boundaries.

## Architecture

- Use a pnpm workspace with three packages:
  - apps/web: existing Vite React frontend.
  - apps/api: Fastify API server (TypeScript).
  - packages/shared: shared TypeScript types and pure utilities.
- Root provides only workspace config and aggregate scripts.

## API

- POST /api/sql/parse
  - Request: { sql: string }
  - Response: { model: EntityModel, warnings?: string[] }
  - Errors: 400 for syntax errors, 500 for unexpected failures.

## Data Flow

- Frontend submits SQL text to the API.
- API parses MySQL DDL using node-sql-parser and builds EntityModel.
- Frontend consumes the JSON model to generate entities in the editor.

## Type Sharing

- EntityModel and EntityField live in packages/shared.
- Both apps depend on shared via workspace:\*.

## Dev Experience

- pnpm -w dev runs web and api concurrently.
- apps/api uses tsx for fast reload in development.
- apps/web remains unchanged in build and test workflow.

## Non-Goals (Phase 1)

- Authentication, persistence, and database connections.
- Full SQL dialect coverage beyond MySQL DDL.
- Complex validation or UI workflows beyond basic import.
