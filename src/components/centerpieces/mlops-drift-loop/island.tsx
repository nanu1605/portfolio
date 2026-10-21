"use client";

import { island } from "../island";

export const MlopsIsland = island(() => import("./live"));
