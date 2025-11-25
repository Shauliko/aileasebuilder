"use client";

import { useState, useEffect } from "react";
import { OPTIONAL_CLAUSES } from "@/lib/optionalClauses";

/* -------- Default legal text (used if empty) -------- */

const DEFAULT_TERMS = `
<h2>1. Overview</h2>
<p>AI Lease Builder ("we", "us", "our") provides tools that help users draft, format, and export residential lease agreements and related documents. By using this service, you agree to these Terms of Service.</p>

<h2>2. Not Legal Advice</h2>
<p>The service and all generated content are provided for informational and drafting assistance purposes only and do not constitute legal advice. We are not a law firm and do not provide attorney-client representation. You are responsible for reviewing all documents with a qualified attorney licensed in the relevant jurisdiction before using them.</p>

<h2>3. User Responsibility</h2>
<p>You are solely responsible for:
<ul>
  <li>Providing accurate and complete information about the property, parties, and transaction.</li>
  <li>Ensuring that the generated lease complies with all applicable federal, state, and local laws.</li>
  <li>Complying with any licensing or disclosure requirements in your jurisdiction.</li>
</ul>
</p>

<h2>4. No Guarantee of Compliance</h2>
<p>We use rules, templates, and AI models trained on general patterns, but we do not guarantee that any lease or clause is compliant, enforceable, or optimal for your specific situation or jurisdiction.</p>

<h2>5. License to Use the Service</h2>
<p>We grant you a limited, non-exclusive, non-transferable license to use the platform to generate lease documents for your personal or business use, subject to these Terms.</p>

<h2>6. Prohibited Use</h2>
<p>You may not:
<ul>
  <li>Use the service for illegal purposes.</li>
  <li>Reverse engineer, resell, or sublicense the service without permission.</li>
  <li>Use the service to generate fraudulent, deceptive, or abusive documents.</li>
</ul>
</p>

<h2>7. Payment & Plans</h2>
<p>Paid plans, free tiers, and usage limits are described on the pricing page. We may modify pricing or limits with reasonable notice posted on the site or platform.</p>

<h2>8. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, we are not liable for any indirect, incidental, consequential, special, or punitive damages, or for any loss of profits, revenue, data, or use arising from or related to your use of the service or generated documents.</p>

<h2>9. Indemnification</h2>
<p>You agree to indemnify and hold us harmless from any claim, demand, or loss arising out of your use of the service or your use of any generated document.</p>

<h2>10. Changes to These Terms</h2>
<p>We may update these Terms from time to time. Continued use of the service after changes become effective constitutes acceptance of the new Terms.</p>

<h2>11. Governing Law</h2>
<p>These Terms are governed by the laws of the jurisdiction stated in our policies (or that of our primary business location), without regard to conflict-of-law principles.</p>
`;

const DEFAULT_PRIVACY = `
<h2>1. Information We Collect</h2>
<p>We may collect:
<ul>
  <li>Account information (name, email, contact details).</li>
  <li>Usage data (pages visited, actions taken, logs).</li>
  <li>Lease input data (property details, party names, terms you enter).</li>
</ul>
</p>

<h2>2. How We Use Your Information</h2>
<p>We use your information to:
<ul>
  <li>Operate and improve the service.</li>
  <li>Generate lease and related documents.</li>
  <li>Communicate with you about updates, billing, and support.</li>
  <li>Maintain security, prevent abuse, and comply with legal obligations.</li>
</ul>
</p>

<h2>3. Data Storage & Security</h2>
<p>We use third-party hosting and infrastructure providers. We implement reasonable technical and organizational measures to protect data, but no system is 100% secure.</p>

<h2>4. Third-Party Services</h2>
<p>We may use analytics providers, payment processors (e.g., Stripe), and AI model providers to deliver the service. These third parties may process limited personal data subject to their own privacy policies.</p>

<h2>5. Data Retention</h2>
<p>We retain data for as long as necessary to provide the service, comply with legal obligations, or resolve disputes. You may contact us to request deletion of certain data, subject to legal and operational limits.</p>

<h2>6. Your Rights</h2>
<p>Depending on your location, you may have rights to access, correct, or delete your personal data, and to object to or restrict certain processing. Contact us to exercise these rights.</p>

<h2>7. Cookies & Tracking</h2>
<p>We may use cookies and similar technologies to remember your preferences, maintain sessions, and analyze traffic.</p>

<h2>8. International Transfers</h2>
<p>Your data may be stored or processed in countries other than your own. We take steps to protect your information consistent with applicable law.</p>

<h2>9. Contact</h2>
<p>If you have questions about this Privacy Policy, contact us using the details provided on the site.</p>
`;

