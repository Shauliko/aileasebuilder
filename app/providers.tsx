"use client";

import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init("phc_sKUpmovsUBLuwG7NsDIZd0PvNP9iLGQaaIyhf9npl7g", {
    api_host: "https://us.i.posthog.com",
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
