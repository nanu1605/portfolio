import type { Ref } from "react";
import { Chip } from "@/components/ui/tag";
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
};

export type MenumeshData = {
  steps: { name: string; text: string; shot: Shot }[];
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

function Picture({ shot, sizes }: { shot: Shot; sizes: string }) {
  const portrait = shot.height > shot.width;
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
        style={{ backgroundImage: `url(${shot.blur})` }}
        className={cx(
          "border border-border bg-cover object-contain",
          // Phones fill the height left by the label; the rest, the width.
          portrait
            ? "min-h-0 w-auto max-w-full flex-1 rounded-xl"
            : "h-auto min-h-0 w-full rounded-lg",
        )}
      />
    </picture>
  );
}

/**
 * Screens stacked in one box, each with its view under it ("Demo: kitchen
 * tablet, ready"); the shown one fades in (opacity only).
 */
function Stage({
  shots,
  shown,
  sizes,
  className,
}: {
  shots: Shot[];
  shown: number;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      {shots.map((shot, i) => (
        <div
          key={shot.src}
          aria-hidden={i !== shown}
          className={cx(
            "absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-(--duration-slow) ease-out motion-reduce:transition-none",
            i === shown ? "opacity-100" : "opacity-0",
          )}
        >
          <Picture shot={shot} sizes={sizes} />
          <span
            aria-hidden="true"
            className="shrink-0 text-center font-mono text-mono-label text-fg-subtle"
          >
            {shot.view}
          </span>
        </div>
      ))}
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

function Languages({
  on,
  onHindi,
  languages,
}: {
  on: boolean;
  onHindi?: (on: boolean) => void;
  languages: MenumeshData["languages"];
}) {
  return (
    <div role="group" aria-label={languages.label} className="flex gap-2">
      <Chip pressed={!on} lang="en" onClick={onHindi && (() => onHindi(false))}>
        {languages.en}
      </Chip>
      <Chip pressed={on} lang="hi" onClick={onHindi && (() => onHindi(true))}>
        {languages.hi}
      </Chip>
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
          frame has room to pin. */}
      <div className="hidden gap-8 lg:gap-12 [@media(min-width:768px)_and_(min-height:600px)]:grid [@media(min-width:768px)_and_(min-height:600px)]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
              className="pointer-events-none absolute inset-[10%] -z-10 rounded-full bg-[radial-gradient(closest-side,var(--menumesh),transparent)] opacity-10 dark:opacity-20"
            />
            <Stage
              shots={shots}
              shown={shown}
              sizes="(min-width: 1024px) 440px, 45vw"
              className="h-full"
            />
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
          steps={steps.map((step, i) => ({
            name: step.name,
            content: (
              // Phone landscape and short windows: screen beside the text.
              <div className="flex h-full flex-col gap-4 @2xl:grid @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @2xl:items-center @2xl:gap-6">
                <div className="rounded-md border border-border bg-bg bg-grid p-3">
                  <Stage
                    shots={
                      i === hindi.step ? [step.shot, hindi.shot] : [step.shot]
                    }
                    shown={i === hindi.step && state.hindiMenu ? 1 : 0}
                    sizes="(min-width: 640px) 600px, calc(100vw - 4rem)"
                    className="h-[min(40svh,22rem)] @2xl:h-[min(55svh,22rem)]"
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
