"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/motion-hooks";
import { followTrack } from "../stepper";
import { View, type JainavData } from "./view";

/**
 * The live stepper: arrow keys, taps, swipes and Previous/Next. The track
 * scrolls at once; the render runs as a transition, so a tap never blocks
 * the main thread (INP).
 */
export default function Live(props: JainavData) {
  const reduced = useReducedMotionSafe();
  const [current, setCurrent] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const follow = useRef<ReturnType<typeof followTrack>>(null);

  useEffect(() => {
    const f = followTrack(track.current!, (step) =>
      startTransition(() => setCurrent(step)),
    );
    follow.current = f;
    return f.stop;
  }, []);

  const go = (step: number) => {
    follow.current?.go(step, !reduced);
    startTransition(() => setCurrent(step));
  };

  return <View {...props} current={current} trackRef={track} onGo={go} />;
}
