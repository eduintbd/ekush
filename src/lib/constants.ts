export const FUND_CODES = ["EFUF", "EGF", "ESRF"] as const;
export type FundCode = (typeof FUND_CODES)[number];

export const FUND_NAMES: Record<FundCode, string> = {
  EFUF: "Ekush First Unit Fund",
  EGF: "Ekush Growth Fund",
  ESRF: "Ekush Stable Return Fund",
};

export const FUND_COLORS: Record<FundCode, string> = {
  EFUF: "#1e40af", // blue-800
  EGF: "#059669",  // emerald-600
  ESRF: "#7c3aed", // violet-600
};

export const FUND_BG_COLORS: Record<FundCode, string> = {
  EFUF: "bg-blue-50",
  EGF: "bg-emerald-50",
  ESRF: "bg-violet-50",
};

export const FUND_DESCRIPTIONS: Record<FundCode, string> = {
  EFUF: "Balanced portfolio of equity and debt securities",
  EGF: "Equity-focused fund with higher growth potential",
  ESRF: "Fixed-income securities and IPOs for stable returns",
};

export const INVESTOR_TYPES = [
  "INDIVIDUAL",
  "COMPANY_ORGANIZATION",
  "MUTUAL_FUND",
  "PROVIDENT_FUND",
  "GRATUITY_FUND",
] as const;

export const INVESTOR_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual",
  COMPANY_ORGANIZATION: "Company/Organization",
  MUTUAL_FUND: "Mutual Fund",
  PROVIDENT_FUND: "Provident Fund",
  GRATUITY_FUND: "Gratuity Fund",
};

// Tax rates by investor type (Bangladesh)
export const TAX_RATES: Record<string, number> = {
  INDIVIDUAL_WITH_TIN: 0.10,
  INDIVIDUAL_WITHOUT_TIN: 0.15,
  COMPANY_ORGANIZATION: 0.20,
  MUTUAL_FUND: 0.00,
  PROVIDENT_FUND: 0.10,
  GRATUITY_FUND: 0.10,
};

export const FACE_VALUE = 10.0;
