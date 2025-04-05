import { buildUrlWithParams } from "@/lib/utils";
import { apiSlice } from "./apiSlice";
import { createEntityAdapter } from "@reduxjs/toolkit";
import { TAcademy, TAcademySingle } from "@/types/academy";

export const academiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    academies: builder.query({
      query: (parameters) => {
        return {
          url: buildUrlWithParams("/academies", parameters),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg: { offset } }) => {
        if (offset === 0) {
          currentCache.length = 0;
        }
        currentCache.push(...newItems);
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
      providesTags: ["Academies"],
    }),
    academy: builder.query<TAcademySingle, string>({
      query: (id) => {
        return {
          url: `academies/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Academy"],
    }),
  }),
  overrideExisting: false,
});

export const { useAcademiesQuery, useAcademyQuery } = academiesApi;
