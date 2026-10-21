import { z } from "zod";

// Footer, 404, privacy, palette and the other small strings (A.13), plus the
// icon-button labels Tanishq approved on 20 Oct 2026 (docs/decisions.md).
// `{buildDate}` is filled at build time.

export const microcopy = z
  .object({
    footer: z.object({
      bio: z.string(),
      note: z.string(),
      legal: z.string().includes("{buildDate}"),
    }),
    notFound: z.object({
      title: z.string(),
      body: z.string(),
      button: z.string(),
      hint: z.string(),
    }),
    privacy: z.string(),
    palette: z.object({
      placeholder: z.string(),
      groups: z.object({
        pages: z.string(),
        projects: z.string(),
        actions: z.string(),
      }),
      actions: z.object({
        copyEmail: z.string(),
        resume: z.string(),
        theme: z.string(),
        github: z.string(),
        linkedin: z.string(),
        medium: z.string(),
      }),
      home: z.string(),
      results: z.object({
        none: z.string(),
        one: z.string(),
        other: z.string().includes("{n}"),
      }),
    }),
    jarvisToast: z.object({ text: z.string(), link: z.string() }),
    consoleGreeting: z.string(),
    simulated: z.object({
      vyro: z.string(),
      baby: z.string(),
      screens: z.string(),
    }),
    viewData: z.object({ show: z.string(), hide: z.string() }),
    copied: z.string(),
    icons: z.object({
      openMenu: z.string(),
      closeMenu: z.string(),
      search: z.string(),
      closeSearch: z.string(),
      toLight: z.string(),
      toDark: z.string(),
      pause: z.string(),
      play: z.string(),
      previous: z.string(),
      next: z.string(),
    }),
    landmarks: z.object({
      skip: z.string(),
      menu: z.string(),
      mainNav: z.string(),
      footerNav: z.string(),
    }),
    work: z.object({
      filter: z.string(),
      shown: z.string().includes("{n}").includes("{total}"),
      archive: z.string(),
    }),
    caseStudy: z.object({
      meta: z.object({
        role: z.string(),
        context: z.string(),
        period: z.string(),
        status: z.string(),
        platform: z.string(),
      }),
      tldr: z.string(),
      howBuilt: z.string(),
      toc: z.string(),
      previous: z.string(),
      next: z.string(),
      back: z.string(),
    }),
  })
  .parse({
    footer: {
      bio: "Tanishq Jain · ML & systems engineer · Indore, India",
      note: "Designed and specced by me. Built with Next.js and Claude Code.",
      legal: "© 2026 Tanishq Jain · Last updated {buildDate} · Privacy",
    },
    notFound: {
      title: "Sensor not found.",
      body: "This page doesn't exist — or it's reading 0 RPM.",
      button: "Back to home",
      hint: "Or press Ctrl K / ⌘K to search.",
    },
    privacy:
      "This site sets no cookies and runs no ad trackers. Visits are counted with Vercel Web Analytics, which doesn't use cookies. Messages sent through the contact form are emailed to me through Resend and aren't stored on this site, and Cloudflare Turnstile checks the form for bots. Questions? tanishqjain010@gmail.com.",
    palette: {
      placeholder: "Search pages and projects…",
      groups: { pages: "Pages", projects: "Projects", actions: "Actions" },
      actions: {
        copyEmail: "Copy email",
        resume: "Download resume",
        theme: "Toggle theme",
        github: "Open GitHub",
        linkedin: "Open LinkedIn",
        medium: "Open Medium",
      },
      // Phase 7: the home page's name and the result count (not in A.13;
      // listed in decisions.md).
      home: "Home",
      results: {
        none: "No results",
        one: "1 result",
        other: "{n} results",
      },
    },
    jarvisToast: {
      text: "“Hey Jarvis” wakes up Baby, my voice assistant. This website can't hear you — promise.",
      link: "See Baby →",
    },
    consoleGreeting:
      "Hi, curious engineer. This site was specced by me and built with Claude Code. Say hello: tanishqjain010@gmail.com",
    simulated: {
      vyro: "Simulated values — VYRO reads the real ones.",
      baby: "Scripted demo — not a live assistant.",
      screens: "Illustrative screens.",
    },
    viewData: { show: "View data", hide: "Hide data" },
    copied: "Copied",
    icons: {
      openMenu: "Open menu",
      closeMenu: "Close menu",
      search: "Search",
      // Phase 7: the phone palette's close button (cross-device §10).
      closeSearch: "Close search",
      toLight: "Switch to light theme",
      toDark: "Switch to dark theme",
      pause: "Pause",
      play: "Play",
      previous: "Previous",
      next: "Next",
    },
    // Phase 3: the skip link and landmark names (not in A.13; listed in
    // decisions.md for Tanishq).
    landmarks: {
      skip: "Skip to content",
      menu: "Menu",
      mainNav: "Main",
      footerNav: "Footer",
    },
    // Phase 4: the Work filter and the case-study template. Section names
    // are the spec's own (§8.3, §8.4, A.4 meta); "Filter", "Showing…",
    // "On this page" and "Back to Work" are listed in decisions.md.
    work: {
      filter: "Filter",
      shown: "Showing {n} of {total}",
      archive: "Archive",
    },
    caseStudy: {
      meta: {
        role: "Role",
        context: "Context",
        period: "Timeline",
        status: "Status",
        platform: "Platform",
      },
      tldr: "TL;DR",
      howBuilt: "How this was built",
      toc: "On this page",
      previous: "Previous",
      next: "Next",
      back: "Back to Work",
    },
  });
