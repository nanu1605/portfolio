import { z } from "zod";
import { Experience } from "./schema";

// Full entries for About and the resume (A.5). Home shows role, org and period.

export const experience = z.array(Experience).parse([
  {
    id: "jainav",
    role: "Founder",
    org: "Jainav Infotech Private Limited",
    orgFull: "Jainav Infotech Private Limited, Indore",
    period: "{{FOUNDED}} – present",
    bullets: [
      "Founded a product company to build and sell my own software — MenuMesh, VYRO and Baby — and to build custom software for businesses.",
      "Specified and shipped the company's platform: product pages, Razorpay checkout, GST invoicing and a licensing API, in English and Hindi.",
    ],
    link: "/company",
  },
  {
    id: "mycounselhub",
    role: "Freelance Full-Stack Developer",
    org: "MyCounselHub",
    orgFull: "MyCounselHub (remote)",
    period: "Jun 2025 – Apr 2026",
    bullets: [
      "Sole engineer on a WordPress counselling platform with the Amelia booking system, across three services (mental health, dietetics and Ayurveda). Owned everything from requirements to SEO and handover.",
      "Wrote custom scripts that turn a successful payment into a Google Meet link, calendar events for the client and the counsellor, an invoice, and a reminder 30 minutes before the session.",
      "Integrated Razorpay, built a discount-coupon system, a free self-assessment tool and a counsellor onboarding flow, and designed the MySQL database for clients, counsellors and leads.",
    ],
    link: "/work/mycounselhub",
  },
  {
    id: "bosch",
    role: "Associate Software Engineer",
    org: "Bosch Global Software Technologies",
    orgFull: "Bosch Global Software Technologies, Bangalore",
    period: "Jul 2023 – Jan 2025",
    bullets: [
      "Architected and maintained CI/CD pipelines for testing, building and deployment, cutting deployment time by 60% and raising availability by 20%.",
      "Led the move to Docker and Kubernetes autoscaling, raising scalability by 30%, cutting manual intervention by 60%, and saving about 20 hours of operations work a week.",
      "Built a custom Jenkins plugin and Python and Shell automation, cutting build times by 40% and saving about 20 hours a week.",
      // The docs-as-code track: confirmed by Tanishq on 20 Oct 2026, with no numbers.
      "Built a docs-as-code workflow (DocHub, Sphinx with Graphviz and PlantUML diagrams) with CI/CD publishing kept in sync with releases.",
    ],
  },
  {
    id: "gsoc",
    role: "Google Summer of Code Contributor",
    org: "PEcAn Project",
    orgFull: "PEcAn Project (open source)",
    period: "Jun – Sep 2022",
    bullets: [
      'Selected for Google Summer of Code 2022 to work on "PEcAn in CRAN". I merged 15 pull requests that refactored PEcAn\'s R packages toward CRAN compliance: replacing an orphaned dependency, clearing R CMD check warnings, and breaking circular dependencies between packages.',
    ],
    link: "/open-source",
  },
]);
