"use server";

import { PostHog } from "posthog-node";

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || "";
const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.i.posthog.com";

const client = POSTHOG_API_KEY
  ? new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
    })
  : null;

export async function trackEventServer(
  event: string,
  distinctId: string,
  properties: Record<string, any> = {}
) {
  if (!client) return;

  try {
    client.capture({
      event,
      distinctId,
      properties,
    });

    // Flush with callback (supported by all posthog-node versions)
    client.flush();
  } catch (err) {
    console.error("PostHog server tracking failed:", err);
  }
}
