import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";
import { INVESTOR_TYPE_LABELS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fundCode = req.nextUrl.searchParams.get("fund");
  const certId = req.nextUrl.searchParams.get("id");

  let whereClause: any = { investorId };
  if (certId) whereClause.id = certId;

  const certs = await prisma.taxCertificate.findMany({
    where: whereClause,
    include: {
      fund: true,
      investor: true,
    },
    orderBy: { periodEnd: "desc" },
  });

  const formatted = certs.map((tc) => ({
    id: tc.id,
    investorName: tc.investor.name,
    investorCode: tc.investor.investorCode,
    investorType: INVESTOR_TYPE_LABELS[tc.investor.investorType] || tc.investor.investorType,
    tinNumber: tc.investor.tinNumber || "",
    fundCode: tc.fund.code,
    fundName: tc.fund.name,
    periodStart: tc.periodStart?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) || "N/A",
    periodEnd: tc.periodEnd?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) || "N/A",
    beginningUnits: Number(tc.beginningUnits),
    beginningCostValue: Number(tc.beginningCostValue),
    beginningMarketValue: Number(tc.beginningMarketValue),
    endingUnits: Number(tc.endingUnits),
    endingCostValue: Number(tc.endingCostValue),
    endingMarketValue: Number(tc.endingMarketValue),
    totalUnitsAdded: Number(tc.totalUnitsAdded),
    totalUnitsRedeemed: Number(tc.totalUnitsRedeemed),
    netInvestment: Number(tc.netInvestment),
    totalRealizedGain: Number(tc.totalRealizedGain),
    totalGrossDividend: Number(tc.totalGrossDividend),
    totalTax: Number(tc.totalTax),
    totalNetDividend: Number(tc.totalNetDividend),
    navAtEnd: Number(tc.navAtEnd),
  }));

  return NextResponse.json(formatted);
}
