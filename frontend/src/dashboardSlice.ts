import { emptySplitApi } from './features/api/apiSlice';
import {
  Reports,
  Error,
  FormErrors,
  Message,
} from './features/api';

export const dashboardApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<Reports | Error, string | void>({
      query: (query) => ({
        url:  query && query.length ? `/dashboard${query}` : '/dashboard',
        validateStatus: (response, result) => {
          if (result?.error) {
            return true;
          }
          return response.ok;
        },
      }),
      providesTags: (result) => {
        if (result?.purchases && result?.sales) {
          return [
            'Report',
            ...result.purchases.map(() => ({
              type: 'Report' as const,
            })),
            ...result.sales.map(() => ({
              type: 'Report' as const,
            })),
          ];
        } else {
          return ['Report'];
        }
      },
    })
  })
})

export const {
  useGetReportsQuery
} = dashboardApi
