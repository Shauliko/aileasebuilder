import type { ReactNode } from "react";

export default function LeasesLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-[#050816] text-white px-4 md:px-6 py-16">
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  );
}
