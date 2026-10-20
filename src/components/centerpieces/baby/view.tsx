import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type {
  BabyDemo,
  Line,
  NodeId,
  Scenario,
} from "@content/centerpieces/baby";
import { cx } from "@/lib/cx";
import { splitWords } from "@/lib/words";

// §10.1 "Follow a turn": one scenario's final state, drawn without hooks.
// The server poster and the live version both render it, so the swap
// shifts nothing. The live version replays it with the Web Animations API:
// an element with data-at appears when the pulse reaches that stop of the
// route (an index into `route`), and data-w marks a transcript line's words.

type P = readonly [number, number];
type Spot = { x: number; y: number; a: "start" | "middle" };
type Edge =
  | "wake-vad"
  | "vad-stt"
  | "stt-router"
  | "router-cloud"
  | "router-local"
  | "cloud-tools"
  | "local-tools"
  | "tools-gate"
  | "gate-voice"
  | "gate-router";

type Geometry = {
  /** data-graph: which layout this is (live.tsx animates the one on show). */
  name: "across" | "down";
  w: number;
  h: number;
  node: Record<NodeId, P>;
  label: Record<NodeId, Spot>;
  rule: Spot;
  verdict: Spot;
  /** The tool name sits after the verdict (true) or under it. */
  inline: boolean;
  redact: Spot;
  edge: Record<Edge, string>;
};

const EDGES = [
  "wake-vad",
  "vad-stt",
  "stt-router",
  "router-cloud",
  "router-local",
  "cloud-tools",
  "local-tools",
  "tools-gate",
  "gate-voice",
  "gate-router",
] as const satisfies Edge[];
const NODES = [
  "wake",
  "vad",
  "stt",
  "router",
  "cloud",
  "local",
  "tools",
  "gate",
  "voice",
] as const satisfies NodeId[];

/** JetBrains Mono at the 12 px label size: 0.6em advance + 0.08em tracking. */
const CH = 8.16;

const line = (a: P, b: P) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
/** A lane change, leaving and arriving level (horizontal flow). */
const sideways = (a: P, b: P) => {
  const m = (a[0] + b[0]) / 2;
  return `M${a[0]} ${a[1]}C${m} ${a[1]} ${m} ${b[1]} ${b[0]} ${b[1]}`;
};
/** The same for a top-to-bottom flow. */
const downward = (a: P, b: P) => {
  const m = (a[1] + b[1]) / 2;
  return `M${a[0]} ${a[1]}C${a[0]} ${m} ${b[0]} ${m} ${b[0]} ${b[1]}`;
};

const spine = (node: Record<NodeId, P>) => ({
  "wake-vad": line(node.wake, node.vad),
  "vad-stt": line(node.vad, node.stt),
  "stt-router": line(node.stt, node.router),
  "tools-gate": line(node.tools, node.gate),
  "gate-voice": line(node.gate, node.voice),
});

/** Desktop: left to right, cloud above and local below the branch. */
const across: Geometry = (() => {
  const y = 88;
  const node: Record<NodeId, P> = {
    wake: [46, y],
    vad: [124, y],
    stt: [214, y],
    router: [308, y],
    cloud: [404, 44],
    local: [404, 132],
    tools: [500, y],
    gate: [592, y],
    voice: [676, y],
  };
  const below = (id: NodeId): Spot => ({
    x: node[id][0],
    y: y + 22,
    a: "middle",
  });
  const top = 8;
  return {
    name: "across",
    w: 720,
    h: 170,
    node,
    label: {
      wake: below("wake"),
      vad: below("vad"),
      stt: below("stt"),
      router: below("router"),
      cloud: { x: 404, y: 28, a: "middle" },
      local: { x: 404, y: 154, a: "middle" },
      tools: below("tools"),
      gate: below("gate"),
      voice: below("voice"),
    },
    rule: { x: 308, y: y + 38, a: "middle" },
    verdict: { x: 592, y: y + 38, a: "middle" },
    inline: false,
    redact: { x: 460, y: 28, a: "start" },
    edge: {
      ...spine(node),
      "router-cloud": sideways(node.router, node.cloud),
      "router-local": sideways(node.router, node.local),
      "cloud-tools": sideways(node.cloud, node.tools),
      "local-tools": sideways(node.local, node.tools),
      // The agent loop: a tool's result goes back through the router.
      "gate-router": `M592 ${y}V${top + 16}Q592 ${top} 576 ${top}H324Q308 ${top} 308 ${top + 16}V${y}`,
    },
  };
})();

