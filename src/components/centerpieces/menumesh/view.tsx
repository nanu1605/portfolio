import type { CSSProperties, Ref } from "react";
import { cx } from "@/lib/cx";
import { Stepper } from "../stepper";

// §10.4 "Table to bill" (MenuMesh accent), for the server poster and the
// live version alike. From 768 × 600 a sticky frame shows each step's
// captured screen while the steps scroll past; below that, the shared
// swipeable stepper (cross-device §6). CSS picks one, so nothing waits on JS.

/** A captured screen with its web variants (content/screens.ts). */
export type Shot = {
  alt: string;
  view: string;
  width: number;
  height: number;
  blur: string;
  src: string;
  avif: string;
  webp: string;
  /** The part shown where room is short: [x, y, width, height] in pixels. */
  detail: readonly [number, number, number, number];
  /** A staff screen captured at phone width: framed like the landscape ones. */
  phone?: boolean;
};

export type MenumeshData = {
  steps: {
    name: string;
    text: string;
    shot: Shot;
    /** The phone stepper's capture, when there is one at phone width. */
    phone?: Shot;
  }[];
  /** The Order step's menu in Hindi. */
  hindi: { step: number; shot: Shot };
  title: string;
  languages: { label: string; en: string; hi: string };
  labels: { previous: string; next: string };
};

export type MenumeshState = {
  /** The sticky story's step, from the scroll position. */
  story: number;
  /** The stepper's step. */
  step: number;
  hindiMenu: boolean;
};

type Live = {
  storyRef?: Ref<HTMLOListElement>;
  trackRef?: Ref<HTMLDivElement>;
  onGo?: (step: number) => void;
  onHindi?: (on: boolean) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
/** The guest phone: whole in the frame, a fading menu in the stepper. */
const portrait = (shot: Shot) => !shot.phone && shot.height > shot.width;

function Img({
  shot,
  sizes,
  className,
  style,
}: {
  shot: Shot;
  sizes: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={shot.avif} sizes={sizes} />
      <img
        src={shot.src}
        srcSet={shot.webp}
        sizes={sizes}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        loading="lazy"
        decoding="async"
        style={{ backgroundImage: `url(${shot.blur})`, ...style }}
        className={cx("bg-cover", className)}
      />
    </picture>
  );
}

/**
 * `shot.detail` at `width`: a box of the detail's shape with the capture
 * scaled and offset inside it. Menus fade out at the bottom, their top
 * corners rounded like the phone (the capture's own are square); landscape
 * screens get a hairline frame.
 */
function Detail({
  shot,
  width,
  box,
}: {
  shot: Shot;
  width: string;
  /** The box's rendered width, for `sizes`. */
  box: string;
}) {
  const [x, y, w, h] = shot.detail;
  return (
    <div
      className={cx(
        "relative shrink-0 overflow-clip",
        portrait(shot)
          ? "rounded-t-lg mask-b-from-90% mask-b-to-100%"
          : "rounded-md border border-border",
      )}
      style={{ width, aspectRatio: `${w} / ${h}` }}
    >
      <Img
        shot={shot}
        sizes={`calc(${box} * ${(shot.width / w).toFixed(2)})`}
        className="absolute max-w-none"
        style={{
          width: `${(shot.width / w) * 100}%`,
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
        }}
      />
    </div>
  );
}

/** One of the stacked screens; the shown one fades in (opacity only). */
const layer = (on: boolean) =>
  cx(
    "flex flex-col items-center gap-3 transition-opacity duration-(--duration-slow) ease-out motion-reduce:transition-none",
    on ? "opacity-100" : "opacity-0",
  );

/** The screen's view under it ("Demo: kitchen tablet, ready"). */
const ViewLine = ({ shot }: { shot: Shot }) => (
  <span
    aria-hidden="true"
    className="shrink-0 text-center font-mono text-mono-label text-fg-subtle"
  >
    {shot.view}
  </span>
);

/**
 * The sticky frame: phones whole, at the frame's height; landscape screens
 * as their detail, at the column's width.
 */
function Frame({ shots, shown }: { shots: Shot[]; shown: number }) {
  return (
    <div className="relative h-full">
      {shots.map((shot, i) => (
        <div
          key={i}
          aria-hidden={i !== shown}
          className={cx("absolute inset-0 justify-center", layer(i === shown))}
        >
          {portrait(shot) ? (
            <Img
              shot={shot}
              sizes="20rem"
              // The frame's height less the view line: an explicit height,
              // so every engine sizes the width from the image's ratio.
              className="h-[calc(min(65svh,40rem)-2.5rem)] w-auto max-w-full rounded-lg object-contain"
            />
          ) : (
            <Detail shot={shot} width="100%" box="(100vw - 4rem) * 0.4" />
          )}
          <ViewLine shot={shot} />
        </div>
      ))}
    </div>
  );
}

/**
 * The stepper's screens, stacked in one grid cell so the box takes the
 * tallest. Menus up to 16.25rem wide (cross-device §6: legible on a
 * 360 px phone), the other screens the slide's width; every detail fits
 * the viewport's height.
 */
function Details({ shots, shown }: { shots: Shot[]; shown: number }) {
  return (
    <div className="grid w-full">
      {shots.map((shot, i) => {
        const [, , w, h] = shot.detail;
        const fit = `(100svh - 6rem) * ${(w / h).toFixed(3)}`;
        return (
          <div
            key={i}
            aria-hidden={i !== shown}
            className={cx("[grid-area:1/1]", layer(i === shown))}
          >
            {portrait(shot) ? (
              <Detail
                shot={shot}
                width={`min(100%, 16.25rem, ${fit})`}
                box="16.25rem"
              />
            ) : (
              <Detail
                shot={shot}
                width={`min(100%, ${fit})`}
                box="(100vw - 3.5rem)"
              />
            )}
            <ViewLine shot={shot} />
          </div>
        );
      })}
    </div>
  );
}

function Label({ i, name }: { i: number; name: string }) {
  return (
    <p className="flex items-center gap-2 font-mono text-mono-label uppercase text-fg-subtle">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-menumesh" />
      <span className="text-fg">{pad(i + 1)}</span>
      {name}
    </p>
  );
}

/** English/हिंदी: the pressed one gets the MenuMesh border and dot. */
function Languages({
  on,
  onHindi,
  languages,
}: {
  on: boolean;
  onHindi?: (on: boolean) => void;
  languages: MenumeshData["languages"];
}) {
  const options = [
    { lang: "en", text: languages.en, hindi: false },
    { lang: "hi", text: languages.hi, hindi: true },
  ];
  return (
    <div role="group" aria-label={languages.label} className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.lang}
          type="button"
          lang={o.lang}
          aria-pressed={o.hindi === on}
          onClick={onHindi && (() => onHindi(o.hindi))}
          className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-border-strong px-4 text-small text-fg-muted transition-ui hover:bg-surface-2 hover:text-fg aria-pressed:border-menumesh aria-pressed:bg-surface-2 aria-pressed:text-fg"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-menumesh opacity-0 transition-ui group-aria-pressed:opacity-100"
          />
          {o.text}
        </button>
      ))}
    </div>
  );
}

