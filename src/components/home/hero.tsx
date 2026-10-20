import { preload } from "react-dom";
import { home } from "@content/home";
import { media } from "@content/screens";
import { SignalLine, TextReveal } from "@/components/motion/motion";
import { Button } from "@/components/ui/button";
import { Picture } from "@/components/ui/figure";
import { StatusPill } from "@/components/ui/status";
import { resolve } from "@/lib/fill";
import type { liveMetrics } from "@/lib/github";
import { HeroStage } from "./hero-stage";

const photo = media.photo.hero;
// The photo's layout width: full bleed on phones, ~75% on tablets, 40% in
// phone landscape and the 5-of-12 column on desktop (cross-device §5).
const sizes =
  "(min-width: 1024px) min(40vw, 600px), (orientation: landscape) and (max-height: 500px) 40vw, (min-width: 768px) 75vw, 100vw";

const variants = ["primary", "secondary", "ghost"] as const;

/**
 * Home hero (§8.2, §6.3). Always on the dark stage. Everything moves from
 * first paint in CSS, so nothing waits for hydration: the words rise, the
 * photo comes up out of black, the signal line draws and drifts, and the
 * glow follows the pointer or a tap.
 */
export function Hero({
  live,
}: {
  live: Awaited<ReturnType<typeof liveMetrics>>;
}) {
  const { hero } = home;
  const set = (format: "avif" | "webp") =>
    photo.variants.map((v) => `${v[format]} ${v.width}w`).join(", ");
  preload(photo.variants.at(-1)!.avif, {
    as: "image",
    type: "image/avif",
    imageSrcSet: set("avif"),
    imageSizes: sizes,
    fetchPriority: "high",
  });

  return (
    <HeroStage
      labelledBy="hero-title"
      // The signal line is part of the first view, inside the min-height.
      className="relative isolate flex flex-col overflow-clip bg-bg text-fg lg:min-h-[calc(min(100svh,60rem)_-_var(--header-h))]"
    >
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,var(--bg),transparent)]"
      />
      <div data-hero-glow="" aria-hidden="true">
        <div className="glow-drift" />
      </div>

      <div className="mx-auto grid max-w-wide items-center gap-10 px-page pt-10 md:pt-16 w-full flex-1 lg:grid-cols-12 lg:gap-8 lg:py-12 phone-landscape:grid-cols-[1fr_40%] phone-landscape:gap-6 phone-landscape:py-6">
        <div className="flex flex-col items-start gap-6 lg:col-span-7">
          <p className="font-mono text-mono-label uppercase text-fg-subtle">
            {hero.eyebrow}
          </p>
          <TextReveal
            as="h1"
            id="hero-title"
            trigger="load"
            text={hero.headline}
            className="text-display phone-landscape:text-h1"
          />
          <p className="max-w-text text-body-lg text-fg-muted">
            {hero.subline}
          </p>
          <StatusPill text={resolve(hero.statusPill, live)!} />
          <div className="grid w-full grid-cols-2 gap-3 pt-2 sm:flex sm:w-auto sm:flex-wrap">
            {hero.ctas.map((cta, i) => (
              <Button
                key={cta.href}
                // In-page on Home, so Lenis or CSS can scroll it smoothly.
                href={cta.href.replace(/^\/#/, "#")}
                variant={variants[i]}
                magnetic={i === 0}
                className={i === 0 ? "col-span-2" : undefined}
              >
                {cta.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="hero-glide max-md:-mx-gutter md:ml-auto md:w-[min(75%,calc(60svh_*_0.8))] lg:col-span-5 lg:w-full phone-landscape:mx-0 phone-landscape:w-full">
          <Picture
            image={photo}
            alt={hero.photoAlt}
            sizes={sizes}
            priority
            className="hero-photo hero-mask aspect-[4/5] object-cover object-top lg:max-h-[calc(min(100svh,60rem)_-_var(--header-h)_-_10rem)]"
          />
        </div>
      </div>

      <SignalLine animate className="h-16 md:h-24" />
    </HeroStage>
  );
}
