export async function trackEvent(
  event: string,
  distinctId: string,
  properties: Record<string, any> = {}
) {
  try {
    const apiKey = process.env.POSTHOG_API_KEY;
    if (!apiKey) return;

    await fetch(`${process.env.POSTHOG_HOST || "https://app.posthog.com"}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        event,
        distinct_id: distinctId,
        properties,
      }),
    });
  } catch (err) {
    console.error("PostHog tracking failed:", err);
  }
}
