"use client";

import { island } from "../island";

export const BabyIsland = island(() => import("./live"));
