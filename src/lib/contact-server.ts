import "server-only";

// Where contact messages go (§8.11, §18), decided from the environment:
// - "send": Resend and Turnstile are configured; mail goes out.
// - "outbox": not on Vercel (a laptop, CI) and not configured; messages
//   are written to .outbox/, with Cloudflare's published test keys.
// - "mailto": on Vercel but not configured; the form opens the visitor's
//   email app instead, and the endpoint refuses.

/** Cloudflare's always-pass test keys: public, documented, not secrets. */
const TEST_SITE_KEY = "1x00000000000000000000AA";
const TEST_SECRET = "1x0000000000000000000000000000000AA";

export type ContactMode = "send" | "outbox" | "mailto";

export function contactConfig() {
  const env = process.env;
  const live = Boolean(
    env.RESEND_API_KEY &&
    env.CONTACT_FROM_EMAIL &&
    env.CONTACT_TO_EMAIL &&
    env.TURNSTILE_SECRET_KEY &&
    env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
  const mode: ContactMode = live ? "send" : env.VERCEL ? "mailto" : "outbox";
  return {
    mode,
    siteKey:
      mode === "send"
        ? env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
        : mode === "outbox"
          ? TEST_SITE_KEY
          : undefined,
    secret: mode === "send" ? env.TURNSTILE_SECRET_KEY! : TEST_SECRET,
    resend: {
      key: env.RESEND_API_KEY,
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
    },
  };
}
