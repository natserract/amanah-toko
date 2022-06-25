import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/dist/query/react';

export const emptySplitApi = createApi({
  reducerPath: 'api',
  baseQuery: retry(fetchBaseQuery({
    baseUrl: `${process.env.BASE_URL || 'http://amanahtoko.local:5000/api/v1'}`,
  }), {
    maxRetries: 3
  }),
  tagTypes: ['Report', 'Category', 'Product', 'Purchase', 'Sale', 'Supplier', 'Transfer'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 10,
});
