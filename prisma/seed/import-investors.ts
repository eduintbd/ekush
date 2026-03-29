import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import { hash } from "bcryptjs";
import {
  parseExcelNumber,
  normalizeInvestorCode,
  mapInvestorType,
  getCellString,
  generateTempPassword,
  logProgress,
} from "./helpers";

interface InvestorData {
  code: string;
  name: string;
  title: string;
  type: string;
}

interface HoldingData {
  investorCode: string;
  fundCode: string;
  lsUnitsBought: number;
  lsUnitsSold: number;
  lsCurrentUnits: number;
  lsCostValue: number;
  lsCostOfUnitsSold: number;
  lsCostValueCurrent: number;
  lsRealizedGain: number;
  lsWeight: number;
  lsAvgCost: number;
  lsMarketValue: number;
  sipUnitsBought: number;
  sipUnitsSold: number;
  sipCurrentUnits: number;
  sipCostValue: number;
  sipCostOfUnitsSold: number;
  sipCostValueCurrent: number;
  sipRealizedGain: number;
  sipWeight: number;
  sipAvgCost: number;
  sipMarketValue: number;
  totalUnitsBought: number;
  totalUnitsSold: number;
  boOpeningBalance: number;
  totalCurrentUnits: number;
  totalCostValueCurrent: number;
  avgCost: number;
  nav: number;
  totalMarketValue: number;
  totalSellableUnits: number;
  marketValueSellable: number;
  totalRealizedGain: number;
  totalUnrealizedGain: number;
  percentUnitsHold: number;
  grossDividend: number;
}

const FUND_FILES: { code: string; path: string; sheetName: string }[] = [
  {
    code: "EFUF",
    path: "C:/Repos/Ekush/EFUF/2026.03.25 INVESTORS.xlsx",
    sheetName: "INVESTORS",
  },
  {
    code: "EGF",
    path: "C:/Repos/Ekush/EGF/EGF_2026.03.25 INVESTORS.xlsx",
    sheetName: "INVESTORS",
  },
  {
    code: "ESRF",
    path: "C:/Repos/Ekush/ESRF/ESRF_2026.03.25 INVESTORS - Copy.xlsx",
    sheetName: "INVESTORS",
  },
];

