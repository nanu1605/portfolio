"use client";

import { useEffect, useRef, useState } from "react";
import { usePauseWhenHidden, useReducedMotionSafe } from "@/lib/motion-hooks";
import { poll, type Reading, type Start } from "./sim";
import { View, type BrowserInfo, type Copy } from "./view";

// The live gauge panel (§10.2). A new simulated poll arrives once a second,
// as in VYRO, and the shown values ease toward it with a 0.22 s time
// constant on one animation loop, capped at 60 fps, that stops once they
// settle. It pauses off-screen, in hidden tabs and on Pause. Under reduced
// motion it starts paused; Play then updates the values instantly.

const TAU = 220; // ms
const FRAME = 1000 / 60;
const POLL = 1000;
/**
 * Closer than this, a value snaps to its target and stops moving. Each snap
 * is too small to see (0.7° of needle, 0.1 % of a clock, 0.1 % of the fan
 * bar), and all of them land within about 0.8 s of a poll (at most 1 s), so
 * the loop rests for the rest of each second instead of running on.
 */
const SETTLE: Reading = {
  cpu: 0.25,
  cpuClock: 5,
  gpu: 0.25,
  gpuClock: 5,
  temp: 0.1,
  fan: 2,
};
const keys = Object.keys(SETTLE) as (keyof Reading)[];

type BrowserNavigator = Navigator & { deviceMemory?: number };

export default function Live({ copy, start }: { copy: Copy; start: Start }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = usePauseWhenHidden(ref);
  const reduced = useReducedMotionSafe();
  // null until the reader presses Pause or Play.
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduced;
  const running = playing && visible;

  const [reading, setReading] = useState(start.reading);
  const [history, setHistory] = useState(start.history);
  const shown = useRef(start.reading);
  const target = useRef(start.reading);
  const [browser, setBrowser] = useState<BrowserInfo>();

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      const dt = now - last;
      // 60 fps cap: on faster screens, skip until a 60 Hz frame is due.
      if (dt < FRAME - 1) {
        raf = requestAnimationFrame(frame);
        return;
      }
      last = now;
      const k = 1 - Math.exp(-dt / TAU);
      const from = shown.current;
      const to = target.current;
      const next = { ...to };
      let settled = true;
      for (const key of keys) {
        if (Math.abs(to[key] - from[key]) > SETTLE[key]) {
          next[key] = from[key] + (to[key] - from[key]) * k;
          settled = false;
        }
      }
      shown.current = next;
      setReading(next);
      raf = settled ? 0 : requestAnimationFrame(frame);
    };

    const tick = () => {
      target.current = poll(target.current);
      const temp = target.current.temp;
      setHistory((h) => [...h.slice(1), temp]);
      if (reduced) {
        shown.current = target.current;
        setReading(target.current);
      } else if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    tick();
    const id = setInterval(tick, POLL);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(raf);
      // Stop where the needles are, so a resume eases from there.
      target.current = shown.current;
    };
  }, [running, reduced]);

  const onBrowser = () => {
    if (browser) return setBrowser(undefined);
    setBrowser({
      cores: navigator.hardwareConcurrency,
      memory: (navigator as BrowserNavigator).deviceMemory,
      screen: `${screen.width} × ${screen.height}`,
      dpr: Math.round(devicePixelRatio * 100) / 100,
    });
  };

  return (
    <View
      ref={ref}
      copy={copy}
      reading={reading}
      history={history}
      playing={playing}
      onToggle={() => setChoice(!playing)}
      browser={browser}
      onBrowser={onBrowser}
    />
  );
}
