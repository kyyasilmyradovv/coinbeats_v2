"use client";

import store from "@/store/store";
import { type ReactNode } from "react";

import { Provider } from "react-redux"; // Ensure this is imported as a value

export function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>; // Ensure the store is passed correctly
}
