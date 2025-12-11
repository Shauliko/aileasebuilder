"use client";

import { useState } from "react";

/* ------------------------------------------------------
   TYPES (fixes ALL TypeScript errors)
------------------------------------------------------ */

type AdminLeaseForm = {
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

/* ------------------------------------------------------
   CONSTANTS
------------------------------------------------------ */

const ALL_LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
];

const TOTAL_STEPS = 4;

/* ------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------ */

export default function AdminGenerateLeasePage() {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  /* ------------------------------------------------------
     TYPED FORM STATE (critical)
  ------------------------------------------------------ */
  const [form, setForm] = useState<AdminLeaseForm>({
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

  /* ------------------------------------------------------
     INPUT HANDLERS
  ------------------------------------------------------ */

  function handleChange(e: any) {
  const { name, value, type, checked } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
}

  function toggleLanguage(code: string) {
    setForm((prev) => {
      const exists = prev.languages.includes(code);
      const updated = exists
        ? prev.languages.filter((l) => l !== code)
        : [...prev.languages, code];

      return { ...prev, languages: updated };
    });
  }

  const goNext = () => setStep((s) => (s < TOTAL_STEPS ? s + 1 : s));
  const goBack = () => setStep((s) => (s > 1 ? s - 1 : s));

  /* ------------------------------------------------------
     ADMIN GENERATE (NO LIMITS)
  ------------------------------------------------------ */

  async function submitAdminLease() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/generate-lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Lease generation failed.");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  /* ------------------------------------------------------
     RENDER
  ------------------------------------------------------ */

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">Admin — Generate Lease</h1>
      <p className="text-gray-400 mb-6">
        Unlimited admin lease generator. No limits.
      </p>

      {error && (
        <div className="p-3 mb-4 bg-red-500/20 border border-red-600 text-red-300 text-sm rounded">
          {error}
        </div>
      )}

      <WizardSteps current={step} />

      <div className="bg-[#0a0f1e] border border-white/10 p-6 rounded-xl mt-6 space-y-6">
        {step === 1 && <Step1Property form={form} handleChange={handleChange} />}
        {step === 2 && <Step2LeaseTerms form={form} handleChange={handleChange} />}
        {step === 3 && <Step3Policies form={form} handleChange={handleChange} />}
        {step === 4 && (
          <Step4ContactsLanguages
            form={form}
            handleChange={handleChange}
            toggleLanguage={toggleLanguage}
          />
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={goBack}
          disabled={step === 1 || loading}
          className="px-4 py-2 rounded bg-white/10 text-gray-300 hover:bg-white/20"
        >
          Back
        </button>

        {step < TOTAL_STEPS ? (
          <button
            onClick={goNext}
            disabled={loading}
            className="px-6 py-2 rounded bg-blue-600 font-semibold hover:bg-blue-500"
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitAdminLease}
            disabled={loading}
            className="px-6 py-2 rounded bg-green-600 font-semibold hover:bg-green-500"
          >
            {loading ? "Generating..." : "Generate Lease (Admin)"}
          </button>
        )}
      </div>

      {result && (
        <div className="mt-10 p-4 bg-black/20 border border-white/10 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Lease Generated</h2>

          <a
            href={`data:application/pdf;base64,${result.pdf_base64}`}
            download="admin-lease.pdf"
            className="text-cyan-400 underline text-sm"
          >
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------
   WIZARD & STEP COMPONENTS
------------------------------------------------------ */

function WizardSteps({ current }: { current: number }) {
  const labels = ["Property", "Terms", "Policies", "Contacts"];
  return (
    <div className="flex gap-3">
      {labels.map((label, i) => {
        const step = i + 1;
        const active = current === step;
        const done = current > step;

        return (
          <div
            key={label}
            className={`flex-1 py-2 text-center rounded-lg text-sm ${
              active
                ? "bg-blue-600"
                : done
                ? "bg-green-600"
                : "bg-white/10 text-gray-400"
            }`}
          >
            {step}. {label}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------
   STEP 1
------------------------------------------------------ */

function Step1Property({
  form,
  handleChange,
}: {
  form: AdminLeaseForm;
  handleChange: any;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">1. Property Details</h2>

      <Input label="Property Address" name="propertyAddress" form={form} onChange={handleChange} />
      <Input label="City" name="city" form={form} onChange={handleChange} />
      <Input label="ZIP" name="zip" form={form} onChange={handleChange} />
      <Input label="Bedrooms" name="bedrooms" form={form} onChange={handleChange} />
      <Input label="Bathrooms" name="bathrooms" form={form} onChange={handleChange} />
      <Input label="Square Feet" name="squareFeet" form={form} onChange={handleChange} />
      <Input label="Parking Spaces" name="parkingSpaces" form={form} onChange={handleChange} />
    </div>
  );
}

/* ------------------------------------------------------
   STEP 2
------------------------------------------------------ */

function Step2LeaseTerms({
  form,
  handleChange,
}: {
  form: AdminLeaseForm;
  handleChange: any;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">2. Lease Terms</h2>

      <Input label="State" name="state" form={form} onChange={handleChange} />
      <Input label="Rent (USD)" name="rent" form={form} onChange={handleChange} />
      <Input label="Term (months)" name="term" form={form} onChange={handleChange} />
      <Input label="Start Date" name="startDate" type="date" form={form} onChange={handleChange} />

      <Input label="Security Deposit" name="deposit" form={form} onChange={handleChange} />
      <Input label="Grace Period" name="lateGraceDays" form={form} onChange={handleChange} />
      <Input label="Late Fee Amount" name="lateFeeAmount" form={form} onChange={handleChange} />
      <Input label="NSF Fee" name="nsfFee" form={form} onChange={handleChange} />

      <Input label="Max Occupants" name="maxOccupants" form={form} onChange={handleChange} />
      <Input label="Extra Clauses" name="extraClauses" form={form} onChange={handleChange} />
    </div>
  );
}

/* ------------------------------------------------------
   STEP 3
------------------------------------------------------ */

function Step3Policies({
  form,
  handleChange,
}: {
  form: AdminLeaseForm;
  handleChange: any;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">3. Policies</h2>

      <Select label="Pets Allowed?" name="pets" form={form} onChange={handleChange} options={["no", "yes"]} />

      {form.pets === "yes" && (
        <>
          <Input label="Pet Deposit" name="petDeposit" form={form} onChange={handleChange} />
          <Input label="Pet Rent" name="petRent" form={form} onChange={handleChange} />
          <Input label="Max Pets" name="maxPets" form={form} onChange={handleChange} />
        </>
      )}

      <Select label="Smoking Allowed?" name="smoking" form={form} onChange={handleChange} options={["no", "yes"]} />
      <Select label="Late Fees?" name="lateFees" form={form} onChange={handleChange} options={["no", "yes"]} />
    </div>
  );
}

/* ------------------------------------------------------
   STEP 4
------------------------------------------------------ */

function Step4ContactsLanguages({
  form,
  handleChange,
  toggleLanguage,
}: {
  form: AdminLeaseForm;
  handleChange: any;
  toggleLanguage: (code: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">4. Contacts & Languages</h2>

      <Input label="Landlord Name" name="landlordName" form={form} onChange={handleChange} />
      <Input label="Landlord Phone" name="landlordPhone" form={form} onChange={handleChange} />
      <Input label="Landlord Email" name="landlordEmail" form={form} onChange={handleChange} />
      <Input label="Landlord Address" name="landlordAddress" form={form} onChange={handleChange} />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="includeMultilingual"
          checked={form.includeMultilingual}
          onChange={handleChange}
          className="h-4 w-4"
        />
        Include multilingual versions
      </label>

      {form.includeMultilingual && (
        <div className="flex flex-wrap gap-2">
          {ALL_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => toggleLanguage(lang.code)}
              className={`px-3 py-1 rounded text-xs border ${
                form.languages.includes(lang.code)
                  ? "bg-cyan-500 text-black border-cyan-400"
                  : "bg-transparent text-gray-400 border-white/30"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------
   INPUT COMPONENTS
------------------------------------------------------ */

function Input({
  label,
  name,
  type = "text",
  form,
  onChange,
}: {
  label: string;
  name: keyof AdminLeaseForm;
  type?: string;
  form: AdminLeaseForm;
  onChange: any;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name] as any}
        onChange={onChange}
        className="w-full bg-black/20 border border-white/20 rounded px-3 py-2 text-sm"
      />
    </div>
  );
}

function Select({
  label,
  name,
  form,
  onChange,
  options,
}: {
  label: string;
  name: keyof AdminLeaseForm;
  form: AdminLeaseForm;
  onChange: any;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <select
        name={name}
        value={form[name] as any}
        onChange={onChange}
        className="w-full bg-black/20 border border-white/20 rounded px-3 py-2 text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
