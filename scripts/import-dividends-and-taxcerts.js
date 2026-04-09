const { PrismaClient } = require("@prisma/client");
const ExcelJS = require("exceljs");
const path = require("path");

const prisma = new PrismaClient();

const FILES = [
  { file: "EFUF/2026.03.25 INVESTORS.xlsx", fundCode: "EFUF" },
  { file: "EGF/EGF_2026.03.25 INVESTORS.xlsx", fundCode: "EGF" },
  { file: "ESRF/ESRF_2026.03.25 INVESTORS - Copy.xlsx", fundCode: "ESRF" },
];

function cellVal(cell) {
  if (cell === null || cell === undefined) return null;
  if (typeof cell === "object" && cell.result !== undefined) return cell.result;
  if (typeof cell === "object" && cell.formula) return null; // unresolved formula
  return cell;
}

function toNum(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

async function importDividends() {
  console.log("=== Importing Dividends ===");

  // Build investor code -> id map
  const investors = await prisma.investor.findMany({ select: { id: true, investorCode: true } });
  const investorMap = new Map(investors.map((i) => [i.investorCode, i.id]));

  // Build fund code -> id map
  const funds = await prisma.fund.findMany({ select: { id: true, code: true } });
  const fundMap = new Map(funds.map((f) => [f.code, f.id]));

  let totalImported = 0;

  for (const { file, fundCode } of FILES) {
    const fundId = fundMap.get(fundCode);
    if (!fundId) {
      console.log(`Fund ${fundCode} not found in DB, skipping`);
      continue;
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path.resolve(__dirname, "..", file));
    const sheet = wb.getWorksheet("Dividend & Tax");
    if (!sheet) {
      console.log(`${fundCode}: No 'Dividend & Tax' sheet`);
      continue;
    }

    // Read headers
    const row1 = sheet.getRow(1);
    const headers = {};
    row1.eachCell({ includeEmpty: true }, (cell, col) => {
      headers[String(cell.value).trim().replace(/\n/g, " ")] = col;
    });

    const dividends = [];

    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const investorCode = cellVal(row.getCell(headers["Investor ID"]).value);
      if (!investorCode) continue;

      const investorId = investorMap.get(investorCode);
      if (!investorId) continue;

      const accountingYear = String(cellVal(row.getCell(headers["Accounting Year"]).value) || "");
      const paidDate = cellVal(row.getCell(headers["Paid Date"]).value);
      const totalUnits = toNum(cellVal(row.getCell(headers["Total Units"]).value));
      const dividendPerUnit = toNum(cellVal(row.getCell(headers["Dividend Per Unit"]).value));
      const grossDividend = toNum(cellVal(row.getCell(headers["Gross Dividend"]).value));

      // Tax Rate column name varies
      const taxRateCol = headers["Tax Rate (If Applicable)"] || headers["Tax Rate"];
      const taxRate = taxRateCol ? toNum(cellVal(row.getCell(taxRateCol).value)) : 0;

      const taxAmount = toNum(cellVal(row.getCell(headers["Tax Amount"]).value));
      const netDividend = toNum(cellVal(row.getCell(headers["Net Dividend"]).value));
      const dividendOption = cellVal(row.getCell(headers["Dividend Option"]).value) || "CASH";
      const tin = cellVal(row.getCell(headers["TIN"]).value) || null;

      dividends.push({
        investorId,
        fundId,
        accountingYear,
        paymentDate: paidDate ? new Date(paidDate) : null,
        totalUnits,
        dividendPerUnit,
        grossDividend,
        taxRate: taxRate > 1 ? taxRate / 100 : taxRate, // normalize to decimal
        taxAmount,
        netDividend,
        dividendOption: dividendOption === "CIP" ? "CIP" : "CASH",
        tinNumber: tin ? String(tin) : null,
      });
    }

    if (dividends.length > 0) {
      // Delete existing dividends for this fund to avoid duplicates
      await prisma.dividend.deleteMany({ where: { fundId } });
      // Batch insert
      const batchSize = 500;
      for (let i = 0; i < dividends.length; i += batchSize) {
        await prisma.dividend.createMany({ data: dividends.slice(i, i + batchSize) });
      }
      console.log(`${fundCode}: Imported ${dividends.length} dividends`);
      totalImported += dividends.length;
    }
  }

  console.log(`Total dividends imported: ${totalImported}`);
}

