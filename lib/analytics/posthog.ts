"use client";

import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

// Init only in the browser
if (typeof window !== "undefined" && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
  });
}

export function trackEventClient(
  event: string,
  properties: Record<string, any> = {}
) {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return;

  try {
    posthog.capture(event, properties);
  } catch (err) {
    console.error("PostHog client tracking failed:", err);
  }
}
