import { z } from "zod";
import { Link } from "./schema";

// The Company page (A.7). The Home band's copy is in home.ts.

const Product = z.object({
  name: z.string(),
  accent: z.enum(["menumesh", "vyro", "baby"]),
  tagline: z.string(),
  description: z.string(),
  badges: z.array(z.string()).min(1),
  links: z.array(Link).min(1),
});

export const company = z
  .object({
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    intro: z.string(),
    principles: z.array(
      z.object({ title: z.string(), body: z.string().optional() }),
    ),
    products: z.array(Product).length(3),
    services: z.object({
      title: z.string(),
      items: z.array(z.object({ name: z.string(), body: z.string() })),
    }),
    platformLink: Link,
    site: z.object({
      live: Link,
      /** Shown while `jainavLive` is false. */
      pending: z.object({ text: z.string(), repo: Link }),
    }),
    email: z.email(),
  })
  .parse({
    eyebrow: "Founder",
    title: "Jainav Infotech",
    subtitle: "A product company from Indore, Madhya Pradesh.",
    intro:
      "I founded Jainav Infotech Private Limited to ship software people can actually use — and to build it for others. Each product keeps its own name and look, with a small 'by Jainav' tag.",
    principles: [
      { title: "Privacy by default", body: "Data stays where it belongs." },
      {
        title: "Fast, light software",
        body: "Small, quick apps that respect your machine.",
      },
      { title: "Built in Indore, for the world" },
      { title: "We ship our own products", body: "We build what we use." },
    ],
    products: [
      {
        name: "MenuMesh",
        accent: "menumesh",
        tagline: "QR table ordering for restaurants.",
        description:
          "Guests scan the QR code on their table and order from their own phone, in English or Hindi. Waiters and the kitchen follow every dish until it's served, and the bill, with GST and charges, is ready in one tap. Guests pay the restaurant directly; MenuMesh takes no commission.",
        badges: ["Launching soon"],
        links: [
          { label: "menumesh.in", href: "https://menumesh.in" },
          { label: "Case study", href: "/work/menumesh" },
        ],
      },
      {
        name: "VYRO",
        accent: "vyro",
        tagline: "Know your machine.",
        description:
          "See what your Windows PC is doing right now on animated gauges: usage, clocks, temperatures, power and fan speeds, with seven days of history, health checks and alerts. Gamers also get frame rates, an overlay and replays of recent sessions. A Pro edition is launching soon.",
        badges: ["Beta", "Free"],
        links: [
          {
            label: "Download",
            href: "https://github.com/nanu1605/vyro-releases/releases",
          },
          { label: "Case study", href: "/work/vyro" },
          {
            label: "jainavinfotech.in/products/vyro",
            href: "https://jainavinfotech.in/products/vyro",
            requires: "jainavLive",
          },
        ],
      },
      {
        name: "Baby",
        accent: "baby",
        tagline: "Your personal voice assistant for Windows.",
        description:
          "Talk to your PC in English, Hindi or Hinglish. Baby opens apps, finds files, browses the web and runs longer jobs in the background — and asks before it changes anything.",
        badges: ["Free", "Open source"],
        links: [
          {
            label: "Download",
            href: "https://github.com/nanu1605/baby/releases",
          },
          { label: "Case study", href: "/work/baby" },
        ],
      },
    ],
    services: {
      title: "We also build for clients",
      items: [
        {
          name: "Custom software & SaaS",
          body: "web apps, SaaS platforms, and mobile and desktop apps.",
        },
        {
          name: "AI & ML",
          body: "LLM apps and assistants, search and RAG, automation, forecasting and analytics.",
        },
        {
          name: "Cloud & DevOps",
          body: "CI/CD, containers, cloud setup, monitoring and cost tuning.",
        },
        {
          name: "E-commerce & web",
          body: "online stores, marketplaces, portals and fast marketing sites.",
        },
      ],
    },
    platformLink: {
      label: "The company's website and store is one of my case studies →",
      href: "/work/jainav-platform",
    },
    site: {
      live: {
        label: "Visit Jainav Infotech",
        href: "https://jainavinfotech.in",
        requires: "jainavLive",
      },
      pending: {
        text: "jainavinfotech.in · launching soon",
        repo: {
          label: "GitHub",
          href: "https://github.com/nanu1605/jainav-infotech",
        },
      },
    },
    email: "support@jainavinfotech.in",
  });