async function generateTaxCertificates() {
  console.log("\n=== Generating Tax Certificates ===");

  const funds = await prisma.fund.findMany();
  const fundMap = new Map(funds.map((f) => [f.id, f]));

  // Get all investors with holdings
  const holdings = await prisma.fundHolding.findMany({
    select: { investorId: true, fundId: true },
  });

  // Get unique investor-fund pairs
  const pairs = [...new Set(holdings.map((h) => `${h.investorId}|${h.fundId}`))].map((p) => {
    const [investorId, fundId] = p.split("|");
    return { investorId, fundId };
  });

  console.log(`Processing ${pairs.length} investor-fund pairs...`);

  // Assessment year periods (Bangladesh fiscal year: July 1 - June 30)
  // We'll detect periods from transaction data
  const allTxns = await prisma.transaction.findMany({
    select: { orderDate: true },
    orderBy: { orderDate: "asc" },
  });

  if (allTxns.length === 0) {
    console.log("No transactions found");
    return;
  }

  const minDate = allTxns[0].orderDate;
  const maxDate = allTxns[allTxns.length - 1].orderDate;

  // Build fiscal year periods
  const periods = [];
  let startYear = minDate.getFullYear();
  if (minDate.getMonth() < 6) startYear--; // Before July -> previous fiscal year

  const endYear = maxDate.getFullYear();
  const currentEndYear = maxDate.getMonth() >= 6 ? endYear + 1 : endYear;

  for (let y = startYear; y < currentEndYear; y++) {
    periods.push({
      start: new Date(y, 6, 1), // July 1
      end: new Date(y + 1, 5, 30, 23, 59, 59), // June 30
      label: `${y + 1} - ${String(y + 2).slice(-2)}`,
    });
  }

  console.log(`Fiscal year periods: ${periods.map((p) => p.label).join(", ")}`);

  // Delete existing tax certificates
  await prisma.taxCertificate.deleteMany({});

  let totalCerts = 0;
  const batchSize = 200;
  let batch = [];

  for (const { investorId, fundId } of pairs) {
    const fund = fundMap.get(fundId);
    if (!fund) continue;

    // Get all transactions for this investor-fund
    const txns = await prisma.transaction.findMany({
      where: { investorId, fundId, status: "EXECUTED" },
      orderBy: { orderDate: "asc" },
    });

    // Get dividends for this investor-fund
    const divs = await prisma.dividend.findMany({
      where: { investorId, fundId },
    });

    for (const period of periods) {
      // Transactions before period start (for opening balance)
      const beforePeriod = txns.filter((t) => t.orderDate < period.start);
      const duringPeriod = txns.filter(
        (t) => t.orderDate >= period.start && t.orderDate <= period.end
      );

      // Skip if investor had no activity at all up to this period end
      const upToPeriodEnd = txns.filter((t) => t.orderDate <= period.end);
      if (upToPeriodEnd.length === 0) continue;

      // Opening balance
      let openingUnits = 0;
      let openingCost = 0;
      for (const t of beforePeriod) {
        if (t.direction === "BUY") {
          openingUnits += t.units;
          openingCost += t.amount;
        } else {
          openingUnits -= t.units;
          openingCost -= t.costOfUnitsSold;
        }
      }

      // During period
      let addedUnits = 0;
      let addedCost = 0;
      let redeemedUnits = 0;
      let redeemedCost = 0;
      let realizedGain = 0;

      for (const t of duringPeriod) {
        if (t.direction === "BUY") {
          addedUnits += t.units;
          addedCost += t.amount;
        } else {
          redeemedUnits += t.units;
          redeemedCost += t.amount; // sell amount
          realizedGain += t.realizedGain;
        }
      }

      // Closing
      const closingUnits = openingUnits + addedUnits - redeemedUnits;
      const closingCost = openingCost + addedCost - (duringPeriod.filter(t => t.direction === "SELL").reduce((s, t) => s + t.costOfUnitsSold, 0));

      // Skip if no units at opening or closing
      if (openingUnits <= 0 && closingUnits <= 0 && addedUnits <= 0) continue;

      // NAV at period end — use the last transaction NAV in the period, or fund's current NAV
      const lastTxnInPeriod = [...duringPeriod].reverse().find((t) => t.nav > 0);
      const lastTxnBefore = [...beforePeriod].reverse().find((t) => t.nav > 0);
      const navAtEnd = lastTxnInPeriod?.nav || lastTxnBefore?.nav || fund.currentNav;

      const openingNav = lastTxnBefore?.nav || (beforePeriod.length > 0 ? navAtEnd : 0);

      const openingMarketValue = openingUnits * openingNav;
      const closingMarketValue = closingUnits * navAtEnd;

      // Dividends during this period
      const periodDivs = divs.filter((d) => {
        if (!d.paymentDate) return false;
        return d.paymentDate >= period.start && d.paymentDate <= period.end;
      });

      const grossDividend = periodDivs.reduce((s, d) => s + d.grossDividend, 0);
      const totalTax = periodDivs.reduce((s, d) => s + d.taxAmount, 0);
      const netDividend = periodDivs.reduce((s, d) => s + d.netDividend, 0);

      const netInvestment = addedCost - redeemedCost;

      batch.push({
        investorId,
        fundId,
        periodStart: period.start,
        periodEnd: period.end,
        beginningUnits: Math.max(0, openingUnits),
        beginningCostValue: Math.max(0, openingCost),
        beginningMarketValue: Math.max(0, openingMarketValue),
        beginningUnrealizedGain: openingMarketValue - openingCost,
        endingUnits: Math.max(0, closingUnits),
        endingCostValue: Math.max(0, closingCost),
        endingMarketValue: Math.max(0, closingMarketValue),
        endingUnrealizedGain: closingMarketValue - closingCost,
        totalUnitsAdded: addedUnits,
        totalAdditionAtCost: addedCost,
        totalUnitsRedeemed: redeemedUnits,
        totalRedemptionAtCost: redeemedCost,
        netInvestment,
        totalRealizedGain: realizedGain,
        totalGrossDividend: grossDividend,
        totalTax,
        totalNetDividend: netDividend,
        navAtEnd,
      });

      if (batch.length >= batchSize) {
        await prisma.taxCertificate.createMany({ data: batch });
        totalCerts += batch.length;
        batch = [];
        process.stdout.write(`\r  Created ${totalCerts} certificates...`);
      }
    }
  }

  if (batch.length > 0) {
    await prisma.taxCertificate.createMany({ data: batch });
    totalCerts += batch.length;
  }

  console.log(`\nTotal tax certificates generated: ${totalCerts}`);
}

async function main() {
  try {
    await importDividends();
    await generateTaxCertificates();
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
