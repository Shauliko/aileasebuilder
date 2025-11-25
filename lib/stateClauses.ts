export const STATE_CLAUSES: Record<string, any> = {
  CA: {
    name: "California",
    landlordTenantAct: "California Civil Code § 1940–1954",
    disclosures: [
      "Mold Disclosure (required under California Health & Safety Code §26147)",
      "Bed Bug Disclosure (AB 551)",
      "Pest Control Notice",
      "Smoke Detector Compliance (Health & Safety Code §13113.7)",
      "Water Heater Bracing Statement",
    ],
    habitability: [
      "Landlord must maintain habitability under the California Civil Code.",
      "Tenant may use 'repair and deduct' up to one month’s rent.",
    ],
    addendums: [
      "Option: Rent Control Notice (if applicable)",
      "Option: Prop 65 Environmental Notice",
    ],
    forbiddenClauses: [
      "CLAUSE PROHIBITING TENANT FROM REPORTING CODE VIOLATIONS",
      "WAIVER OF HABITABILITY RIGHTS",
      "ILLEGAL LATE FEES ABOVE REASONABLE AMOUNT",
    ],
  },

  TX: {
    name: "Texas",
    landlordTenantAct: "Texas Property Code Chapter 92",
    disclosures: [
      "Security Device Disclosure",
      "Parking Rules Addendum",
      "Flood Disclosure (Texas Property Code 92.0135)",
    ],
    habitability: [
      "Landlord must repair conditions that materially affect health and safety.",
    ],
    addendums: [
      "Lead-based paint disclosure (if property built before 1978)",
    ],
    forbiddenClauses: [
      "WAIVING RIGHT TO REPAIRS",
      "ILLEGAL LOCKOUT POLICY",
    ],
  },

  NY: {
    name: "New York",
    landlordTenantAct: "New York Real Property Law (RPL) §235-b",
    disclosures: [
      "Window Guard Notice",
      "Lead Paint Hazard Notice",
    ],
    habitability: [
      "Landlord must maintain habitable conditions under the Warranty of Habitability (RPL §235-b).",
    ],
    addendums: [
      "Stove Gas Safety Disclosure",
    ],
    forbiddenClauses: [
      "LANDLORD LIMITING LIABILITY FOR NEGLIGENCE",
      "ILLEGAL FEES OUTSIDE ACTUAL COST",
    ],
  },

  // fallback
  DEFAULT: {
    name: "Generic State",
    landlordTenantAct: "",
    disclosures: [],
    habitability: [],
    addendums: [],
    forbiddenClauses: [],
  },
};
