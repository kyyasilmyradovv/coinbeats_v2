import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers) => {
    // const dr_accessToken = Cookies.get("DR_AT") ?? "";

    // if (dr_accessToken) {
    //   headers.set("Authorization", `Bearer ${sanitizedToken}`);
    // }
    headers.set("Api-Version", "1");
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  refetchOnReconnect: true,
  tagTypes: ["Academies", "Academy", "Categories", "Chains"],
  endpoints: () => ({}),
});