export async function importInvestors(prisma: PrismaClient) {
  logProgress("Starting investor import...");

  // Collect all investors and holdings from all fund files
  const investorMap = new Map<string, InvestorData>();
  const allHoldings: HoldingData[] = [];

  for (const fundFile of FUND_FILES) {
    logProgress(`Reading ${fundFile.code} from ${fundFile.path}...`);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fundFile.path);

    const sheet = workbook.getWorksheet(fundFile.sheetName);
    if (!sheet) {
      // Try first sheet
      const firstSheet = workbook.worksheets[0];
      if (!firstSheet) {
        logProgress(`WARNING: No sheet found in ${fundFile.path}, skipping`);
        continue;
      }
      await processSheet(firstSheet, fundFile.code, investorMap, allHoldings);
    } else {
      await processSheet(sheet, fundFile.code, investorMap, allHoldings);
    }
  }

  logProgress(`Found ${investorMap.size} unique investors across all funds`);
  logProgress(`Found ${allHoldings.length} fund holdings to create`);

  // Create users and investors
  let created = 0;
  for (const [code, data] of investorMap) {
    const tempPassword = generateTempPassword(code);
    const passwordHash = await hash(tempPassword, 10);

    try {
      await prisma.user.create({
        data: {
          passwordHash,
          role: "INVESTOR",
          status: "PENDING",
          investor: {
            create: {
              investorCode: code,
              name: data.name,
              title: data.title || null,
              investorType: data.type,
            },
          },
        },
      });
      created++;
    } catch (e: any) {
      if (e.code === "P2002") {
        // Duplicate - already exists
        logProgress(`Investor ${code} already exists, skipping`);
      } else {
        logProgress(`ERROR creating investor ${code}: ${e.message}`);
      }
    }
  }
  logProgress(`Created ${created} investor accounts`);

  // Create fund holdings
  let holdingsCreated = 0;
  for (const h of allHoldings) {
    const investor = await prisma.investor.findUnique({
      where: { investorCode: h.investorCode },
    });
    const fund = await prisma.fund.findUnique({
      where: { code: h.fundCode },
    });

    if (!investor || !fund) {
      logProgress(`WARNING: Cannot find investor ${h.investorCode} or fund ${h.fundCode}`);
      continue;
    }

    try {
      await prisma.fundHolding.upsert({
        where: {
          investorId_fundId: {
            investorId: investor.id,
            fundId: fund.id,
          },
        },
        update: {
          lsUnitsBought: h.lsUnitsBought,
          lsUnitsSold: h.lsUnitsSold,
          lsCurrentUnits: h.lsCurrentUnits,
          lsCostValue: h.lsCostValue,
          lsCostOfUnitsSold: h.lsCostOfUnitsSold,
          lsCostValueCurrent: h.lsCostValueCurrent,
          lsRealizedGain: h.lsRealizedGain,
          lsWeight: h.lsWeight,
          lsAvgCost: h.lsAvgCost,
          lsMarketValue: h.lsMarketValue,
          sipUnitsBought: h.sipUnitsBought,
          sipUnitsSold: h.sipUnitsSold,
          sipCurrentUnits: h.sipCurrentUnits,
          sipCostValue: h.sipCostValue,
          sipCostOfUnitsSold: h.sipCostOfUnitsSold,
          sipCostValueCurrent: h.sipCostValueCurrent,
          sipRealizedGain: h.sipRealizedGain,
          sipWeight: h.sipWeight,
          sipAvgCost: h.sipAvgCost,
          sipMarketValue: h.sipMarketValue,
          totalUnitsBought: h.totalUnitsBought,
          totalUnitsSold: h.totalUnitsSold,
          boOpeningBalance: h.boOpeningBalance,
          totalCurrentUnits: h.totalCurrentUnits,
          totalCostValueCurrent: h.totalCostValueCurrent,
          avgCost: h.avgCost,
          nav: h.nav,
          totalMarketValue: h.totalMarketValue,
          totalSellableUnits: h.totalSellableUnits,
          marketValueSellable: h.marketValueSellable,
          totalRealizedGain: h.totalRealizedGain,
          totalUnrealizedGain: h.totalUnrealizedGain,
          percentUnitsHold: h.percentUnitsHold,
          grossDividend: h.grossDividend,
        },
        create: {
          investorId: investor.id,
          fundId: fund.id,
          lsUnitsBought: h.lsUnitsBought,
          lsUnitsSold: h.lsUnitsSold,
          lsCurrentUnits: h.lsCurrentUnits,
          lsCostValue: h.lsCostValue,
          lsCostOfUnitsSold: h.lsCostOfUnitsSold,
          lsCostValueCurrent: h.lsCostValueCurrent,
          lsRealizedGain: h.lsRealizedGain,
          lsWeight: h.lsWeight,
          lsAvgCost: h.lsAvgCost,
          lsMarketValue: h.lsMarketValue,
          sipUnitsBought: h.sipUnitsBought,
          sipUnitsSold: h.sipUnitsSold,
          sipCurrentUnits: h.sipCurrentUnits,
          sipCostValue: h.sipCostValue,
          sipCostOfUnitsSold: h.sipCostOfUnitsSold,
          sipCostValueCurrent: h.sipCostValueCurrent,
          sipRealizedGain: h.sipRealizedGain,
          sipWeight: h.sipWeight,
          sipAvgCost: h.sipAvgCost,
          sipMarketValue: h.sipMarketValue,
          totalUnitsBought: h.totalUnitsBought,
          totalUnitsSold: h.totalUnitsSold,
          boOpeningBalance: h.boOpeningBalance,
          totalCurrentUnits: h.totalCurrentUnits,
          totalCostValueCurrent: h.totalCostValueCurrent,
          avgCost: h.avgCost,
          nav: h.nav,
          totalMarketValue: h.totalMarketValue,
          totalSellableUnits: h.totalSellableUnits,
          marketValueSellable: h.marketValueSellable,
          totalRealizedGain: h.totalRealizedGain,
          totalUnrealizedGain: h.totalUnrealizedGain,
          percentUnitsHold: h.percentUnitsHold,
          grossDividend: h.grossDividend,
        },
      });
      holdingsCreated++;
    } catch (e: any) {
      logProgress(`ERROR creating holding for ${h.investorCode} in ${h.fundCode}: ${e.message}`);
    }
  }

  logProgress(`Created/updated ${holdingsCreated} fund holdings`);
}