/** Phones and tablets: top to bottom, cloud and local side by side. */
const down: Geometry = (() => {
  const x = 34;
  const node: Record<NodeId, P> = {
    wake: [x, 18],
    vad: [x, 60],
    stt: [x, 102],
    router: [x, 144],
    cloud: [x, 202],
    local: [176, 202],
    tools: [x, 266],
    gate: [x, 308],
    voice: [x, 364],
  };
  const right = (id: NodeId): Spot => ({
    x: node[id][0] + 18,
    y: node[id][1] + 4,
    a: "start",
  });
  const loop = 12;
  return {
    name: "down",
    w: 296,
    h: 376,
    node,
    label: Object.fromEntries(NODES.map((id) => [id, right(id)])) as Record<
      NodeId,
      Spot
    >,
    rule: { x: x + 18 + 6 * CH + 10, y: 148, a: "start" },
    verdict: { x: x + 18, y: 328, a: "start" },
    inline: true,
    redact: { x: x + 18 + 5, y: 224, a: "start" },
    edge: {
      ...spine(node),
      "router-cloud": line(node.router, node.cloud),
      "router-local": downward(node.router, node.local),
      "cloud-tools": line(node.cloud, node.tools),
      "local-tools": downward(node.local, node.tools),
      "gate-router": `M${x} 308H${loop + 10}Q${loop} 308 ${loop} 298V154Q${loop} 144 ${loop + 10} 144H${x}`,
    },
  };
})();

const DOT = "M-4.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0-9 0";
const SHAPE: Partial<Record<NodeId, string>> = {
  router: "M0-6L6 0L0 6L-6 0Z", // a decision
  gate: "M-4.5-4.5h9v9h-9Z",
};

function Node({
  id,
  name,
  geo,
  at,
}: {
  id: NodeId;
  name: string;
  geo: Geometry;
  at: number;
}) {
  const [x, y] = geo.node[id];
  const l = geo.label[id];
  const shape = SHAPE[id] ?? DOT;
  const lit = at >= 0;
  return (
    <>
      <g transform={`translate(${x} ${y})`}>
        <path
          d={shape}
          strokeWidth={1.25}
          className="fill-surface stroke-border-strong"
        />
        {lit && (
          <g
            data-at={at}
            data-fx="pop"
            className="origin-center transform-fill"
          >
            <circle r={11} opacity={0.18} className="fill-baby" />
            <path
              d={shape}
              strokeWidth={1.25}
              className="fill-baby stroke-baby"
            />
          </g>
        )}
      </g>
      <text x={l.x} y={l.y} textAnchor={l.a} className="fill-fg-subtle">
        {name}
      </text>
      {lit && (
        <text
          x={l.x}
          y={l.y}
          textAnchor={l.a}
          data-at={at}
          data-fx="fade"
          className="fill-fg"
        >
          {name}
        </text>
      )}
    </>
  );
}

/** "Rule 9", or "Rule 9 → 1" when the privacy pin re-routes the turn. */
function RuleTag({
  s,
  word,
  spot,
  visits,
}: {
  s: Scenario;
  word: string;
  spot: Spot;
  visits: number[];
}) {
  const first = `${word} ${s.rules[0]}`;
  const then = s.rules[1] ? `→ ${s.rules[1]}` : "";
  const width = (first.length + (then ? then.length + 1 : 0)) * CH;
  const x = spot.a === "middle" ? spot.x - width / 2 : spot.x;
  return (
    <g className="fill-fg-muted">
      <text x={x} y={spot.y} data-at={visits[0]} data-fx="fade">
        {first}
      </text>
      {then && (
        <text
          x={x + (first.length + 1) * CH}
          y={spot.y}
          data-at={visits[1]}
          data-fx="fade"
        >
          {then}
        </text>
      )}
    </g>
  );
}

