import Fastify from 'fastify';
import cors from '@fastify/cors';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { randomUUID } from 'node:crypto';

type ProjectMeta = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

type ProjectSnapshot = {
  schemaVersion?: number;
  meta?: Partial<ProjectMeta>;
  componentTree?: unknown;
  variables?: unknown;
  entityModels?: unknown;
  actionFlows?: unknown;
  ui?: unknown;
};

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: true,
});

const PROJECTS_DIR = path.resolve(process.cwd(), 'data', 'projects');

const ensureProjectsDir = async () => {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
};

const projectPath = (id: string) => path.join(PROJECTS_DIR, `${id}.json`);

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const normalizeSnapshot = (snapshot: ProjectSnapshot, idOverride?: string) => {
  const now = Date.now();
  const meta = snapshot.meta ?? {};
  const id = idOverride ?? meta.id ?? randomUUID();
  return {
    ...snapshot,
    schemaVersion: snapshot.schemaVersion ?? 1,
    meta: {
      ...meta,
      id,
      name: meta.name ?? 'Untitled Project',
      createdAt: meta.createdAt ?? now,
      updatedAt: now,
    },
  } satisfies ProjectSnapshot;
};

const readSnapshot = async (id: string) => {
  const content = await fs.readFile(projectPath(id), 'utf-8');
  return JSON.parse(content) as ProjectSnapshot;
};

const writeSnapshot = async (id: string, snapshot: ProjectSnapshot) => {
  const tempPath = path.join(PROJECTS_DIR, `${id}.tmp`);
  const targetPath = projectPath(id);
  await fs.writeFile(tempPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  await fs.rename(tempPath, targetPath);
};

server.get('/api/projects', async () => {
  await ensureProjectsDir();
  const entries = await fs.readdir(PROJECTS_DIR);
  const items = await Promise.all(
    entries
      .filter((fileName) => fileName.endsWith('.json'))
      .map(async (fileName) => {
        try {
          const id = fileName.replace(/\.json$/, '');
          const snapshot = await readSnapshot(id);
          const meta = snapshot.meta;
          if (!meta?.id || !meta.name || !meta.updatedAt) return null;
          return {
            id: meta.id,
            name: meta.name,
            description: meta.description,
            updatedAt: meta.updatedAt,
          };
        } catch {
          return null;
        }
      }),
  );

  return items
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => b.updatedAt - a.updatedAt);
});

server.get('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const snapshot = await readSnapshot(id);
    return snapshot;
  } catch {
    return reply.code(404).send({ error: 'Project not found' });
  }
});

server.post('/api/projects', async (request, reply) => {
  const snapshot = request.body as ProjectSnapshot | undefined;
  if (!snapshot || typeof snapshot !== 'object') {
    return reply.code(400).send({ error: 'Invalid snapshot' });
  }

  await ensureProjectsDir();
  const requestedId = snapshot.meta?.id;
  const requestedPath = requestedId ? projectPath(requestedId) : null;
  const canUseRequested = requestedPath ? !(await fileExists(requestedPath)) : false;
  const normalized = normalizeSnapshot(snapshot, canUseRequested ? requestedId : undefined);
  const id = normalized.meta?.id as string;
  await writeSnapshot(id, normalized);
  return reply.code(201).send(normalized);
});

server.put('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const snapshot = request.body as ProjectSnapshot | undefined;
  if (!snapshot || typeof snapshot !== 'object') {
    return reply.code(400).send({ error: 'Invalid snapshot' });
  }

  await ensureProjectsDir();
  const normalized = normalizeSnapshot(snapshot, id);
  await writeSnapshot(id, normalized);
  return reply.send(normalized);
});

server.delete('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    await fs.unlink(projectPath(id));
    return reply.send({ success: true });
  } catch {
    return reply.code(404).send({ error: 'Project not found' });
  }
});


const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '0.0.0.0';

server.listen({ port, host }).catch((error) => {
  server.log.error(error, 'Failed to start server');
  process.exit(1);
});