async function processSheet(
  sheet: ExcelJS.Worksheet,
  fundCode: string,
  investorMap: Map<string, InvestorData>,
  allHoldings: HoldingData[]
) {
  // Read header row to determine column mapping
  const headerRow = sheet.getRow(1);
  const headers: Record<string, number> = {};

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const val = getCellString(cell.value).toUpperCase().replace(/\s+/g, " ").trim();
    headers[val] = colNumber;
  });

  logProgress(`  Found ${Object.keys(headers).length} columns in ${fundCode}`);

  // Process data rows (skip header)
  const rowCount = sheet.rowCount;
  let processed = 0;

  for (let rowNum = 2; rowNum <= rowCount; rowNum++) {
    const row = sheet.getRow(rowNum);

    // Try to find investor code/name - different column names across files
    let code = "";
    let name = "";
    let title = "";
    let type = "Individual";

    // Try common column name patterns
    const codeCol = headers["INVESTOR CODE"] || headers["INVESTOR"] || headers["CODE"];
    const nameCol = headers["INVESTOR NAME"] || headers["NAME"];
    const titleCol = headers["TITLE"];
    const typeCol = headers["TYPE OF INVESTOR"] || headers["INVESTOR TYPE"];

    // For simpler files (EFUF/EGF), the first column might be "Investor" with combined data
    if (nameCol) {
      name = getCellString(row.getCell(nameCol).value);
    }
    if (codeCol) {
      const codeVal = getCellString(row.getCell(codeCol).value);
      // If code column is same as name column, try to extract code
      if (codeCol === nameCol) {
        name = codeVal;
      } else {
        code = normalizeInvestorCode(row.getCell(codeCol).value);
      }
    }

    // If no explicit code column, try to find it in the data pattern
    // Look for cells that match investor code pattern (letter + digits)
    if (!code) {
      for (let c = 1; c <= Math.min(5, headerRow.cellCount); c++) {
        const cellVal = getCellString(row.getCell(c).value);
        if (/^[A-Z]\d{4,6}$/.test(cellVal.trim())) {
          code = cellVal.trim();
          break;
        }
      }
    }

    // Try first column as name if still empty
    if (!name) {
      name = getCellString(row.getCell(1).value);
    }

    // Skip empty rows or summary rows
    if (!name || name === "" || name.startsWith("Total") || name.startsWith("Grand")) continue;

    // Try to find code in the second column if not found
    if (!code && headerRow.cellCount >= 2) {
      const secondCell = getCellString(row.getCell(2).value);
      if (/^[A-Z]\d{4,6}$/.test(secondCell)) {
        code = secondCell;
      }
    }

    // Generate a code if none found (shouldn't happen with real data)
    if (!code) {
      code = `GEN${String(rowNum).padStart(5, "0")}`;
    }

    if (titleCol) title = getCellString(row.getCell(titleCol).value);
    if (typeCol) type = getCellString(row.getCell(typeCol).value);

    // Add to investor map (dedup across funds)
    if (!investorMap.has(code)) {
      investorMap.set(code, {
        code,
        name,
        title,
        type: mapInvestorType(type),
      });
    }

    // Build holding data - try to read all possible columns
    const getNum = (colName: string): number => {
      const col = headers[colName];
      if (!col) return 0;
      return parseExcelNumber(row.getCell(col).value) || 0;
    };

    const holding: HoldingData = {
      investorCode: code,
      fundCode,
      // LS fields
      lsUnitsBought: getNum("LS_TOTAL UNITS BUY") || getNum("LS TOTAL UNITS BUY"),
      lsUnitsSold: getNum("LS_TOTAL UNITS SOLD") || getNum("LS TOTAL UNITS SOLD"),
      lsCurrentUnits: getNum("LS_TOTAL CURRENT UNITS") || getNum("LS TOTAL CURRENT UNITS"),
      lsCostValue: getNum("LS_TOTAL COST VALUE") || getNum("LS TOTAL COST VALUE"),
      lsCostOfUnitsSold: getNum("LS_TOTAL COST OF UNITS SOLD") || getNum("LS TOTAL COST OF UNITS SOLD"),
      lsCostValueCurrent: getNum("LS_TOTAL COST VALUE OF CURRENT UNITS") || getNum("LS TOTAL COST VALUE OF CURRENT UNITS"),
      lsRealizedGain: getNum("LS_TOTAL REALIZED GAIN") || getNum("LS TOTAL REALIZED GAIN"),
      lsWeight: getNum("LS_WEIGHT") || getNum("LS WEIGHT"),
      lsAvgCost: getNum("LS_AVERAGE COST") || getNum("LS AVERAGE COST"),
      lsMarketValue: getNum("LS_TOTAL MARKET VALUE") || getNum("LS TOTAL MARKET VALUE"),
      // SIP fields
      sipUnitsBought: getNum("SIP_TOTAL UNITS BUY") || getNum("SIP TOTAL UNITS BUY"),
      sipUnitsSold: getNum("SIP_TOTAL UNITS SOLD") || getNum("SIP TOTAL UNITS SOLD"),
      sipCurrentUnits: getNum("SIP_TOTAL CURRENT UNITS") || getNum("SIP TOTAL CURRENT UNITS"),
      sipCostValue: getNum("SIP_TOTAL COST VALUE") || getNum("SIP TOTAL COST VALUE"),
      sipCostOfUnitsSold: getNum("SIP_TOTAL COST OF UNITS SOLD") || getNum("SIP TOTAL COST OF UNITS SOLD"),
      sipCostValueCurrent: getNum("SIP_TOTAL COST VALUE OF CURRENT UNITS") || getNum("SIP TOTAL COST VALUE OF CURRENT UNITS"),
      sipRealizedGain: getNum("SIP_TOTAL REALIZED GAIN") || getNum("SIP TOTAL REALIZED GAIN"),
      sipWeight: getNum("SIP_WEIGHT") || getNum("SIP WEIGHT"),
      sipAvgCost: getNum("SIP_AVERAGE COST") || getNum("SIP AVERAGE COST"),
      sipMarketValue: getNum("SIP_TOTAL MARKET VALUE") || getNum("SIP TOTAL MARKET VALUE"),
      // Consolidated
      totalUnitsBought: getNum("TOTAL UNITS BUY") || getNum("TOTAL UNITS BOUGHT"),
      totalUnitsSold: getNum("TOTAL UNITS SOLD"),
      boOpeningBalance: getNum("BO OPENING BALANCE"),
      totalCurrentUnits: getNum("TOTAL CURRENT UNITS") || getNum("TOTAL UNITS"),
      totalCostValueCurrent: getNum("TOTAL COST VALUE OF CURRENT INVESTMENT") || getNum("TOTAL COST VALUE"),
      avgCost: getNum("AVERAGE COST") || getNum("AVG COST"),
      nav: getNum("NAV"),
      totalMarketValue: getNum("TOTAL MARKET VALUE"),
      totalSellableUnits: getNum("TOTAL SELLABLE UNITS"),
      marketValueSellable: getNum("MARKET VALUE OF SELLABLE UNITS"),
      totalRealizedGain: getNum("TOTAL REALIZED GAIN"),
      totalUnrealizedGain: getNum("TOTAL UNREALIZED GAIN"),
      percentUnitsHold: getNum("% OF UNITS HOLD") || getNum("PERCENT OF UNITS HOLD"),
      grossDividend: getNum("GROSS DIVIDEND"),
    };

    allHoldings.push(holding);
    processed++;
  }

  logProgress(`  Processed ${processed} investor rows from ${fundCode}`);
}
