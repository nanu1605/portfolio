"use client";

import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { BabyDemo } from "@content/centerpieces/baby";
import { usePauseWhenHidden, useReducedMotionSafe } from "@/lib/motion-hooks";
import { motion } from "@/styles/tokens";
import { View } from "./view";

// The live "Follow a turn": the view's final state, replayed. A pulse runs
// the scenario's real path in about 2.5 s (§10.1), each stop lights as it
// arrives, and the transcript types in word by word. The first scenario
// plays once when it is well in view and then holds (under 5 s); a chip
// plays its scenario once. Everything pauses off-screen and in hidden tabs.
// Reduced motion: no animation, the chosen scenario's final state at once.

const PASS = 2500;
/** Between words as the transcript types in. */
const WORD = 70;
const { ease, duration } = motion;

type Measured = { length: number; points: { x: number; y: number }[] };
const measured = new Map<string, Measured>();

/**
 * An edge's length, and points at even distances along it (its ends for a
 * straight edge, every ~20 units on a curve). The geometry never changes,
 * and measuring forces style and layout, so each layout's edges are
 * measured once, when it first plays, never inside a tap.
 */
function measure(svg: SVGSVGElement, edge: string) {
  const key = `${svg.dataset.graph}|${edge}`;
  let m = measured.get(key);
  if (!m) {
    const p = svg.querySelector<SVGPathElement>(`[data-edge="${edge}"]`)!;
    const length = p.getTotalLength();
    const n = /[CQ]/.test(p.getAttribute("d")!) ? Math.ceil(length / 20) : 1;
    const points = Array.from({ length: n + 1 }, (_, k) => {
      const { x, y } = p.getPointAtLength((k / n) * length);
      return { x, y };
    });
    measured.set(key, (m = { length, points }));
  }
  return m;
}

/** Builds (paused) animations for the scenario the view is showing. */
function choreograph(root: HTMLElement) {
  const out: Animation[] = [];
  const appear = (el: Element, delay: number, pop = false) =>
    out.push(
      el.animate(
        pop
          ? [
              { opacity: 0, transform: "scale(0.4)" },
              { opacity: 1, transform: "none" },
            ]
          : [{ opacity: 0 }, { opacity: 1 }],
        {
          delay,
          duration: pop ? duration.base : duration.fast,
          easing: ease.out,
          fill: "backwards",
        },
      ),
    );
  // The graph on show: the view swaps them at Tailwind's lg. Asking the
  // media query, not the layout, keeps this commit free of a forced reflow.
  // The other graph is display: none and keeps its final state.
  const wide = matchMedia("(min-width: 64rem)").matches;
  const svg = root.querySelector<SVGSVGElement>(
    `svg[data-graph="${wide ? "across" : "down"}"]`,
  )!;
  for (const p of svg.querySelectorAll<SVGPathElement>("[data-edge]"))
    measure(svg, p.dataset.edge!);
  const route = svg.dataset.route!.split(" ");
  const edges = route
    .slice(1)
    .map((to, i) => measure(svg, `${route[i]}-${to}`));
  const total = edges.reduce((sum, e) => sum + e.length, 0);
  // When the pulse reaches each stop of the route.
  const at = [0];
  edges.forEach((e, i) => at.push(at[i]! + (e.length / total) * PASS));

  {
    // Keyframes at even distances, so the pulse keeps one speed.
    const frames: Keyframe[] = [];
    let run = 0;
    edges.forEach(({ length, points }, i) => {
      const n = points.length - 1;
      points.forEach(({ x, y }, k) => {
        if (k === n && i < edges.length - 1) return; // the next edge's start
        frames.push({
          transform: `translate(${x}px, ${y}px)`,
          offset: (run + (k / n) * length) / total,
        });
      });
      run += length;
    });
    frames.at(-1)!.offset = 1;
    const pulse = svg.querySelector("[data-pulse]")!;
    out.push(pulse.animate(frames, { duration: PASS, easing: "linear" }));
    out.push(
      pulse.animate(
        [
          { opacity: 0 },
          { opacity: 1, offset: 0.03 },
          { opacity: 1, offset: 0.95 },
          { opacity: 0 },
        ],
        { duration: PASS + duration.fast, easing: "linear" },
      ),
    );
  }

  for (const el of svg.querySelectorAll<SVGElement>("[data-at]")) {
    const i = Number(el.dataset.at);
    if (el.dataset.fx === "draw")
      out.push(
        el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          delay: at[i],
          duration: at[i + 1]! - at[i]!,
          easing: "linear",
          fill: "backwards",
        }),
      );
    else appear(el, at[i]!, el.dataset.fx === "pop");
  }

  // The ladder and the transcript follow the graph. Lines queue: one
  // starts when its stop is reached and the line before has typed in.
  let cursor = 0;
  for (const el of root.querySelectorAll<HTMLElement>("[data-at]:not(svg *)")) {
    const t = at[Number(el.dataset.at)]!;
    if (el.dataset.line === undefined) {
      appear(el, t);
      continue;
    }
    const start = Math.max(t, cursor);
    const words = el.querySelectorAll("[data-w]");
    if (words.length === 0) {
      appear(el, start);
      cursor = start + duration.slow;
    } else {
      words.forEach((w, k) => appear(w, start + k * WORD));
      cursor = start + words.length * WORD;
    }
  }
  return out;
}

const reply = (demo: BabyDemo, i: number) => {
  const s = demo.scenarios[i]!;
  return {
    text: s.lines.findLast((l) => l.who === "baby")!.text,
    lang: s.lang,
  };
};

export default function Live({
  demo,
  label,
}: {
  demo: BabyDemo;
  label: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const anims = useRef<Animation[]>([]);
  // `run` counts the plays a reader asked for; 0 is the first, automatic one.
  const [pick, setPick] = useState({ i: 0, run: 0 });
  const [seen, setSeen] = useState(false);
  const [announce, setAnnounce] = useState<{ text: string; lang?: string }>();
  const reduced = useReducedMotionSafe();
  const visible = usePauseWhenHidden(root);

  // "Well in view": the box's top has passed 60% of the viewport height.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Before paint, so the final state never flashes before a replay.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const list = choreograph(el);
    for (const a of list) a.pause();
    anims.current = list;
    if (pick.run > 0)
      Promise.all(list.map((a) => a.finished)).then(
        () => setAnnounce(reply(demo, pick.i)),
        () => {}, // replaced by the next choice
      );
    return () => {
      for (const a of list) a.cancel();
      anims.current = [];
    };
  }, [demo, pick, reduced]);

  const go = visible && (seen || pick.run > 0);
  useEffect(() => {
    for (const a of anims.current) {
      if (go && a.playState === "paused") a.play();
      else if (!go && a.playState === "running") a.pause();
    }
  }, [go, pick, reduced]);

  const choose = (i: number) =>
    startTransition(() => {
      setPick((p) => ({ i, run: p.run + 1 }));
      if (reduced) setAnnounce(reply(demo, i));
    });

  // A radio group: arrows (and Home/End) move the choice and play it.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const radios = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'),
    ];
    const i = radios.indexOf(event.target as HTMLElement);
    const last = radios.length - 1;
    const next = (
      {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowDown: i === last ? 0 : i + 1,
        ArrowLeft: i === 0 ? last : i - 1,
        ArrowUp: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      } as Record<string, number>
    )[event.key];
    if (i < 0 || next === undefined) return;
    event.preventDefault();
    radios[next]!.focus({ preventScroll: true });
    choose(next);
  };

  return (
    <div ref={root}>
      <View
        demo={demo}
        label={label}
        active={pick.i}
        announce={announce}
        onPick={choose}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
