"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  nearest,
  ReservoirView,
  SIDE,
  TH,
  toWeights,
  toXY,
  TW,
  type ReservoirData,
  type ReservoirState,
  type Weights,
} from "./view";

// The weight mixer's state and input (§10.5, cross-device §6): a mouse
// drags from anywhere in the triangle; a finger drags only the 44 px
// handle (the triangle keeps vertical scrolling) and taps to place; the
// arrow keys move the cursor, Shift further; the <select> jumps to an agent.

const STEP = 0.02;
const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

type Drag = { id: number; dx: number; dy: number; rect: DOMRect };

export default function ReservoirLive({
  data,
  initial,
}: {
  data: ReservoirData;
  initial: number;
}) {
  const [cursor, setCursor] = useState<Weights>(data.agents[initial]!.weights);
  const [drier, setDrier] = useState(false);
  const [moving, setMoving] = useState<ReservoirState["moving"]>();

  const drag = useRef<Drag | null>(null);
  // Pointer moves are coalesced into one render per frame.
  const frame = useRef(0);
  const pending = useRef<Weights>(cursor);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const fromPointer = (
    e: { clientX: number; clientY: number },
    rect: DOMRect,
    dx = 0,
    dy = 0,
  ) =>
    toWeights(
      ((e.clientX - dx - rect.left) / rect.width) * TW,
      ((e.clientY - dy - rect.top) / rect.height) * TH,
    );

  const follow = (w: Weights) => {
    pending.current = w;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      setCursor(pending.current);
    });
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const handle = (e.target as Element).closest<HTMLElement>("[data-handle]");
    if (!handle && e.pointerType !== "mouse") return; // a tap places (onClick)
    e.preventDefault(); // no text selection; focus is moved by hand
    const rect = e.currentTarget.getBoundingClientRect();
    let dx = 0;
    let dy = 0;
    if (handle) {
      // Keep the grab offset, so the cursor doesn't jump under the finger.
      const h = handle.getBoundingClientRect();
      dx = e.clientX - (h.left + h.width / 2);
      dy = e.clientY - (h.top + h.height / 2);
    }
    drag.current = { id: e.pointerId, dx, dy, rect };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget
      .querySelector<HTMLElement>("[data-handle]")
      ?.focus({ preventScroll: true });
    setMoving("drag");
    if (!handle) follow(fromPointer(e, rect));
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d?.id === e.pointerId) follow(fromPointer(e, d.rect, d.dx, d.dy));
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    setMoving(undefined);
  };

  const state: ReservoirState = {
    cursor,
    selected: nearest(data.agents, cursor),
    drier,
    moving,
  };

  return (
    <ReservoirView
      data={data}
      state={state}
      on={{
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onClick: (e) => {
          if ((e.target as Element).closest("[data-handle]")) return;
          setMoving(undefined);
          setCursor(fromPointer(e, e.currentTarget.getBoundingClientRect()));
        },
        onKey: (e) => {
          const d = ARROWS[e.key];
          if (!d) return;
          e.preventDefault();
          const step = (e.shiftKey ? STEP * 5 : STEP) * SIDE;
          setMoving(undefined);
          setCursor((c) => {
            const p = toXY(c);
            return toWeights(p.x + d[0] * step, p.y + d[1] * step);
          });
        },
        onSelect: (e) => {
          setMoving("glide");
          setCursor(data.agents[Number(e.target.value)]!.weights);
        },
        onDrier: () => startTransition(() => setDrier((v) => !v)),
      }}
    />
  );
}
