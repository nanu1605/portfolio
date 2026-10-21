import { describe, expect, it } from "vitest";
import { contact } from "../../content/contact";
import { emailText, oneLine, parseContact } from "../../src/lib/contact";
import { resumeSections } from "../../src/lib/resume";

const valid = {
  name: "Ada",
  email: "ada@example.com",
  topic: contact.topics[0],
  message: "Hello.",
  token: "t",
};

describe("contact validation (§8.11, §17)", () => {
  it("accepts a valid message, trimmed", () => {
    const r = parseContact({ ...valid, name: "  Ada  " });
    expect(r).toEqual({ ok: true, data: { ...valid, name: "Ada" } });
  });

  it("names each bad field with its A.12 message", () => {
    const r = parseContact({ ...valid, name: " ", email: "ada@", message: "" });
    expect(r).toEqual({
      ok: false,
      other: false,
      errors: {
        name: contact.validation.name,
        email: contact.validation.email,
        message: contact.validation.message,
      },
    });
  });

  it("caps the message at 4,000 characters", () => {
    const at = parseContact({ ...valid, message: "x".repeat(4000) });
    const over = parseContact({ ...valid, message: "x".repeat(4001) });
    expect(at.ok).toBe(true);
    expect(over).toMatchObject({
      ok: false,
      errors: { message: contact.validation.message },
    });
  });

  it("refuses an unknown topic or a missing Turnstile token", () => {
    expect(parseContact({ ...valid, topic: "Spam" })).toMatchObject({
      ok: false,
      other: true,
    });
    expect(parseContact({ ...valid, token: "" })).toMatchObject({
      ok: false,
      other: true,
    });
    expect(parseContact("nope")).toMatchObject({ ok: false, other: true });
  });

  it("keeps the email plain text, with no header injection", () => {
    expect(oneLine("Ada\r\nBcc: x@example.com")).toBe("Ada Bcc: x@example.com");
    const text = emailText({
      ...valid,
      name: "Ada\nLovelace",
      message: "Line one\r\nLine two\u0007",
    });
    expect(text).toBe(
      `Name: Ada Lovelace\nEmail: ada@example.com\nTopic: ${contact.topics[0]}\n\nLine one\nLine two\n`,
    );
  });
});

describe("resume (§8.10)", () => {
  it("follows the §8.10 section order", () => {
    expect(resumeSections.map((s) => s.id)).toEqual([
      "summary",
      "experience",
      "projects",
      "openSource",
      "education",
      "skills",
      "certifications",
    ]);
  });

  it("shows no unfilled placeholder", () => {
    expect(JSON.stringify(resumeSections)).not.toMatch(
      /\{\{|\{[a-z]+\.[A-Za-z0-9]+\}/,
    );
  });
});