const DEFAULT_DISCLAIMER = `
<h2>Not Legal Advice</h2>
<p>AI Lease Builder is not a law firm and does not provide legal advice, representation, or services. All content, including any generated lease, addendum, clause, or explanation, is provided for informational and drafting assistance purposes only.</p>

<h2>No Attorney-Client Relationship</h2>
<p>Your use of this platform does not create an attorney-client relationship. You should consult a qualified attorney licensed in your jurisdiction before relying on any document generated by this service.</p>

<h2>No Guarantee of Accuracy or Compliance</h2>
<p>We do not guarantee that any lease or clause generated by the service is accurate, complete, enforceable, or compliant with federal, state, or local law. Laws change frequently and can vary by jurisdiction.</p>

<h2>User Responsibility</h2>
<p>You are solely responsible for reviewing, editing, and approving all documents before use, and for obtaining independent legal advice as needed.</p>
`;

const DEFAULT_LIMITED_LIABILITY = `
<p>To the maximum extent permitted by law, AI Lease Builder, its owners, employees, and affiliates shall not be liable for any indirect, incidental, consequential, special, or punitive damages, or for any loss of profits, revenue, data, or use arising out of or related to your use of the service or any documents generated by it, even if advised of the possibility of such damages.</p>
<p>Your exclusive remedy for any claim related to the service shall be limited to the amount paid by you (if any) for the 3 months preceding the event giving rise to the claim.</p>
`;

/* -------------------- Types -------------------- */

