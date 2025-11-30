import SectionWrapper from "./SectionWrapper";
import Link from "next/link";

export default function CTA() {
  return (
    <SectionWrapper className="py-24 px-6 max-w-3xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white">
        Ready to Generate Your Lease?
      </h2>
      <p className="mt-4 text-gray-300">
        Create a professional, legally coded lease in under 60 seconds.
      </p>

      <Link
        href="/generate-lease"
        className="mt-8 inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-lg font-medium"
      >
        Start Now
      </Link>
    </SectionWrapper>
  );
}
