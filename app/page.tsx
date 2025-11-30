import Hero from "./(site)/components/Hero";
import Features from "./(site)/components/Features";
import CTA from "./(site)/components/CTA";
import BlogPreview from "./(site)/components/BlogPreview";

// ⭐ KEEP YOUR EXISTING SEO, METADATA, JSON-LD, ETC.
// (Paste them here above the component)

export default function HomePage() {
  return (
    <main className="bg-[#050816] text-gray-200 overflow-hidden">
      <Hero />
      <Features />
      <CTA />
      <BlogPreview />
    </main>
  );
}
