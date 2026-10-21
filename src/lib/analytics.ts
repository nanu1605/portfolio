import { track } from "./track";

// Custom events (§12) from ordinary links and controls, caught by delegated
// listeners so no component needs wiring: resume downloads, outbound clicks
// and the first use of each centerpiece. Enhancements loads this after the
// page has loaded. The palette, the theme switch and the contact form call
// `track` themselves.

type Outbound = "repo" | "live" | "download" | "company" | "social";

const bare = (url: URL) => `${url.origin}${url.pathname.replace(/\/$/, "")}`;

/** Told apart by URL; `social` is the profile links in content/site.ts. */
function outbound(url: URL, social: string[]): Outbound {
  if (social.includes(bare(url))) return "social";
  if (url.pathname.includes("/releases")) return "download";
  if (url.hostname.endsWith("jainavinfotech.in")) return "company";
  if (url.hostname === "github.com") return "repo";
  return "live";
}

export function startTracking(profiles: string[]) {
  const social = profiles.map((href) => bare(new URL(href)));
  const used = new Set<string>();

  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest?.("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;
    const url = new URL(link.href);
    if (url.origin === location.origin) {
      if (url.pathname === "/resume.pdf") track("resume_download");
    } else if (url.protocol.startsWith("http"))
      track("outbound_click", { target: outbound(url, social) });
  };

  const onUse = (event: Event) => {
    if (event instanceof KeyboardEvent && event.key === "Tab") return;
    const slug = (event.target as Element)
      .closest?.("[data-centerpiece][data-ready]")
      ?.getAttribute("data-centerpiece");
    if (!slug || used.has(slug)) return;
    used.add(slug);
    track("centerpiece_interact", { slug });
  };

  const uses = ["click", "keydown", "input"] as const;
  document.addEventListener("click", onClick, true);
  for (const type of uses) document.addEventListener(type, onUse, true);
  return () => {
    document.removeEventListener("click", onClick, true);
    for (const type of uses) document.removeEventListener(type, onUse, true);
  };
}
