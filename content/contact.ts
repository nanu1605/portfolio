import { z } from "zod";

// The Contact page and form copy (A.12). `{email}` in `success` is the
// sender's address, filled in at runtime.

export const contact = z
  .object({
    title: z.string(),
    body: z.string(),
    labels: z.object({
      name: z.string(),
      email: z.string(),
      topic: z.string(),
      message: z.string(),
      send: z.string(),
      copy: z.string(),
    }),
    topics: z.array(z.string()).min(1),
    note: z.string(),
    success: z.string().includes("{email}"),
    error: z.string(),
    validation: z.object({
      name: z.string(),
      email: z.string(),
      message: z.string(),
    }),
    maxMessageLength: z.number().int().positive(),
  })
  .parse({
    title: "Let's talk.",
    body: "Email is the fastest way to reach me. I'm in Indore, India (IST, UTC+5:30).",
    labels: {
      name: "Name",
      email: "Email",
      topic: "What's this about?",
      message: "Message",
      send: "Send",
      copy: "Copy",
    },
    topics: [
      "A role or opportunity",
      "Research or a Master's programme",
      "A project for Jainav Infotech",
      "Something else",
    ],
    note: "Your message is emailed to me and isn't stored on this site.",
    success: "Thanks — your message is on its way. I'll reply to {email}.",
    error:
      "That didn't send. Try again, or email me at tanishqjain010@gmail.com.",
    validation: {
      name: "Please add your name.",
      email: "That email address doesn't look right.",
      message: "Please write a message (up to 4,000 characters).",
    },
    maxMessageLength: 4000,
  });
