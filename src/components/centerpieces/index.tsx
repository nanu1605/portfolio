import type { ReactNode } from "react";
import type { ProjectSlug } from "@content/schema";
import { Centerpiece as Baby } from "./baby";
import { Centerpiece as JainavPlatform } from "./jainav-platform";
import { Centerpiece as Menumesh } from "./menumesh";
import { Centerpiece as MlopsDriftLoop } from "./mlops-drift-loop";
import { Centerpiece as Mycounselhub } from "./mycounselhub";
import { Centerpiece as ProbabilisticForecasting } from "./probabilistic-forecasting";
import { Centerpiece as ReservoirRl } from "./reservoir-rl";
import { Centerpiece as VirtualDressingRoom } from "./virtual-dressing-room";
import { Centerpiece as Vyro } from "./vyro";

// Each case study's centerpiece (§10), in the slot after its TL;DR. One
// folder per centerpiece: a server `index.tsx` that renders the poster and
// any "View data" table, and, for the interactive ones, a lazy client chunk.

export const centerpieces: Record<ProjectSlug, ReactNode> = {
  baby: <Baby />,
  vyro: <Vyro />,
  "reservoir-rl": <ReservoirRl />,
  "probabilistic-forecasting": <ProbabilisticForecasting />,
  "mlops-drift-loop": <MlopsDriftLoop />,
  "jainav-platform": <JainavPlatform />,
  menumesh: <Menumesh />,
  "virtual-dressing-room": <VirtualDressingRoom />,
  mycounselhub: <Mycounselhub />,
};