export function View({
  steps,
  hindi,
  title,
  languages,
  labels,
  state,
  storyRef,
  trackRef,
  onGo,
  onHindi,
}: MenumeshData & Live & { state: MenumeshState }) {
  // The frame's screens: one per step, then the Hindi menu.
  const shots = [...steps.map((s) => s.shot), hindi.shot];
  const shown =
    state.story === hindi.step && state.hindiMenu ? steps.length : state.story;

  return (
    <div className="@container">
      {/* Sticky phone story (cross-device §6): from 768 × 600, where the
          frame has room to pin. The frame gets the wider column, so the
          landscape screens stay legible. */}
      <div className="hidden gap-8 lg:gap-12 [@media(min-width:768px)_and_(min-height:600px)]:grid [@media(min-width:768px)_and_(min-height:600px)]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ol ref={storyRef}>
          {steps.map((step, i) => (
            <li
              key={step.name}
              data-step={i}
              aria-current={i === state.story ? "step" : undefined}
              className="relative flex min-h-[min(65svh,40rem)] flex-col justify-center gap-3 pl-5"
            >
              {/* The step in view: a bar in the product's accent. */}
              <span
                aria-hidden="true"
                className={cx(
                  "absolute inset-y-[30%] left-0 w-0.5 rounded-full bg-menumesh transition-[opacity,transform] duration-(--duration-slow) ease-out motion-reduce:transition-none",
                  i === state.story ? "opacity-100" : "scale-y-0 opacity-0",
                )}
              />
              <Label i={i} name={step.name} />
              <p
                className={cx(
                  "text-body",
                  i === state.story ? "text-fg" : "text-fg-muted",
                )}
              >
                {step.text}
              </p>
              {i === hindi.step && (
                <Languages
                  on={state.hindiMenu}
                  onHindi={onHindi}
                  languages={languages}
                />
              )}
            </li>
          ))}
        </ol>
        <div>
          {/* Pinned in the middle of the viewport below the header. */}
          <div className="sticky top-[calc(var(--header-h)_+_(100svh_-_var(--header-h)_-_min(65svh,40rem))_/_2)] isolate h-[min(65svh,40rem)]">
            <span
              aria-hidden="true"
              data-glow=""
              className="pointer-events-none absolute inset-[10%] -z-10 rounded-full bg-[radial-gradient(closest-side,var(--menumesh),transparent)] opacity-10 dark:opacity-20"
            />
            <Frame shots={shots} shown={shown} />
          </div>
        </div>
      </div>

      {/* Phones and short screens: the shared swipeable stepper. */}
      <div className="[@media(min-width:768px)_and_(min-height:600px)]:hidden">
        <Stepper
          id="table-to-bill"
          label={title}
          current={state.step}
          labels={labels}
          trackRef={trackRef}
          onGo={onGo}
          tone="menumesh"
          steps={steps.map((step, i) => ({
            name: step.name,
            content: (
              // Every slide is as tall as the tallest: the screen's panel
              // takes the slack, so the text sits on the buttons. Phone
              // landscape and short windows: screen beside the text.
              <div className="flex h-full flex-col gap-4 @2xl:grid @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @2xl:items-center @2xl:gap-6">
                <div className="flex flex-1 items-center justify-center rounded-md border border-border bg-bg bg-grid px-3 pt-4 pb-3">
                  <Details
                    shots={
                      i === hindi.step
                        ? [step.shot, hindi.shot]
                        : [step.phone ?? step.shot]
                    }
                    shown={i === hindi.step && state.hindiMenu ? 1 : 0}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label i={i} name={step.name} />
                  <p className="text-body text-fg">{step.text}</p>
                  {i === hindi.step && (
                    <Languages
                      on={state.hindiMenu}
                      onHindi={onHindi}
                      languages={languages}
                    />
                  )}
                </div>
              </div>
            ),
          }))}
        />
      </div>
    </div>
  );
}
