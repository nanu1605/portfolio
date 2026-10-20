"use client";

import { island } from "../island";

export const ForecastingIsland = island(() => import("./live"));
