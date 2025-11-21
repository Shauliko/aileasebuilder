"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  state: string;
  propertyType: string;
  rent: string;
  term: string;
  startDate: string;
  pets: string;
  smoking: string;
  lateFees: string;
  deposit: string;
  extraClauses: string;
  includeMultilingual: boolean;
  languages: string[];
};

const ALL_LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
];

export default function GenerateLeasePage() {
  const router = useRouter();

  // ----------------------------
  // Form State Management
  // ----------------------------
  const [form, setForm] = useState<FormState>({
    state: "",
    propertyType: "",
    rent: "",
    term: "",
    startDate: "",
    pets: "no",
    smoking: "no",
    lateFees: "no",
    deposit: "",
    extraClauses: "",
    includeMultilingual: false,
    languages: [],
  });

  const [loading, setLoading] = useState(false);
  const [hasUsedFreeLease, setHasUsedFreeLease] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------
  // Check if user used free lease
  // ----------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasUsedFreeLease(localStorage.getItem("hasUsedFreeLease") === "true");
  }, []);

  // ----------------------------
  // Handle simple field updates
  // ----------------------------
  const handleChange = (e: any) => {
    const { name, type, value, checked } = e.target;

    if (name === "includeMultilingual") {
      setForm((prev) => ({
        ...prev,
        includeMultilingual: checked,
        languages: checked ? prev.languages : [],
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ----------------------------
  // Toggle language selection
  // ----------------------------
  const toggleLanguage = (code: string) => {
    setForm((prev) => {
      const exists = prev.languages.includes(code);
      return {
        ...prev,
        languages: exists
          ? prev.languages.filter((c) => c !== code)
          : [...prev.languages, code],
      };
    });
  };

  // ----------------------------
  // Submit Handler
  // ----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!form.state || !form.propertyType || !form.rent || !form.term) {
      setError("Please fill out all required fields.");
      return;
    }

    const isMultilingual =
      form.includeMultilingual && form.languages.length > 0;

    try {
      setLoading(true);

      // -------------------------------------------------
      // MULTILINGUAL CASE → ALWAYS GO TO STRIPE
      // -------------------------------------------------
      if (isMultilingual) {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leaseData: form }),
        });

        const data = await res.json();

        if (res.ok && data.url) {
          window.location.href = data.url;
          return;
        }

        setError("Unable to start payment. Please try again.");
        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // ENGLISH-ONLY CASE
      // -------------------------------------------------

      // User already used their free English lease
      if (hasUsedFreeLease) {
        setError("You’ve already used your free English lease.");
        setTimeout(() => router.push("/pricing"), 1300);
        setLoading(false);
        return;
      }

      // Generate free lease
      const genRes = await fetch("/api/generate-lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const genData = await genRes.json();

      // ✅ FIRST: handle errors
      if (!genRes.ok) {
        setError(genData.error || "Lease generation failed.");
        setLoading(false);
        return;
      }

      // ✅ SECOND: save lease for download page (localStorage, correct key)
      if (typeof window !== "undefined") {
        localStorage.setItem("lease-result", JSON.stringify(genData));
        localStorage.setItem("hasUsedFreeLease", "true");
      }

      // ✅ THIRD: redirect AFTER saving
      router.push("/download");
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // RENDER
  // ----------------------------
  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Generate your lease</h1>
        <p className="text-gray-300 mb-6">
          Your first English-only lease is free. Multilingual leases cost $8 and
          include all selected languages.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-[#0b1024] border border-white/10 rounded-2xl p-6 md:p-8"
        >
          {/* BASIC FIELDS */}
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="State *"
              name="state"
              value={form.state}
              onChange={handleChange}
            />
            <InputField
              label="Property Type *"
              name="propertyType"
              value={form.propertyType}
              onChange={handleChange}
            />
          </div>

          {/* RENT + TERM + DATE */}
          <div className="grid md:grid-cols-3 gap-4">
            <InputField
              label="Monthly Rent (USD) *"
              name="rent"
              value={form.rent}
              onChange={handleChange}
            />
            <InputField
              label="Term *"
              name="term"
              value={form.term}
              onChange={handleChange}
            />
            <DateField
              label="Start Date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>

          {/* OPTIONS */}
          <OptionsGroup form={form} handleChange={handleChange} />

          {/* DEPOSIT + EXTRA CLAUSES */}
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Security Deposit (USD)"
              name="deposit"
              value={form.deposit}
              onChange={handleChange}
            />
            <TextareaField
              label="Extra Clauses"
              name="extraClauses"
              value={form.extraClauses}
              onChange={handleChange}
            />
          </div>

          {/* MULTILINGUAL */}
          <MultilingualSelector
            includeMultilingual={form.includeMultilingual}
            languages={form.languages}
            toggleLanguage={toggleLanguage}
            handleChange={handleChange}
          />

          {/* SUBMIT */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 font-semibold text-white text-sm shadow-lg shadow-blue-500/40 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Lease"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------
// Form Subcomponents
// ----------------------------

function InputField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg bg-[#050816] border border-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
    </div>
  );
}

function DateField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg bg-[#050816] border border-white/15 px-3 py-2 text-sm"
      />
    </div>
  );
}

function TextareaField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg bg-[#050816] border border-white/15 px-3 py-2 text-sm h-20"
      />
    </div>
  );
}

function OptionsGroup({ form, handleChange }: any) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[
        { label: "Pets Allowed?", name: "pets" },
        { label: "Smoking Allowed?", name: "smoking" },
        { label: "Late Fees?", name: "lateFees" },
      ].map((opt) => (
        <div key={opt.name}>
          <label className="block text-sm mb-1">{opt.label}</label>
          <select
            name={opt.name}
            value={form[opt.name]}
            onChange={handleChange}
            className="w-full rounded-lg bg-[#050816] border border-white/15 px-3 py-2 text-sm"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function MultilingualSelector({
  includeMultilingual,
  languages,
  handleChange,
  toggleLanguage,
}: any) {
  return (
    <div className="border border-white/10 rounded-xl p-4 bg-[#050816]/60">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="includeMultilingual"
          checked={includeMultilingual}
          onChange={handleChange}
          className="h-4 w-4 rounded border-white/40 bg-transparent"
        />
        <span className="text-sm font-medium">
          Include multilingual versions (requires $8 payment)
        </span>
      </label>

      {includeMultilingual && (
        <div className="mt-3">
          <p className="text-xs text-gray-300 mb-2">
            Select all languages you want. English is always included.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => toggleLanguage(lang.code)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  languages.includes(lang.code)
                    ? "bg-cyan-500 text-black border-cyan-400"
                    : "bg-transparent text-gray-300 border-white/30"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
