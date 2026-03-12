"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";

// INDUSTRIAL: Render children immediately; rehydration runs in background (don't block first paint).
// Store will dispatch REHYDRATE when ready; components show cached data as it becomes available.
export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