type AppSettings = {
  appConfig?: {
    appName?: string;
  };
  freeTier: { limit: number };
  multilingual: { enabled: boolean };
  privilegedUsers: { emails: string[] };

  compliance?: {
    defaultState?: string;
    safeMode?: boolean;
  };
  legal?: {
    termsUrl?: string; // used as HTML content
    privacyUrl?: string; // used as HTML content
    legalDisclaimer?: string;
    limitedLiabilityText?: string;
  };

  usage?: {
    stripeEnabled?: boolean;
    stripeCustomerPortalUrl?: string;
    myDocumentsEnabled?: boolean;
  };

  pdfOptions?: {
    attorneyGradeLayout?: boolean;
    multipageFormatting?: boolean;
    signatureBlocks?: boolean;
    editableFields?: boolean;
  };

  optionalClauses?: string[];
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [privEmailInput, setPrivEmailInput] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();

    const s: AppSettings = {
      appConfig: data.appConfig || {},
      freeTier: data.freeTier || { limit: 3 },
      multilingual: data.multilingual || { enabled: false },
      privilegedUsers: data.privilegedUsers || { emails: [] },

      compliance: data.compliance || {
        defaultState: "CA",
        safeMode: true,
      },
      legal: {
        termsUrl: data.legal?.termsUrl || DEFAULT_TERMS,
        privacyUrl: data.legal?.privacyUrl || DEFAULT_PRIVACY,
        legalDisclaimer: data.legal?.legalDisclaimer || DEFAULT_DISCLAIMER,
        limitedLiabilityText:
          data.legal?.limitedLiabilityText || DEFAULT_LIMITED_LIABILITY,
      },
      usage: data.usage || {
        stripeEnabled: false,
        stripeCustomerPortalUrl: "",
        myDocumentsEnabled: true,
      },
      pdfOptions: data.pdfOptions || {
        attorneyGradeLayout: true,
        multipageFormatting: true,
        signatureBlocks: true,
        editableFields: true,
      },
      optionalClauses: data.optionalClauses || [],
    };

    setSettings(s);
    setLoading(false);
  }

  async function save() {
    if (!settings) return;
    setSaving(true);

    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    alert("Saved");
  }

  if (loading || !settings) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-sm text-gray-300">
        Loading settings…
      </div>
    );
  }

  const toggleOptional = (clause: string) => {
    const list = settings.optionalClauses || [];
    const exists = list.includes(clause);
    const updated = exists ? list.filter((c) => c !== clause) : [...list, clause];
    setSettings({ ...settings, optionalClauses: updated });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Admin Settings</h1>
          <p className="text-sm text-gray-400 mt-1">
            Control free tier limits, legal text, compliance behavior, and product upgrades.
          </p>
        </div>
        <button
          onClick={save}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      {/* Grid layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* FREE TIER */}
        <section className="p-4 rounded-xl bg-[#0d1224] border border-white/10 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Free Tier</h2>
            <p className="text-xs text-gray-400">
              How many leases a free user can generate before being blocked.
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">
              Free lease limit per user
            </label>
            <input
              type="number"
              className="w-24 rounded-md bg-[#050816] border border-white/20 text-gray-100 px-2 py-1 text-sm"
              value={settings.freeTier.limit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  freeTier: { limit: Number(e.target.value) || 0 },
                })
              }
            />
          </div>
        </section>

        {/* MULTILINGUAL */}
        <section className="p-4 rounded-xl bg-[#0d1224] border border-white/10 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Multilingual</h2>
            <p className="text-xs text-gray-400">
              Control whether free users can generate non-English leases.
            </p>
          </div>
          <label className="flex items-center justify-between mt-1 text-sm">
            <span className="text-gray-200">
              Enable translations for free users
            </span>
            <input
              type="checkbox"
              checked={settings.multilingual.enabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  multilingual: { enabled: e.target.checked },
                })
              }
            />
          </label>
        </section>

        {/* PRIVILEGED USERS */}
        <section className="md:col-span-2 p-4 rounded-xl bg-[#0d1224] border border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Privileged Users
              </h2>
              <p className="text-xs text-gray-400">
                Emails here bypass free-tier limits and multilingual restrictions.
              </p>
            </div>
          </div>

          <ul className="mt-2 text-xs text-gray-300 space-y-1">
            {settings.privilegedUsers.emails.map((email, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span>{email}</span>
                {/* simple inline remove */}
                <button
                  type="button"
                  className="text-[11px] text-red-400 hover:text-red-300"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      privilegedUsers: {
                        emails: settings.privilegedUsers.emails.filter(
                          (e) => e !== email
                        ),
                      },
                    })
                  }
                >
                  remove
                </button>
              </li>
            ))}
            {settings.privilegedUsers.emails.length === 0 && (
              <li className="text-gray-500 text-xs">No privileged users yet.</li>
            )}
          </ul>

          <div className="flex mt-3 gap-2">
            <input
              className="flex-1 rounded-md bg-[#050816] border border-white/20 text-gray-100 px-2 py-1 text-sm"
              placeholder="Add email (admin, staff, VIP)"
              value={privEmailInput}
              onChange={(e) => setPrivEmailInput(e.target.value)}
            />
            <button
              className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm"
              disabled={saving}
              onClick={() => {
                if (!privEmailInput.trim()) return;
                setSettings({
                  ...settings,
                  privilegedUsers: {
                    emails: [
                      ...settings.privilegedUsers.emails,
                      privEmailInput.trim(),
                    ],
                  },
                });
                setPrivEmailInput("");
              }}
            >
              Add
            </button>
          </div>
        </section>
      </div>

      {/* LEGAL & COMPLIANCE */}
      <section className="p-5 rounded-xl bg-[#0d1224] border border-white/10 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Legal & Compliance
          </h2>
          <p className="text-xs text-gray-400">
            These texts power your public /legal pages and compliance behavior.
          </p>
        </div>

        {/* Row: default state + safe mode */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">
              Default state (for compliance clauses)
            </label>
            <input
              className="w-32 rounded-md bg-[#050816] border border-white/20 text-gray-100 px-2 py-1 text-sm"
              value={settings.compliance?.defaultState || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  compliance: {
                    ...settings.compliance,
                    defaultState: e.target.value,
                  },
                })
              }
            />
          </div>

          <label className="flex items-center justify-between text-sm mt-2 md:mt-0">
            <span className="text-gray-200">Enable compliance safety rules</span>
            <input
              type="checkbox"
              checked={settings.compliance?.safeMode ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  compliance: {
                    ...settings.compliance,
                    safeMode: e.target.checked,
                  },
                })
              }
            />
          </label>
        </div>

        {/* Terms / Privacy / Disclaimer textareas */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">
              Terms of Service (HTML)
            </label>
            <textarea
              className="w-full min-h-[140px] rounded-md bg-[#050816] border border-white/20 text-gray-100 px-2 py-2 text-xs"
              value={settings.legal?.termsUrl || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  legal: {
                    ...settings.legal,
                    termsUrl: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-gray-400">
              Privacy Policy (HTML)
            </label>
            <textarea
              className="w-full min-h-[140px] rounded-md bg-[#050816] border border-white/20 text-gray-100 px-2 py-2 text-xs"
              value={settings.legal?.privacyUrl || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  legal: {
                    ...settings.legal,
                    privacyUrl: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">
              Legal Disclaimer (HTML)
            </label>
            <textarea
              className="w-full min-h-[120px] rounded-md bg-[#050816] border border-white/20 text-gray-100 px-2 py-2 text-xs"
              value={settings.legal?.legalDisclaimer || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  legal: {
                    ...settings.legal,
                    legalDisclaimer: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-gray-400">
              Limited Liability Clause (HTML)
            </label>
            <textarea
              className="w-full min-h-[120px] rounded-md bg-[#050816] border border-white/20 text-gray-100 px-2 py-2 text-xs"
              value={settings.legal?.limitedLiabilityText || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  legal: {
                    ...settings.legal,
                    limitedLiabilityText: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </section>

      {/* USAGE / BILLING & PRODUCT UPGRADES */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* USAGE / BILLING */}
        <section className="p-4 rounded-xl bg-[#0d1224] border border-white/10 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Usage & Billing
            </h2>
            <p className="text-xs text-gray-400">
              Enable Stripe enforcement and customer portal integration.
            </p>
          </div>

          <label className="flex items-center justify-between text-sm">
            <span className="text-gray-200">
              Enable Stripe billing enforcement
            </span>
            <input
              type="checkbox"
              checked={settings.usage?.stripeEnabled ?? false}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  usage: {
                    ...settings.usage,
                    stripeEnabled: e.target.checked,
                  },
                })
              }
            />
          </label>

          <div className="space-y-1">
            <label className="block text-xs text-gray-400">
              Stripe Customer Portal URL
            </label>
            <input
              className="w-full rounded-md bg-[#050816] border border-white/20 text-gray-100 px-2 py-1 text-sm"
              placeholder="https://billing.stripe.com/..."
              value={settings.usage?.stripeCustomerPortalUrl || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  usage: {
                    ...settings.usage,
                    stripeCustomerPortalUrl: e.target.value,
                  },
                })
              }
            />
          </div>

          <label className="flex items-center justify-between text-sm">
            <span className="text-gray-200">Enable "My Documents" dashboard</span>
            <input
              type="checkbox"
              checked={settings.usage?.myDocumentsEnabled ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  usage: {
                    ...settings.usage,
                    myDocumentsEnabled: e.target.checked,
                  },
                })
              }
            />
          </label>
        </section>

        {/* PRODUCT UPGRADES */}
        <section className="p-4 rounded-xl bg-[#0d1224] border border-white/10 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Product Upgrades (Leases)
            </h2>
            <p className="text-xs text-gray-400">
              Control advanced PDF and DOCX output options.
            </p>
          </div>

          <label className="flex items-center justify-between text-sm">
            <span className="text-gray-200">Attorney-grade PDF layout</span>
            <input
              type="checkbox"
              checked={settings.pdfOptions?.attorneyGradeLayout ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pdfOptions: {
                    ...settings.pdfOptions,
                    attorneyGradeLayout: e.target.checked,
                  },
                })
              }
            />
          </label>

          <label className="flex items-center justify-between text-sm">
            <span className="text-gray-200">Multi-page formatting</span>
            <input
              type="checkbox"
              checked={settings.pdfOptions?.multipageFormatting ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pdfOptions: {
                    ...settings.pdfOptions,
                    multipageFormatting: e.target.checked,
                  },
                })
              }
            />
          </label>

          <label className="flex items-center justify-between text-sm">
            <span className="text-gray-200">Signature blocks</span>
            <input
              type="checkbox"
              checked={settings.pdfOptions?.signatureBlocks ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pdfOptions: {
                    ...settings.pdfOptions,
                    signatureBlocks: e.target.checked,
                  },
                })
              }
            />
          </label>

          <label className="flex items-center justify-between text-sm">
            <span className="text-gray-200">Editable fields in lease</span>
            <input
              type="checkbox"
              checked={settings.pdfOptions?.editableFields ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pdfOptions: {
                    ...settings.pdfOptions,
                    editableFields: e.target.checked,
                  },
                })
              }
            />
          </label>
        </section>
      </div>

      {/* OPTIONAL CLAUSES */}
      <section className="p-5 rounded-xl bg-[#0d1224] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Optional Lease Clauses
            </h2>
            <p className="text-xs text-gray-400">
              These clauses will be requested in the prompt and included in
              leases when applicable.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {/* Recommended */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
              Recommended
            </h3>
            <div className="space-y-1">
              {OPTIONAL_CLAUSES.recommended.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 text-xs text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={settings.optionalClauses?.includes(c) ?? false}
                    onChange={() => toggleOptional(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Landlord-protective */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
              Landlord Protective
            </h3>
            <div className="space-y-1">
              {OPTIONAL_CLAUSES.landlordProtective.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 text-xs text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={settings.optionalClauses?.includes(c) ?? false}
                    onChange={() => toggleOptional(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tenant Responsibility */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
              Tenant Responsibility
            </h3>
            <div className="space-y-1">
              {OPTIONAL_CLAUSES.tenantResponsibility.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 text-xs text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={settings.optionalClauses?.includes(c) ?? false}
                    onChange={() => toggleOptional(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Move-in / Move-out */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
              Move-in / Move-out
            </h3>
            <div className="space-y-1">
              {OPTIONAL_CLAUSES.moveInOut.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 text-xs text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={settings.optionalClauses?.includes(c) ?? false}
                    onChange={() => toggleOptional(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* You can add more categories later if you want, using OPTIONAL_CLAUSES.safetyLegal, etc. */}
      </section>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