/** ALLOW (a circled tick) or CONFIRM (a warning triangle), and the tool. */
function Verdict({ s, geo, at }: { s: Scenario; geo: Geometry; at: number }) {
  const { x, y, a } = geo.verdict;
  const allow = s.verdict === "ALLOW";
  const width = 18 + s.verdict.length * CH;
  const x0 = a === "middle" ? x - width / 2 : x;
  return (
    <g data-at={at} data-fx="fade">
      <g
        transform={`translate(${x0 + 6} ${y - 4.5})`}
        fill="none"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={allow ? "stroke-accent" : "stroke-warn"}
      >
        {allow ? (
          <>
            <circle r={5.5} />
            <path d="M-2.6 0.1l1.8 1.8L2.7-2" />
          </>
        ) : (
          <>
            <path d="M0-6L6.2 4.8H-6.2Z" />
            <path d="M0-2.1v3" />
            <path d="M0 3.1v0.01" />
          </>
        )}
      </g>
      <text x={x0 + 18} y={y} className={allow ? "fill-accent" : "fill-warn"}>
        {s.verdict}
      </text>
      <text
        x={geo.inline ? x0 + width + 10 : x}
        y={geo.inline ? y : y + 16}
        textAnchor={geo.inline ? "start" : "middle"}
        className="fill-fg-muted normal-case"
      >
        {s.tool}
      </text>
    </g>
  );
}

function Graph({
  geo,
  demo,
  s,
  className,
}: {
  geo: Geometry;
  demo: BabyDemo;
  s: Scenario;
  className: string;
}) {
  const r = s.route;
  // Each edge lights on its first use; a hop is route[i] → route[i + 1].
  const lit = new Map<string, number>();
  r.slice(1).forEach((to, i) => {
    const e = `${r[i]}-${to}`;
    if (!lit.has(e)) lit.set(e, i);
  });
  const routers = r.flatMap((id, i) => (id === "router" ? [i] : []));
  const names = r.map((id) => demo.nodes[id]).join(" → ");
  return (
    <svg
      viewBox={`0 0 ${geo.w} ${geo.h}`}
      role="img"
      aria-label={`${names}. ${demo.nodes.gate}: ${s.tool}, ${s.verdict}.`}
      data-graph={geo.name}
      data-route={r.join(" ")}
      className={cx("h-auto font-mono text-mono-label uppercase", className)}
    >
      <g fill="none" strokeWidth={1} className="stroke-border-strong">
        {EDGES.map((e) => (
          <path
            key={e}
            d={geo.edge[e]}
            data-edge={e}
            // The agent loop only shows on the turn that takes it.
            visibility={
              e === "gate-router" && !lit.has(e) ? "hidden" : undefined
            }
          />
        ))}
      </g>
      <g fill="none" strokeWidth={2} className="stroke-baby">
        {[...lit].map(([e, i]) => (
          <path
            key={e}
            d={geo.edge[e as Edge]}
            pathLength={1}
            strokeDasharray="1 2"
            data-at={i}
            data-fx="draw"
          />
        ))}
      </g>
      {NODES.map((id) => (
        <Node
          key={id}
          id={id}
          name={demo.nodes[id]}
          geo={geo}
          at={r.indexOf(id)}
        />
      ))}
      <RuleTag s={s} word={demo.rule} spot={geo.rule} visits={routers} />
      <Verdict s={s} geo={geo} at={r.indexOf("gate")} />
      {s.redact && (
        <g data-at={routers.at(-1)} data-fx="fade">
          <rect
            x={geo.redact.x - 6}
            y={geo.redact.y - 10.5}
            width={demo.redacted.length * CH + 11}
            height={15}
            rx={3}
            className="fill-surface stroke-border-strong"
          />
          <text x={geo.redact.x} y={geo.redact.y} className="fill-fg-muted">
            {demo.redacted}
          </text>
        </g>
      )}
      <g data-pulse="" className="opacity-0">
        <circle r={10} opacity={0.25} className="fill-baby" />
        <circle r={3.5} className="fill-baby" />
      </g>
    </svg>
  );
}

const label = "font-mono text-mono-label uppercase text-fg-subtle";

/**
 * One rung of the ladder. In the full ladder every rung reads the same and
 * the fired one's highlight and tag light up when the pulse reaches the
 * router (no spoiler); the phones' single fired rung (`name`) appears whole.
 */
