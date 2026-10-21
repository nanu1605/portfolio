"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/track";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

// The contact form (§8.11, cross-device §5). Native validity on the client
// with the A.12 messages, Zod again on the server. Turnstile renders with
// its explicit API, `flexible`, or `compact` in a container under 300 px,
// and only on this page (§14). Without a server to send through (Vercel
// without keys), Send opens the visitor's email app instead.

type Field = "name" | "email" | "message";
type Copy = {
  labels: {
    name: string;
    email: string;
    topic: string;
    message: string;
    send: string;
  };
  topics: string[];
  note: string;
  success: string;
  error: string;
  validation: Record<Field, string>;
  maxMessageLength: number;
};

type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<Turnstile> | undefined;
const loadTurnstile = () =>
  (loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject();
    script.onerror = () => {
      loading = undefined;
      reject();
    };
    document.head.append(script);
  }));

const control =
  "min-h-12 w-full rounded-md border border-border-strong bg-surface px-4 text-body text-fg transition-ui placeholder:text-fg-subtle aria-invalid:border-hot";

export function ContactForm({
  copy,
  mode,
  siteKey,
  email,
}: {
  copy: Copy;
  mode: "send" | "outbox" | "mailto";
  siteKey?: string;
  email: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<
    | { kind: "idle" | "sending" }
    | { kind: "sent"; to: string }
    | { kind: "error" }
  >({ kind: "idle" });
  const mailto = mode === "mailto" || !siteKey;

  useEffect(() => {
    const el = box.current;
    if (mailto || !el) return;
    let gone = false;
    loadTurnstile()
      .then((t) => {
        if (gone) return;
        widget.current = t.render(el, {
          sitekey: siteKey,
          size: el.clientWidth < 300 ? "compact" : "flexible",
          theme:
            document.documentElement.dataset.theme === "light"
              ? "light"
              : "dark",
          language: "en",
          callback: (value: string) => setToken(value),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => {});
    return () => {
      gone = true;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = undefined;
    };
  }, [mailto, siteKey]);

  const fresh = () => {
    setToken("");
    if (widget.current) window.turnstile?.reset(widget.current);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === "sending") return;
    const el = e.currentTarget;
    const data = new FormData(el);
    const value = (k: string) => String(data.get(k) ?? "");

    // The browser's own checks, in A.12's words; blank-but-spaces counts.
    const found: Partial<Record<Field, string>> = {};
    for (const field of ["name", "email", "message"] as Field[]) {
      const input = el.elements.namedItem(field) as HTMLInputElement;
      if (!input.validity.valid || !input.value.trim())
        found[field] = copy.validation[field];
    }
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      (el.elements.namedItem(first) as HTMLElement).focus();
      return;
    }

    if (mailto) {
      const body = `${value("message")}\n\n— ${value("name")}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(value("topic"))}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          email: value("email"),
          topic: value("topic"),
          message: value("message"),
          website: value("website"),
          token,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: Partial<Record<Field, string>>;
      };
      if (res.ok && json.ok) {
        track("contact_submit", { status: "success" });
        setStatus({ kind: "sent", to: value("email").trim() });
        el.reset();
        fresh();
        return;
      }
      if (json.errors && Object.keys(json.errors).length > 0) {
        setErrors(json.errors);
        setStatus({ kind: "idle" });
        return;
      }
      track("contact_submit", { status: "error" });
      setStatus({ kind: "error" });
      fresh();
    } catch {
      track("contact_submit", { status: "error" });
      setStatus({ kind: "error" });
      fresh();
    }
  };

  const message =
    status.kind === "sent"
      ? copy.success.replace("{email}", status.to)
      : status.kind === "error"
        ? copy.error
        : "";

  const describe = (field: Field) =>
    errors[field]
      ? { "aria-invalid": true, "aria-describedby": `${field}-error` }
      : {};
  const fieldError = (field: Field) =>
    errors[field] && (
      <p id={`${field}-error`} className="text-small text-hot">
        {errors[field]}
      </p>
    );
  const label = "text-small font-semibold text-fg";

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="@container flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={label}>
          {copy.labels.name}
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={200}
          autoComplete="name"
          enterKeyHint="next"
          className={control}
          {...describe("name")}
        />
        {fieldError("name")}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={label}>
          {copy.labels.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="next"
          className={control}
          {...describe("email")}
        />
        {fieldError("email")}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="topic" className={label}>
          {copy.labels.topic}
        </label>
        <select id="topic" name="topic" className={cx(control, "pr-10")}>
          {copy.topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={label}>
          {copy.labels.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={copy.maxMessageLength}
          className={cx(
            control,
            "min-h-[calc(6lh+1.5rem)] resize-y py-3 [field-sizing:content]",
          )}
          {...describe("message")}
        />
        {fieldError("message")}
      </div>
      {/* The honeypot: off-screen and inert, so only bots fill it. */}
      <div
        inert
        aria-hidden="true"
        className="absolute -left-[9999px] size-px overflow-clip"
      >
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {!mailto && (
        <div
          ref={box}
          data-turnstile=""
          className="min-h-[65px] @max-[300px]:min-h-[140px]"
        />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button
          type="submit"
          variant="primary"
          aria-disabled={status.kind === "sending" || undefined}
          className="w-full sm:w-auto"
        >
          {copy.labels.send}
        </Button>
        <p className="text-small text-fg-muted">{copy.note}</p>
      </div>
      <p
        aria-live="polite"
        className={cx(
          "text-body",
          status.kind === "error" ? "text-hot" : "text-fg",
        )}
      >
        {message}
      </p>
    </form>
  );
}
