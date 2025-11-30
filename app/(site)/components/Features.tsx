import SectionWrapper from "./SectionWrapper";

const features = [
  {
    title: "State-Specific Legal Precision",
    desc: "Every lease is tailored to your state’s laws and requirements.",
  },
  {
    title: "Instant Generation",
    desc: "AI drafts a full lease in seconds—no templates or manual editing.",
  },
  {
    title: "Editable & Downloadable",
    desc: "Download as PDF or DOCX, or edit your lease anytime.",
  },
  {
    title: "Legally Reliable",
    desc: "Built with up-to-date legal structures trusted across the U.S.",
  },
];

export default function Features() {
  return (
    <SectionWrapper className="py-24 px-6 max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
        Why Landlords & Tenants Trust Us
      </h2>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-[#0d1220] p-6 rounded-xl border border-white/10 hover:border-blue-500/40 transition"
          >
            <h3 className="text-xl font-semibold text-blue-400">{f.title}</h3>
            <p className="mt-3 text-gray-300">{f.desc}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