function Rule({
  n,
  text,
  name,
  fired,
  at,
}: {
  n: number;
  text: string;
  /** "Rule 9" on phones; the number alone in the full ladder. */
  name?: string;
  fired?: string;
  at?: number;
}) {
  const parts = name ? undefined : at;
  return (
    <li
      data-at={name ? at : undefined}
      className={cx(
        "relative isolate flex items-baseline gap-3 rounded-sm py-1.5 pr-2 pl-3 text-small",
        name ? "text-fg" : "text-fg-muted",
      )}
    >
      {fired && (
        <span
          aria-hidden="true"
          data-at={parts}
          className="absolute inset-0 -z-10 rounded-sm border-l-2 border-baby bg-surface-2"
        />
      )}
      <span
        className={cx(
          "shrink-0 font-mono text-mono-label text-fg-muted tabular-nums",
          !name && "w-5",
        )}
      >
        {name ?? String(n).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">{text}</span>
      {fired && (
        <span
          data-at={parts}
          className="shrink-0 font-mono text-mono-label uppercase text-fg-muted"
        >
          {fired}
        </span>
      )}
    </li>
  );
}

function Ladder({ demo, s }: { demo: BabyDemo; s: Scenario }) {
  const routers = s.route.flatMap((id, i) => (id === "router" ? [i] : []));
  // The k-th rule that fired, fired on the router's k-th visit.
  const firedAt = (sc: Scenario, n: number) =>
    sc === s ? routers[sc.rules.indexOf(n)] : undefined;
  const full = (
    <ol className="flex flex-col">
      {demo.ladder.map((text, i) => (
        <Rule
          key={text}
          n={i + 1}
          text={text}
          fired={s.rules.includes(i + 1) ? demo.fired : undefined}
          at={firedAt(s, i + 1)}
        />
      ))}
    </ol>
  );
  return (
    <div className="border-b border-border p-4 @xl:p-5 lg:border-r lg:border-b-0">
      {/* Phones and tablets: the rule that decided the turn (the graph's
          "Rule 9 → 1" shows the re-route); opening the ladder swaps it for
          the whole list, where it is highlighted too. */}
      <div className="lg:hidden">
        <details className="peer group">
          <summary
            className={cx(
              label,
              "-mt-3 inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md text-fg-muted transition-ui hover:text-fg [&::-webkit-details-marker]:hidden",
            )}
          >
            {demo.ladderTitle}
            <ChevronDown
              aria-hidden="true"
              className="size-4 transition-transform duration-(--duration-base) ease-out group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          {full}
        </details>
        <div className="peer-open:hidden">
          <Stack demo={demo} s={s}>
            {(sc) => {
              const n = sc.rules.at(-1)!;
              return (
                <ul>
                  <Rule
                    n={n}
                    text={demo.ladder[n - 1]!}
                    name={`${demo.rule} ${n}`}
                    fired={demo.fired}
                    at={firedAt(sc, n)}
                  />
                </ul>
              );
            }}
          </Stack>
        </div>
      </div>
      {/* Desktops: the ladder stays open under the router. */}
      <div className="hidden lg:block">
        <p className={cx(label, "mb-3")}>{demo.ladderTitle}</p>
        {full}
      </div>
    </div>
  );
}

/**
 * Every scenario's version stacked in one grid cell, only the chosen one
 * visible: the box keeps the tallest one's height (the longest reply, the
 * taller Devanagari lines), so switching scenarios moves nothing.
 */
function Stack({
  demo,
  s,
  children,
}: {
  demo: BabyDemo;
  s: Scenario;
  children: (sc: Scenario) => ReactNode;
}) {
  return (
    <div className="grid">
      {demo.scenarios.map((sc) => (
        <div
          key={sc.name}
          data-active={sc === s ? "" : undefined}
          aria-hidden={sc === s ? undefined : true}
          className={cx("col-start-1 row-start-1", sc !== s && "invisible")}
        >
          {children(sc)}
        </div>
      ))}
    </div>
  );
}

/** Word by word for the type-in; screen readers get the sentence whole. */
function Words({ text, lang }: { text: string; lang?: string }) {
  return (
    <>
      <span aria-hidden="true">
        {splitWords(text, lang ?? "en").map((t, i) =>
          t.space ? (
            " "
          ) : (
            <span key={i} data-w="">
              {t.text}
            </span>
          ),
        )}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

function TranscriptLine({
  demo,
  sc,
  line,
  at,
}: {
  demo: BabyDemo;
  sc: Scenario;
  line: Line;
  at?: number;
}) {
  if (line.who === "note")
    return (
      <li
        data-line=""
        data-at={at}
        className="grid grid-cols-[3rem_1fr] gap-x-3"
      >
        <span />
        <p className="border-l border-border-strong pl-3 text-small text-fg-muted">
          {line.text}
        </p>
      </li>
    );
  const baby = line.who === "baby";
  return (
    <li
      data-line=""
      data-at={at}
      className="grid grid-cols-[3rem_1fr] items-baseline gap-x-3"
    >
      <span data-w="" className={label}>
        {baby ? demo.baby : demo.you}
      </span>
      <p className={cx("text-body", baby ? "text-fg" : "text-fg-muted")}>
        <span lang={sc.lang}>
          <Words text={line.text} lang={sc.lang} />
        </span>
        {line.tag && (
          <>
            {" "}
            <span
              data-w=""
              data-honesty=""
              className={cx(label, "whitespace-nowrap")}
            >
              {line.tag}
            </span>
          </>
        )}
      </p>
    </li>
  );
}

function Transcript({
  demo,
  s,
  announce,
}: {
  demo: BabyDemo;
  s: Scenario;
  announce?: { text: string; lang?: string };
}) {
  return (
    <div data-transcript="" className="p-4 @xl:p-5">
      <p className={cx(label, "mb-3")}>{demo.transcript}</p>
      <Stack demo={demo} s={s}>
        {(sc) => (
          <ol className="flex flex-col gap-3">
            {sc.lines.map((line, i) => (
              <TranscriptLine
                key={i}
                demo={demo}
                sc={sc}
                line={line}
                at={sc === s ? sc.route.lastIndexOf(line.at) : undefined}
              />
            ))}
          </ol>
        )}
      </Stack>
      {/* The final reply, announced once when a chosen scenario finishes. */}
      <p aria-live="polite" className="sr-only">
        {announce && <span lang={announce.lang}>{announce.text}</span>}
      </p>
    </div>
  );
}

export type ViewProps = {
  demo: BabyDemo;
  /** "Scripted demo — not a live assistant." (A.13) */
  label: string;
  active: number;
  announce?: { text: string; lang?: string };
  onPick?: (i: number) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function View({
  demo,
  label: honesty,
  active,
  announce,
  onPick,
  onKeyDown,
}: ViewProps) {
  const s = demo.scenarios[active]!;
  return (
    <div className="@container overflow-clip rounded-lg border border-border bg-surface depth">
      <div className="flex flex-col gap-4 border-b border-border p-4 @xl:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="font-mono text-mono-label uppercase text-fg">
            {demo.name}
          </p>
          <p data-honesty="" className={label}>
            {honesty}
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label={demo.scenario}
          onKeyDown={onKeyDown}
          className="grid grid-cols-2 gap-2 @xl:flex @xl:flex-wrap"
        >
          {demo.scenarios.map((sc, i) => (
            <button
              key={sc.name}
              type="button"
              role="radio"
              aria-checked={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={onPick && (() => onPick(i))}
              className={cx(
                "group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border-strong px-4 py-1 text-center text-small leading-tight text-fg-muted transition-ui pointer-fine:min-h-9",
                "hover:bg-surface-2 hover:text-fg",
                "aria-checked:border-fg aria-checked:bg-surface-2 aria-checked:text-fg",
              )}
            >
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-baby opacity-0 group-aria-checked:opacity-100"
              />
              {sc.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid @xl:max-lg:grid-cols-[19rem_1fr] lg:grid-cols-[1.2fr_1fr]">
        <div className="border-b border-border p-4 @xl:max-lg:row-span-2 @xl:max-lg:border-r @xl:max-lg:border-b-0 @xl:max-lg:p-5 lg:col-span-2 lg:px-6 lg:py-7">
          <Graph
            geo={down}
            demo={demo}
            s={s}
            className="mx-auto w-full max-w-[22rem] lg:hidden"
          />
          <Graph
            geo={across}
            demo={demo}
            s={s}
            className="mx-auto hidden w-full max-w-[50rem] lg:block"
          />
        </div>
        <Ladder demo={demo} s={s} />
        <Transcript demo={demo} s={s} announce={announce} />
      </div>
    </div>
  );
}
