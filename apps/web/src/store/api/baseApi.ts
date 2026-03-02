import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProjectListItem, ProjectSnapshot } from '@/types/ProjectSnapshot';

export type SqlParseRequest = {
  sql: string;
};

export type ParsedSqlField = {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  comment?: string;
};

export type ParsedSqlModel = {
  name: string;
  fields: ParsedSqlField[];
};

export type SqlParseResponse = {
  model: ParsedSqlModel;
  warnings?: string[];
};

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    parseSql: builder.mutation<SqlParseResponse, SqlParseRequest>({
      query: (body) => ({
        url: '/api/sql/parse',
        method: 'POST',
        body,
      }),
    }),
    listProjects: builder.query<ProjectListItem[], void>({
      query: () => ({
        url: '/api/projects',
      }),
    }),
    getProject: builder.query<ProjectSnapshot, string>({
      query: (id) => ({
        url: `/api/projects/${id}`,
      }),
    }),
    createProject: builder.mutation<ProjectSnapshot, ProjectSnapshot>({
      query: (body) => ({
        url: '/api/projects',
        method: 'POST',
        body,
      }),
    }),
    updateProject: builder.mutation<ProjectSnapshot, { id: string; snapshot: ProjectSnapshot }>({
      query: ({ id, snapshot }) => ({
        url: `/api/projects/${id}`,
        method: 'PUT',
        body: snapshot,
      }),
    }),
    deleteProject: builder.mutation<{ success: true }, string>({
      query: (id) => ({
        url: `/api/projects/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useParseSqlMutation,
  useListProjectsQuery,
  useLazyGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = baseApi;
