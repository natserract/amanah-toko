import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/dist/query/react';

const env: "development" | "test" | "production" | any = process.env.REACT_NODE_ENV;

const devApiUrl = process.env.BASE_URL || 'http://amanahtoko.local:5000/api/v1';
const prodApiUrl = process.env.BASE_PROD_URL || "https://pure-spire-61458.herokuapp.com/api/v1";

export const emptySplitApi = createApi({
  reducerPath: 'api',
  baseQuery: retry(fetchBaseQuery({
    baseUrl: `${env === "development" ? devApiUrl : prodApiUrl}`,
  }), {
    maxRetries: 3
  }),
  tagTypes: ['Report', 'Category', 'Product', 'Purchase', 'Sale', 'Supplier', 'Transfer'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 10,
});
