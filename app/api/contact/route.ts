import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;

// -----------------------------
// SIMPLE IN-MEMORY RATE LIMITER (PER IP)
// -----------------------------
type RateEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 messages per hour per IP
const rateMap = new Map<string, RateEntry>();

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",");
    if (parts.length > 0) return parts[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = rateMap.get(key);

  if (!existing || now > existing.resetAt) {
    rateMap.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: existing.resetAt - now };
  }

  existing.count += 1;
  rateMap.set(key, existing);
  return { allowed: true, retryAfter: 0 };
}

// -----------------------------
// BASIC SPAM FILTER
// -----------------------------
function isSpam(name: string, email: string, message: string): boolean {
  const msg = message.toLowerCase();
  const em = email.toLowerCase();

  if (message.trim().length < 10) return true;

  const urlCount = (message.match(/https?:\/\//gi) || []).length;
  if (urlCount > 3) return true;

  const spamKeywords = [
    "crypto investment",
    "forex",
    "viagra",
    "porn",
    "adult site",
    "seo services",
    "backlinks",
    "guest post",
    "casino",
  ];

  if (spamKeywords.some((w) => msg.includes(w))) return true;

  if (!em.includes("@") || em.endsWith(".ru") || em.endsWith(".cn")) {
    // still allow, just basic heuristic
  }

  return false;
}

// -----------------------------
// POST — Contact form
// -----------------------------
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateKey = `contact:${ip}`;
    const { allowed, retryAfter } = checkRateLimit(rateKey);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Try again later.",
          retryAfterMs: retryAfter,
        },
        { status: 429 }
      );
    }

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
      return NextResponse.json(
        { error: "Email configuration missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (isSpam(name, email, message)) {
      return NextResponse.json(
        { error: "Message flagged as spam" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const subject = `New contact form message from ${name}`;
    const text = `Name: ${name}
Email: ${email}

Message:
${message}`;

    const html = `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `;

    await transporter.sendMail({
      from: `"AI Lease Builder" <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
