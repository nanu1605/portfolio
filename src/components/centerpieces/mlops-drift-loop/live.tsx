"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useReducedMotionSafe } from "@/lib/motion-hooks";
import { batchAt, MlopsView, progress, steps, type MlopsData } from "./view";

// The scrub (§10.7, cross-device §6). From 768 × 600 the figure pins
// (mlops.css) and the scroll through its track draws the line; below that
// nothing pins, and the line draws from when the chart's foot enters the
// viewport until it has scrolled most of the way up, still fully in view.
// No CSS scroll timeline: stable Firefox has none, and this carries data.
// One passive scroll listener, one rect read per frame, and only while the
// track is near the viewport; React renders only when the step changes.
// Reduced motion keeps the final step.

/** The least scroll (px) a phone draw takes, however little room is left. */
const MIN_SPAN = 120;

export default function MlopsLive({ data }: { data: MlopsData }) {
  const reduced = useReducedMotionSafe();
  const total = steps(data);
  const svg = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(total);
  const [selected, setSelected] = useState<number>();
  const [speak, setSpeak] = useState(false);

  useEffect(() => {
    const plot = svg.current;
    const pin = plot?.closest<HTMLElement>(".mlops-pin");
    const track = pin?.parentElement;
    if (reduced || !plot || !pin || !track) return;
    let frame = 0;
    let near = false;
    let header = 0;
    const readHeader = () => {
      header =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--header-h",
          ),
        ) || 0;
    };
    const update = () => {
      frame = 0;
      const t = track.getBoundingClientRect();
      const b = pin.getBoundingClientRect();
      const run = t.height - b.height;
      let p: number;
      if (run > 1) {
        p = (b.top - t.top) / run; // pinned: how far through the track
      } else {
        const c = plot.getBoundingClientRect();
        const room = innerHeight - header - c.height;
        p = (innerHeight - c.bottom) / Math.max(MIN_SPAN, room * 0.75);
      }
      setStep(Math.round(Math.min(1, Math.max(0, p)) * total));
    };
    const schedule = () => {
      if (near && !frame) frame = requestAnimationFrame(update);
    };
    let moved = false;
    const onScroll = () => {
      if (!near) return;
      if (!moved) {
        moved = true;
        setSpeak(true);
      }
      schedule();
    };
    const onResize = () => {
      readHeader();
      schedule();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        near = !!entry?.isIntersecting;
        if (near) schedule();
        else setSelected(undefined);
      },
      { rootMargin: "100px 0px" },
    );
    readHeader();
    observer.observe(track);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
    };
  }, [reduced, total]);

  const at = reduced ? total : step;
  const last = data.points.length - 1;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const from = selected ?? Math.max(0, progress(data, at).shown - 1);
    const moves: Record<string, number> = {
      ArrowRight: from + 1,
      ArrowUp: from + 1,
      ArrowLeft: from - 1,
      ArrowDown: from - 1,
      Home: 0,
      End: last,
    };
    const to = moves[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setSpeak(true);
    setSelected(Math.min(last, Math.max(0, to)));
  };
  const onPick = (e: MouseEvent<HTMLDivElement>) => {
    const m = svg.current?.getScreenCTM();
    if (!m) return;
    const x = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()).x;
    setSpeak(true);
    setSelected(batchAt(data, x));
  };

  return (
    <MlopsView
      data={data}
      state={{ step: at, selected, speak }}
      on={{ svg, onKey, onPick }}
    />
  );
}
