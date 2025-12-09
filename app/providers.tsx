"use client";

import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

// Make posthog available globally (browser console + debugging)
if (typeof window !== "undefined") {
  (window as any).posthog = posthog;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "https://us.i.posthog.com",
    capture_pageview: true,    // REQUIRED
    autocapture: true,         // enables click tracking
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
