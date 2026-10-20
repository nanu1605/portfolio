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
// plays once when the graph is well in view and then holds (under 5 s); a
// chip plays its scenario once. The transcript types in only once it is in
// view too (on phones it sits a screen below the graph). Everything pauses
// off-screen and in hidden tabs. A final state the reader may already have
// seen never blanks to replay itself (cross-device §4: never final → 0).
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
 * measured once, in idle time after mount (warm), never inside a tap.
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

/**
 * The graph on show: the view swaps them at Tailwind's lg. Asking the media
 * query, not the layout, keeps a commit free of a forced reflow. The other
 * graph is display: none and keeps its final state.
 */
const onShow = (root: HTMLElement) =>
  root.querySelector<SVGSVGElement>(
    `svg[data-graph="${matchMedia("(min-width: 64rem)").matches ? "across" : "down"}"]`,
  )!;

/** Measures every edge of the graph on show (and so caches them). */
function warm(root: HTMLElement) {
  const svg = onShow(root);
  for (const p of svg.querySelectorAll<SVGPathElement>("[data-edge]"))
    measure(svg, p.dataset.edge!);
  return svg;
}

type Play = {
  /** The pulse, the graph's stops and the ladder. */
  graph: Animation[];
  /** The transcript's lines. */
  text: Animation[];
  /** When the transcript's first line starts. */
  lead: number;
};
const none: Play = { graph: [], text: [], lead: 0 };

/** Builds (paused) animations for the scenario the view is showing. */
function choreograph(root: HTMLElement): Play {
  const graph: Animation[] = [];
  const text: Animation[] = [];
  const appear = (el: Element, delay: number, pop = false) =>
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
    );
  const svg = warm(root);
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
    graph.push(pulse.animate(frames, { duration: PASS, easing: "linear" }));
    graph.push(
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
    graph.push(
      el.dataset.fx === "draw"
        ? el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
            delay: at[i],
            duration: at[i + 1]! - at[i]!,
            easing: "linear",
            fill: "backwards",
          })
        : appear(el, at[i]!, el.dataset.fx === "pop"),
    );
  }

  // The ladder and the transcript follow the graph. Lines queue: one
  // starts when its stop is reached and the line before has typed in.
  let cursor = 0;
  let lead = Infinity;
  for (const el of root.querySelectorAll<HTMLElement>("[data-at]:not(svg *)")) {
    const t = at[Number(el.dataset.at)]!;
    if (el.dataset.line === undefined) {
      graph.push(appear(el, t));
      continue;
    }
    const start = Math.max(t, cursor);
    lead = Math.min(lead, start);
    const words = el.querySelectorAll("[data-w]");
    if (words.length === 0) {
      text.push(appear(el, start));
      cursor = start + duration.slow;
    } else {
      words.forEach((w, k) => text.push(appear(w, start + k * WORD)));
      cursor = start + words.length * WORD;
    }
  }
  return { graph, text, lead: Number.isFinite(lead) ? lead : 0 };
}

/** Plays or pauses a group where it stands. */
function run(list: Animation[], on: boolean) {
  for (const a of list)
    if (on && a.playState === "paused") a.play();
    else if (!on && a.playState === "running") a.pause();
}

function seek(list: Animation[], t: number) {
  for (const a of list) a.currentTime = t;
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
  const play = useRef<Play>(none);
  /** Whether the transcript has started typing in, this play. */
  const typing = useRef(false);
  // `run` counts the plays a reader asked for; 0 is the first, automatic one.
  const [pick, setPick] = useState({ i: 0, run: 0 });
  // The first play: "wait" while the graph is below the viewport, "go" once
  // it is well in view, "hold" if the graph was on screen (or scrolled past)
  // when this mounted, so the reader may have seen its final state.
  const [first, setFirst] = useState<"wait" | "go" | "hold">();
  const [reading, setReading] = useState(false);
  const [announce, setAnnounce] = useState<{ text: string; lang?: string }>();
  const reduced = useReducedMotionSafe();
  const visible = usePauseWhenHidden(root);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let known = false;
    const graphs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const { top, height } = e.boundingClientRect;
          if (height === 0) continue; // the other layout's graph (display: none)
          const next = !known
            ? top < (e.rootBounds?.bottom ?? innerHeight)
              ? "hold"
              : "wait"
            : e.intersectionRatio >= 0.85
              ? "go"
              : undefined;
          known = true;
          if (next) setFirst(next);
          if (next && next !== "wait") graphs.disconnect();
        }
      },
      { threshold: [0, 0.85] },
    );
    for (const g of el.querySelectorAll("svg[data-graph]")) graphs.observe(g);
    // Half the transcript on screen: it types in from there. Reached first
    // (a jump past the graph), it starts the waiting first play too.
    const text = new IntersectionObserver(
      ([e]) => {
        const on = (e?.intersectionRatio ?? 0) >= 0.5;
        setReading(on);
        if (on) setFirst((f) => (f === "wait" ? "go" : f));
      },
      { threshold: 0.5 },
    );
    text.observe(el.querySelector("[data-transcript]")!);
    // Measure the edges now, while nothing waits on it (Safari has no
    // requestIdleCallback), so a chip's first play does no layout work.
    const idle = window.requestIdleCallback ?? setTimeout;
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const id = idle(() => warm(el));
    return () => {
      graphs.disconnect();
      text.disconnect();
      cancel(id);
    };
  }, []);

  // Built paused, before paint, so the final state never flashes before a
  // replay. The first play builds only once it is sure to play unseen.
  const build =
    !reduced && (pick.run > 0 || first === "wait" || first === "go");
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !build) return;
    const p = choreograph(el);
    for (const a of [...p.graph, ...p.text]) a.pause();
    play.current = p;
    typing.current = false;
    // A chosen scenario's reply is announced when the turn reaches Voice.
    if (pick.run > 0)
      Promise.all(p.graph.map((a) => a.finished)).then(
        () => setAnnounce(reply(demo, pick.i)),
        () => {}, // replaced by the next choice
      );
    return () => {
      for (const a of [...p.graph, ...p.text]) a.cancel();
      play.current = none;
    };
  }, [demo, pick, build]);

  const go = visible && (pick.run > 0 || first === "go");
  useEffect(() => {
    const { graph, text, lead } = play.current;
    run(graph, go);
    // The transcript waits until it is in view. Starting late, it skips
    // its lead-in: the utterance types in at once and the rest follows.
    const type = go && (typing.current || reading);
    if (type && !typing.current) {
      typing.current = true;
      seek(text, Math.min(Number(graph[0]?.currentTime ?? 0), lead));
    }
    run(text, type);
  }, [go, reading, pick, build]);

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
