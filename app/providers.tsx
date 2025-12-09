"use client";

import { useEffect } from "react";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Runs only in browser, AFTER hydration is stable.
    posthog.init("phc_sKUpmovsUBLuwG7NsDIZd0PvNP9iLGQaaIyhf9npl7g", {
      api_host: "https://us.i.posthog.com",
      capture_pageview: true,
      autocapture: true,
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
