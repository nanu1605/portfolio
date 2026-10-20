import { z } from "zod";
import { Certification } from "./schema";

// Certifications (A.14). An entry whose title is still a placeholder is hidden.

export const certifications = z.array(Certification).parse([
  {
    title: "Data Analysis with Python",
    issuer: "freeCodeCamp",
    date: "Feb 2022",
    url: "https://www.freecodecamp.org/certification/fcc1e32c0ee-9f1f-4f99-b106-64821e033462/data-analysis-with-python-v7",
  },
  {
    title: "Python (Basic)",
    issuer: "HackerRank",
    date: "Nov 2021",
    url: "https://www.hackerrank.com/certificates/8e5a5fedaf36",
  },
  {
    title: "Azure Data Fundamentals",
    issuer: "Microsoft",
    date: "Mar 2021",
    url: "https://drive.google.com/file/d/1oyceCQXwli_TH7uhndq3NRF79evNTdoE/view?usp=sharing",
  },
  {
    title: "Data Science and Analytics using Python and R",
    issuer: "Knowledge Solutions India",
    date: "Oct 2020",
    url: "https://drive.google.com/file/d/1NYs-cq0Av3OEk7t8UxFy6KQHd_9C0kM5/view?usp=sharing",
  },
  {
    // Never "Certified Ethical Hacker (CEH)": that's EC-Council's credential (C.3).
    title: "{{UDEMY_COURSE_TITLE}}",
    issuer: "Udemy",
    date: "Jun 2020",
    url: "https://www.udemy.com/certificate/UC-c416d825-adcd-48a6-a078-26e2cd91edd5/",
  },
]);
