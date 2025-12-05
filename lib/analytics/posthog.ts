import { PostHog } from "posthog-node";

const client =
  process.env.NEXT_PUBLIC_POSTHOG_KEY
    ? new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      })
    : null;

export async function trackEvent(
  event: string,
  distinctId: string,
  properties: Record<string, any> = {}
) {
  if (!client) {
    console.warn("PostHog client not initialized (missing KEY)");
    return;
  }

  try {
    client.capture({
      event,
      distinctId,
      properties,
    });

    // Safe flush for your SDK version
    client.flush();

    // Prevent serverless from dropping the event
    await new Promise((resolve) => setTimeout(resolve, 50));

  } catch (err) {
    console.error("PostHog tracking failed:", err);
  }
}
