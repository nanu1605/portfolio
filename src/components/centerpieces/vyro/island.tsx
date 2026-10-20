"use client";

import { island } from "../island";

export const VyroIsland = island(() => import("./live"));
