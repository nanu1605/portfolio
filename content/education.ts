import { z } from "zod";

// Education (A.14). Home shows the short school name and years (A.2).

export const education = z
  .object({
    degree: z.string(),
    school: z.string(),
    schoolFull: z.string(),
    period: z.string(),
    years: z.string(),
    grade: z.string(),
    coursework: z.array(z.string()).min(1),
  })
  .parse({
    degree: "B.E., Computer Science and Engineering",
    school: "Bangalore Institute of Technology",
    schoolFull:
      "Bangalore Institute of Technology (Visvesvaraya Technological University), Bangalore",
    period: "Aug 2019 – Jun 2023",
    years: "2019 – 2023",
    grade: "CGPA 7.77/10, First Class with Distinction",
    coursework: [
      "Artificial Intelligence and Machine Learning",
      "Data Mining and Data Warehousing",
      "Application Development using Python",
      "Design and Analysis of Algorithms",
      "Data Structures and Applications",
      "Probability and Statistical Methods",
      "Database Management Systems",
    ],
  });
