import { z } from "zod";
import { contact } from "@content/contact";

// The contact form's server-side check (§8.11, §14): the A.12 messages for
// the three fields a visitor can get wrong; anything else is a bad request.

const { validation: v } = contact;

export const ContactInput = z.object({
  name: z.string().trim().min(1, v.name).max(200, v.name),
  email: z.string().trim().max(254, v.email).pipe(z.email(v.email)),
  topic: z.enum(contact.topics as [string, ...string[]]),
  message: z
    .string()
    .trim()
    .min(1, v.message)
    .max(contact.maxMessageLength, v.message),
  token: z.string().min(1).max(2048),
});
export type ContactInput = z.infer<typeof ContactInput>;

export type Field = "name" | "email" | "message";
export type FieldErrors = Partial<Record<Field, string>>;

const fields: Field[] = ["name", "email", "message"];

export function parseContact(
  input: unknown,
):
  | { ok: true; data: ContactInput }
  | { ok: false; errors: FieldErrors; other: boolean } {
  const result = ContactInput.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const errors: FieldErrors = {};
  let other = false;
  for (const issue of result.error.issues) {
    const field = issue.path[0] as Field;
    if (fields.includes(field)) errors[field] ??= issue.message;
    else other = true;
  }
  return { ok: false, errors, other };
}

/** One line, no control characters: safe for a subject or a header. */
export const oneLine = (s: string) =>
  s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

/** The message as plain text: newlines kept, other control characters gone. */
export const plain = (s: string) =>
  s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");

/** The email body (plain text, §8.11). */
export function emailText(m: ContactInput) {
  return [
    `Name: ${oneLine(m.name)}`,
    `Email: ${oneLine(m.email)}`,
    `Topic: ${oneLine(m.topic)}`,
    "",
    plain(m.message),
    "",
  ].join("\n");
}
