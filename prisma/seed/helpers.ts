import { CellValue } from "exceljs";

/**
 * Parse Excel number values handling:
 * - Comma-separated: "4,293,158"
 * - Space-padded: " 4,293,158 "
 * - Parentheses for negatives: "(263,102)"
 * - Dash for zero: " -   "
 * - #REF! errors: return null
 * - Empty/null values: return 0
 */
export function parseExcelNumber(val: CellValue): number | null {
  if (val === null || val === undefined) return 0;

  let str = String(val).trim();

  if (str === "" || str === "-" || str === "- " || /^-\s*$/.test(str)) return 0;
  if (str === "#REF!" || str === "#N/A" || str === "#VALUE!") return null;

  // Handle ExcelJS returning numeric values directly
  if (typeof val === "number") return val;

  // Handle formula results
  if (typeof val === "object" && val !== null && "result" in val) {
    const result = (val as any).result;
    if (typeof result === "number") return result;
    if (result === null || result === undefined) return 0;
    str = String(result).trim();
  }

  // Remove commas
  str = str.replace(/,/g, "");

  // Handle parentheses for negatives: (123) -> -123
  if (str.startsWith("(") && str.endsWith(")")) {
    str = "-" + str.slice(1, -1);
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Parse various date formats from Excel:
 * - Date objects (ExcelJS auto-parses)
 * - "07-Sep-22"
 * - "April 5, 2023"
 * - "7/1/23"
 * - "01-Nov-22"
 * - Excel serial date numbers
 */
export function parseExcelDate(val: CellValue): Date | null {
  if (val === null || val === undefined) return null;

  if (val instanceof Date) return val;

  if (typeof val === "number") {
    // Excel serial date (days since 1900-01-01)
    const epoch = new Date(1899, 11, 30);
    epoch.setDate(epoch.getDate() + val);
    return epoch;
  }

  if (typeof val === "object" && val !== null && "result" in val) {
    return parseExcelDate((val as any).result);
  }

  const str = String(val).trim();
  if (!str || str === "#REF!" || str === "-") return null;

  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  return null;
}

/**
 * Normalize investor code: trim whitespace, uppercase
 */
export function normalizeInvestorCode(code: CellValue): string {
  if (!code) return "";
  return String(code).trim().toUpperCase();
}

/**
 * Map Excel investor type to our enum values
 */
export function mapInvestorType(excelType: CellValue): string {
  const type = String(excelType || "Individual").trim();

  const mapping: Record<string, string> = {
    "Individual": "INDIVIDUAL",
    "Company/Organization": "COMPANY_ORGANIZATION",
    "Mutual Fund": "MUTUAL_FUND",
    "Provident Fund": "PROVIDENT_FUND",
    "Providend Fund": "PROVIDENT_FUND", // typo in data
    "Gratuity Fund": "GRATUITY_FUND",
  };

  return mapping[type] || "INDIVIDUAL";
}

/**
 * Get a string value from a cell
 */
export function getCellString(val: CellValue): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object" && "result" in val) {
    return String((val as any).result || "").trim();
  }
  return String(val).trim();
}

/**
 * Generate a temp password from investor code
 */
export function generateTempPassword(investorCode: string): string {
  return `Ekush@${investorCode}2026`;
}

/**
 * Log progress
 */
export function logProgress(message: string) {
  console.log(`[SEED] ${new Date().toISOString().slice(11, 19)} ${message}`);
}
