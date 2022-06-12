import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";

export const emptySplitApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl:
      `${process.env.BASE_URL || "http://amanahtoko.local:5000/api/v1"}`
    }),
    tagTypes: ["Category", "Product", "Purchase", "Sale", "Supplier", "Transfer"],
    endpoints: () => ({}),
})
