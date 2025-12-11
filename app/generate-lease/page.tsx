"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OPTIONAL_CLAUSES } from "@/lib/optionalClauses";
import { useUser } from "@clerk/nextjs";
import Script from "next/script";

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

  // Detailed fields for upgraded lease template
  propertyAddress: string;
  city: string;
  zip: string;
  unitNumber: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  parkingSpaces: string;
  furnished: boolean;

  lateFeeAmount: string;
  lateGraceDays: string;
  nsfFee: string;

  maxOccupants: string;

  petDeposit: string;
  petRent: string;
  maxPets: string;

  earlyTerminationAllowed: boolean;
  earlyTerminationFee: string;

  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  landlordEmail: string;

  maintenanceName: string;
  maintenancePhone: string;
  maintenanceEmail: string;
  emergencyPhone: string;
};

const ALL_LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
];

const TOTAL_STEPS = 4;

export default function GenerateLeasePage() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || null;
  const router = useRouter();

  // ----------------------------
  // Wizard state
  // ----------------------------
  const [step, setStep] = useState(1);

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

    propertyAddress: "",
    city: "",
    zip: "",
    unitNumber: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    parkingSpaces: "",
    furnished: false,

    lateFeeAmount: "",
    lateGraceDays: "5",
    nsfFee: "35",

    maxOccupants: "",

    petDeposit: "",
    petRent: "",
    maxPets: "2",

    earlyTerminationAllowed: false,
    earlyTerminationFee: "",

    landlordName: "",
    landlordAddress: "",
    landlordPhone: "",
    landlordEmail: "",

    maintenanceName: "",
    maintenancePhone: "",
    maintenanceEmail: "",
    emergencyPhone: "",
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
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      languages: prev.languages,
    }));
  };

  // ----------------------------
  // Toggle language selection
  // ----------------------------
  const toggleLanguage = (code: string) => {
    setForm((prev) => {
      const exists = prev.languages.includes(code);
      const updated = exists
        ? prev.languages.filter((c) => c !== code)
        : [...prev.languages, code];

      console.log("UPDATED LANGUAGES:", updated);
      return {
        ...prev,
        languages: updated,
      };
    });
  };

  // ----------------------------
  // Wizard navigation
  // ----------------------------
  const goNext = () => {
    setError(null);
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const goBack = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  // ----------------------------
  // Submit Handler
  // ----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("DEBUG FORM BEFORE SUBMIT:", form);

    // Minimal required validation (same core checks)
    if (!form.state || !form.propertyType || !form.rent || !form.term) {
      setError("Please fill out all required fields marked with *.");
      return;
    }

    const isMultilingual =
      form.includeMultilingual && form.languages.length > 0;

    try {
      setLoading(true);

      // Multilingual → Stripe
      if (isMultilingual) {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leaseData: form,
            email: userEmail,
            planType: "payg",
            languages: form.languages,
          }),
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

      // English-only free lease
      if (hasUsedFreeLease) {
        setError("You’ve already used your free English lease.");
        setTimeout(() => router.push("/pricing"), 1300);
        setLoading(false);
        return;
      }

      const genRes = await fetch("/api/generate-lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userEmail,
        }),
      });

      const genData = await genRes.json();

      if (!genRes.ok) {
        setError(genData.error || "Lease generation failed.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("lease-result", JSON.stringify(genData));
        localStorage.setItem("hasUsedFreeLease", "true");
      }

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
  const stepsMeta = [
    { id: 1, label: "Property" },
    { id: 2, label: "Lease terms" },
    { id: 3, label: "Policies" },
    { id: 4, label: "Contacts & languages" },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
      {/* SEO Structured Data */}
      <Script
        id="generate-lease-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "AI Lease Generator",
            description:
              "Generate a legally-compliant, state-specific residential lease instantly. Your first English lease is free; multilingual versions cost $8.",
            provider: {
              "@type": "Organization",
              name: "AI Lease Builder",
              url: "https://aileasebuilder.com",
            },
            offers: {
              "@type": "Offer",
              price: "0.00",
              priceCurrency: "USD",
              description:
                "First English lease is free. Multilingual leases cost $8.",
            },
          }),
        }}
      />

      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Generate your lease
          </h1>
          <p className="text-gray-300">
            Your first English-only lease is free. Multilingual leases cost $8
            and include all selected languages.
          </p>
        </header>

        {/* Stepper */}
        <WizardStepper currentStep={step} steps={stepsMeta} />

        {error && (
          <div className="mt-4 mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 bg-[#050b1f] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* STEP CONTENT */}
          {step === 1 && (
            <Step1Property form={form} handleChange={handleChange} />
          )}
          {step === 2 && (
            <Step2LeaseTerms form={form} handleChange={handleChange} />
          )}
          {step === 3 && (
            <Step3Policies form={form} handleChange={handleChange} />
          )}
          {step === 4 && (
            <Step4ContactsLanguages
              form={form}
              handleChange={handleChange}
              toggleLanguage={toggleLanguage}
            />
          )}

          {/* FOOTER BUTTONS */}
          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1 || loading}
              className="px-4 py-2 rounded-xl border border-white/20 text-sm text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              {step < TOTAL_STEPS && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold shadow-lg shadow-blue-500/40 disabled:opacity-50"
                >
                  Next
                </button>
              )}

              {step === TOTAL_STEPS && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 text-sm font-semibold shadow-lg shadow-blue-500/40 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Lease"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------
// Wizard stepper
// ----------------------------
function WizardStepper({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { id: number; label: string }[];
}) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {steps.map((s, idx) => {
        const active = s.id === currentStep;
        const completed = s.id < currentStep;

        return (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={[
                  "h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold border",
                  completed
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : active
                    ? "bg-blue-600 text-white border-blue-400"
                    : "bg-transparent text-gray-400 border-white/30",
                ].join(" ")}
              >
                {completed ? "✓" : s.id}
              </div>
              <span className="text-xs md:text-sm text-gray-200">
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={[
                  "hidden md:block h-px flex-1",
                  completed ? "bg-emerald-500" : "bg-white/15",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------
// STEP 1 – PROPERTY
// ----------------------------
function Step1Property({ form, handleChange }: any) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">1. Property details</h2>
        <p className="text-xs text-gray-400">
          Start with the property location and basic details. This information
          anchors the entire lease.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          label="Property Address *"
          name="propertyAddress"
          value={form.propertyAddress}
          onChange={handleChange}
        />
        <InputField
          label="City *"
          name="city"
          value={form.city}
          onChange={handleChange}
        />
        <InputField
          label="ZIP Code *"
          name="zip"
          value={form.zip}
          onChange={handleChange}
        />
        <InputField
          label="Unit / Apartment"
          name="unitNumber"
          value={form.unitNumber}
          onChange={handleChange}
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
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
        <InputField
          label="Bedrooms"
          name="bedrooms"
          value={form.bedrooms}
          onChange={handleChange}
        />
        <InputField
          label="Bathrooms"
          name="bathrooms"
          value={form.bathrooms}
          onChange={handleChange}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <InputField
          label="Square Feet"
          name="squareFeet"
          value={form.squareFeet}
          onChange={handleChange}
        />
        <InputField
          label="Parking Spaces"
          name="parkingSpaces"
          value={form.parkingSpaces}
          onChange={handleChange}
        />
        <label className="flex items-center gap-2 text-sm mt-6">
          <input
            type="checkbox"
            name="furnished"
            checked={form.furnished}
            onChange={handleChange}
            className="h-4 w-4 rounded border-white/40 bg-transparent"
          />
          <span>Property is furnished</span>
        </label>
      </div>
    </section>
  );
}

// ----------------------------
// STEP 2 – LEASE TERMS & MONEY
// ----------------------------
function Step2LeaseTerms({ form, handleChange }: any) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">2. Lease terms & money</h2>
        <p className="text-xs text-gray-400">
          Set the core financial terms and timing. These flow directly into rent
          and default sections of the lease.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <InputField
          label="Monthly Rent (USD) *"
          name="rent"
          value={form.rent}
          onChange={handleChange}
        />
        <InputField
          label="Term (months) *"
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

      <div className="grid md:grid-cols-3 gap-4">
        <InputField
          label="Security Deposit (USD)"
          name="deposit"
          value={form.deposit}
          onChange={handleChange}
        />
        <InputField
          label="Late Fee Amount (USD)"
          name="lateFeeAmount"
          value={form.lateFeeAmount}
          onChange={handleChange}
        />
        <InputField
          label="Grace Period (days)"
          name="lateGraceDays"
          value={form.lateGraceDays}
          onChange={handleChange}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <InputField
          label="Returned Payment / NSF Fee (USD)"
          name="nsfFee"
          value={form.nsfFee}
          onChange={handleChange}
        />
        <InputField
          label="Maximum Occupants"
          name="maxOccupants"
          value={form.maxOccupants}
          onChange={handleChange}
        />
        <InputField
          label="Extra Clauses (short notes)"
          name="extraClauses"
          value={form.extraClauses}
          onChange={handleChange}
        />
      </div>

      <div className="border border-white/15 rounded-xl p-4 bg-[#050816]/60 space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="earlyTerminationAllowed"
            checked={form.earlyTerminationAllowed}
            onChange={handleChange}
            className="h-4 w-4 rounded border-white/40 bg-transparent"
          />
          <span>Allow early termination with a fee</span>
        </label>

        {form.earlyTerminationAllowed && (
          <InputField
            label="Early Termination Fee (USD or description)"
            name="earlyTerminationFee"
            value={form.earlyTerminationFee}
            onChange={handleChange}
          />
        )}
      </div>
    </section>
  );
}

// ----------------------------
// STEP 3 – POLICIES
// ----------------------------
function Step3Policies({ form, handleChange }: any) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">3. Policies</h2>
        <p className="text-xs text-gray-400">
          Choose how strict you want to be with pets, smoking, and occupancy.
          These sections map directly into the lease rules.
        </p>
      </div>

      <OptionsGroup form={form} handleChange={handleChange} />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm mb-1">
            Pet fee details (used if pets are allowed)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <InputField
              label="Pet Deposit"
              name="petDeposit"
              value={form.petDeposit}
              onChange={handleChange}
            />
            <InputField
              label="Monthly Pet Rent"
              name="petRent"
              value={form.petRent}
              onChange={handleChange}
            />
            <InputField
              label="Max Pets"
              name="maxPets"
              value={form.maxPets}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------
// STEP 4 – CONTACTS & LANGUAGES
// ----------------------------
function Step4ContactsLanguages({
  form,
  handleChange,
  toggleLanguage,
}: any) {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          4. Contacts & languages
        </h2>
        <p className="text-xs text-gray-400">
          Add landlord and maintenance contacts, then choose whether you want
          multilingual versions.
        </p>
      </div>

      <div className="space-y-4 border border-white/10 rounded-xl p-4 bg-[#050816]/60">
        <h3 className="text-sm font-semibold mb-1">Landlord / owner</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Landlord / Owner Name"
            name="landlordName"
            value={form.landlordName}
            onChange={handleChange}
          />
          <InputField
            label="Landlord Email"
            name="landlordEmail"
            value={form.landlordEmail}
            onChange={handleChange}
          />
          <InputField
            label="Landlord Phone"
            name="landlordPhone"
            value={form.landlordPhone}
            onChange={handleChange}
          />
          <InputField
            label="Landlord Mailing Address"
            name="landlordAddress"
            value={form.landlordAddress}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-4 border border-white/10 rounded-xl p-4 bg-[#050816]/60">
        <h3 className="text-sm font-semibold mb-1">Maintenance & emergency</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Maintenance Contact Name (optional)"
            name="maintenanceName"
            value={form.maintenanceName}
            onChange={handleChange}
          />
          <InputField
            label="Maintenance Phone"
            name="maintenancePhone"
            value={form.maintenancePhone}
            onChange={handleChange}
          />
          <InputField
            label="Maintenance Email"
            name="maintenanceEmail"
            value={form.maintenanceEmail}
            onChange={handleChange}
          />
          <InputField
            label="24/7 Emergency Phone"
            name="emergencyPhone"
            value={form.emergencyPhone}
            onChange={handleChange}
          />
        </div>
      </div>

      <MultilingualSelector
        includeMultilingual={form.includeMultilingual}
        languages={form.languages}
        handleChange={handleChange}
        toggleLanguage={toggleLanguage}
      />

      <div className="text-xs text-gray-400 border border-white/10 rounded-xl p-4 bg-[#050816]/40">
        <p className="mb-1">
          When you click <span className="font-semibold">Generate Lease</span>,
          we send these answers to our AI lease engine, generate a full
          state-compliant lease, and prepare downloadable PDF and DOCX files.
        </p>
      </div>
    </section>
  );
}

// ----------------------------
// Form Subcomponents
// ----------------------------

function InputField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-gray-200">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg bg-[#050816] border border-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-xs"
      />
    </div>
  );
}

function DateField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-gray-200">
        {label}
      </label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg bg-[#050816] border border-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
    </div>
  );
}

function OptionsGroup({ form, handleChange }: any) {
  const options = [
    { label: "Pets Allowed?", name: "pets" },
    { label: "Smoking Allowed?", name: "smoking" },
    { label: "Late Fees?", name: "lateFees" },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {options.map((opt) => (
        <div key={opt.name}>
          <label className="block text-xs font-medium mb-1 text-gray-200">
            {opt.label}
          </label>
          <select
            name={opt.name}
            value={form[opt.name]}
            onChange={handleChange}
            className="w-full rounded-lg bg-[#050816] border border-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
    <div className="border border-white/10 rounded-xl p-4 bg-[#050816]/60 space-y-3">
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
        <div className="space-y-2">
          <p className="text-xs text-gray-300">
            Select all languages you want. English is always included.
          </p>

          <div className="flex flex-wrap gap-2">
            {ALL_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => toggleLanguage(lang.code)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  languages.includes(lang.code)
                    ? "bg-cyan-500 text-black border-cyan-400"
                    : "bg-transparent text-gray-300 border-white/30 hover:bg-white/10"
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
