"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/motion-hooks";
import { followTrack } from "../stepper";
import { View, type MenumeshData } from "./view";

/**
 * The live story: the sticky frame follows the step text in the middle of
 * the viewport; the phone stepper follows taps, keys and swipes. Renders
 * run as transitions, so a tap never blocks the main thread (INP).
 */
export default function Live(props: MenumeshData) {
  const reduced = useReducedMotionSafe();
  const [story, setStory] = useState(0);
  const [step, setStep] = useState(0);
  const [hindiMenu, setHindiMenu] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const follow = useRef<ReturnType<typeof followTrack>>(null);

  useEffect(() => {
    // A band just above the middle of the viewport picks the step.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            const at = Number((e.target as HTMLElement).dataset.step);
            startTransition(() => setStory(at));
          }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    list
      .current!.querySelectorAll("[data-step]")
      .forEach((li) => observer.observe(li));
    const f = followTrack(track.current!, (to) =>
      startTransition(() => setStep(to)),
    );
    follow.current = f;
    return () => {
      observer.disconnect();
      f.stop();
    };
  }, []);

  const go = (to: number) => {
    follow.current?.go(to, !reduced);
    startTransition(() => setStep(to));
  };
  const hindi = (on: boolean) => startTransition(() => setHindiMenu(on));

  return (
    <View
      {...props}
      state={{ story, step, hindiMenu }}
      storyRef={list}
      trackRef={track}
      onGo={go}
      onHindi={hindi}
    />
  );
}
