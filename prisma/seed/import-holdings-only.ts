import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import {
  parseExcelNumber,
  normalizeInvestorCode,
  getCellString,
  logProgress,
} from "./helpers";

const prisma = new PrismaClient();

const FUND_FILES = [
  { code: "EFUF", path: "C:/Repos/Ekush/EFUF/2026.03.25 INVESTORS.xlsx" },
  { code: "EGF", path: "C:/Repos/Ekush/EGF/EGF_2026.03.25 INVESTORS.xlsx" },
  { code: "ESRF", path: "C:/Repos/Ekush/ESRF/ESRF_2026.03.25 INVESTORS - Copy.xlsx" },
];

async function main() {
  logProgress("=== Holdings-Only Import ===");

  // Pre-fetch all investors and funds into memory
  const allInvestors = await prisma.investor.findMany({ select: { id: true, investorCode: true } });
  const investorMap = new Map(allInvestors.map(i => [i.investorCode, i.id]));
  logProgress(`Loaded ${investorMap.size} investors from DB`);

  const allFunds = await prisma.fund.findMany({ select: { id: true, code: true } });
  const fundMap = new Map(allFunds.map(f => [f.code, f.id]));

  const existingHoldings = await prisma.fundHolding.findMany({ select: { investorId: true, fundId: true } });
  const holdingSet = new Set(existingHoldings.map(h => `${h.investorId}_${h.fundId}`));
  logProgress(`${holdingSet.size} holdings already exist, will skip those`);

  let created = 0;
  let skipped = 0;

  for (const fundFile of FUND_FILES) {
    const fundId = fundMap.get(fundFile.code);
    if (!fundId) { logProgress(`Fund ${fundFile.code} not found, skipping`); continue; }

    logProgress(`Processing ${fundFile.code}...`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fundFile.path);
    const sheet = workbook.worksheets[0];
    if (!sheet) continue;

    const headerRow = sheet.getRow(1);
    const headers: Record<string, number> = {};
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[getCellString(cell.value).toUpperCase().replace(/\s+/g, " ").trim()] = colNumber;
    });

    for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
      const row = sheet.getRow(rowNum);

      // Find investor code
      let code = "";
      for (let c = 1; c <= Math.min(5, headerRow.cellCount); c++) {
        const cellVal = getCellString(row.getCell(c).value);
        if (/^[A-Z]{1,2}\d{4,6}$/.test(cellVal.trim())) { code = cellVal.trim(); break; }
      }
      if (!code) continue;

      const investorId = investorMap.get(code);
      if (!investorId) continue;

      // Skip if holding already exists
      if (holdingSet.has(`${investorId}_${fundId}`)) { skipped++; continue; }

      const getNum = (colName: string): number => {
        const col = headers[colName];
        if (!col) return 0;
        return parseExcelNumber(row.getCell(col).value) || 0;
      };

      try {
        await prisma.fundHolding.create({
          data: {
            investorId,
            fundId,
            lsUnitsBought: getNum("LS_TOTAL UNITS BUY") || getNum("LS TOTAL UNITS BUY"),
            lsUnitsSold: getNum("LS_TOTAL UNITS SOLD") || getNum("LS TOTAL UNITS SOLD"),
            lsCurrentUnits: getNum("LS_TOTAL CURRENT UNITS") || getNum("LS TOTAL CURRENT UNITS"),
            lsCostValue: getNum("LS_TOTAL COST VALUE") || getNum("LS TOTAL COST VALUE"),
            lsCostOfUnitsSold: getNum("LS_TOTAL COST OF UNITS SOLD"),
            lsCostValueCurrent: getNum("LS_TOTAL COST VALUE OF CURRENT UNITS") || getNum("LS TOTAL COST VALUE OF CURRENT UNITS"),
            lsRealizedGain: getNum("LS_TOTAL REALIZED GAIN") || getNum("LS TOTAL REALIZED GAIN"),
            lsWeight: getNum("LS_WEIGHT") || getNum("LS WEIGHT"),
            lsAvgCost: getNum("LS_AVERAGE COST") || getNum("LS AVERAGE COST"),
            lsMarketValue: getNum("LS_TOTAL MARKET VALUE") || getNum("LS TOTAL MARKET VALUE"),
            sipUnitsBought: getNum("SIP_TOTAL UNITS BUY") || getNum("SIP TOTAL UNITS BUY"),
            sipUnitsSold: getNum("SIP_TOTAL UNITS SOLD") || getNum("SIP TOTAL UNITS SOLD"),
            sipCurrentUnits: getNum("SIP_TOTAL CURRENT UNITS") || getNum("SIP TOTAL CURRENT UNITS"),
            sipCostValue: getNum("SIP_TOTAL COST VALUE") || getNum("SIP TOTAL COST VALUE"),
            sipCostOfUnitsSold: getNum("SIP_TOTAL COST OF UNITS SOLD"),
            sipCostValueCurrent: getNum("SIP_TOTAL COST VALUE OF CURRENT UNITS") || getNum("SIP TOTAL COST VALUE OF CURRENT UNITS"),
            sipRealizedGain: getNum("SIP_TOTAL REALIZED GAIN") || getNum("SIP TOTAL REALIZED GAIN"),
            sipWeight: getNum("SIP_WEIGHT") || getNum("SIP WEIGHT"),
            sipAvgCost: getNum("SIP_AVERAGE COST") || getNum("SIP AVERAGE COST"),
            sipMarketValue: getNum("SIP_TOTAL MARKET VALUE") || getNum("SIP TOTAL MARKET VALUE"),
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
          },
        });
        created++;
        if (created % 50 === 0) logProgress(`  Created ${created} holdings so far...`);
      } catch (e: any) {
        if (e.code !== "P2002") logProgress(`  ERROR ${code}/${fundFile.code}: ${e.message.slice(0, 80)}`);
      }
    }
    logProgress(`  ${fundFile.code} done. Created: ${created}, Skipped: ${skipped}`);
  }

  // Update fund AUM
  logProgress("Updating fund AUM...");
  for (const [code, fundId] of fundMap) {
    const aum = await prisma.fundHolding.aggregate({ where: { fundId }, _sum: { totalMarketValue: true, totalCurrentUnits: true } });
    await prisma.fund.update({ where: { id: fundId }, data: { totalAum: aum._sum.totalMarketValue || 0, totalUnits: aum._sum.totalCurrentUnits || 0 } });
  }

  logProgress(`=== DONE. Created ${created} new holdings, skipped ${skipped} existing ===`);
}

main().catch(e => { console.error("Failed:", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
