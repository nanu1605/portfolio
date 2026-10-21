import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { contact } from "@content/contact";
import { emailText, oneLine, parseContact } from "@/lib/contact";
import { contactConfig } from "@/lib/contact-server";

// POST /api/contact (§8.11, §14): size limit, honeypot, Zod, rate limit,
// Turnstile, then Resend (or the dev outbox). Nothing is stored here.

/** A 4,000-character message, as JSON, is well under this. */
const MAX_BYTES = 32_000;
const WINDOW_MS = 10 * 60_000;
const LIMIT = 5;

// ponytail: in-memory, so the limit is per server instance (Vercel may run
// several); move to a shared store if abuse ever gets past Turnstile.
const sent = new Map<string, number[]>();

function allow(ip: string, now = Date.now()) {
  const recent = (sent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    sent.set(ip, recent);
    return false;
  }
  sent.set(ip, [...recent, now]);
  if (sent.size > 5000) sent.clear(); // a flood of addresses: start over
  return true;
}

// Vercel sets x-forwarded-for itself, so a client can't spoof it there.
const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "local";

const reply = (body: object, status = 200) => Response.json(body, { status });

async function human(token: string, secret: string, ip: string) {
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: token, remoteip: ip }),
        signal: AbortSignal.timeout(8000),
      },
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES)
    return reply({ error: "too-large" }, 413);
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return reply({ error: "too-large" }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply({ error: "invalid" }, 400);
  }

  // The honeypot: a bot filled the hidden field. Say yes, send nothing.
  if (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    body.website
  )
    return reply({ ok: true });

  const parsed = parseContact(body);
  if (!parsed.ok)
    return reply(
      parsed.other ? { error: "invalid" } : { errors: parsed.errors },
      400,
    );

  const config = contactConfig();
  if (config.mode === "mailto") return reply({ error: "unavailable" }, 503);

  const ip = clientIp(req);
  if (!allow(ip)) return reply({ error: "rate-limited" }, 429);
  if (!(await human(parsed.data.token, config.secret, ip)))
    return reply({ error: "turnstile" }, 403);

  const m = parsed.data;
  const subject = oneLine(`Website: ${m.topic} — ${m.name}`).slice(0, 200);
  const text = emailText(m);

  if (config.mode === "outbox") {
    const dir = path.join(process.cwd(), ".outbox");
    await mkdir(dir, { recursive: true });
    const file = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomUUID().slice(0, 8)}.txt`;
    await writeFile(
      path.join(dir, file),
      `To: ${config.resend.to ?? "(CONTACT_TO_EMAIL)"}\nReply-To: ${oneLine(m.email)}\nSubject: ${subject}\n\n${text}`,
    );
    return reply({ ok: true });
  }

  const { key, from, to } = config.resend;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: oneLine(m.email),
        subject,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}`);
  } catch (error) {
    console.error("contact: send failed", error);
    return reply({ error: "send" }, 502);
  }
  return reply({ ok: true });
}

// Keeps the A.12 copy and this endpoint's limit in step.
if (contact.maxMessageLength * 4 > MAX_BYTES)
  throw new Error("MAX_BYTES is too small for the longest message");
