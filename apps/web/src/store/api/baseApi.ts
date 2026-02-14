import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  }),
});

export const { useParseSqlMutation } = baseApi;
