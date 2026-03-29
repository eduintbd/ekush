import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const adminRoles = ["ADMIN", "MANAGER", "SUPER_ADMIN"];

  if (!adminRoles.includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { date, navValues } = body;

  if (!date || !navValues) {
    return NextResponse.json({ error: "Date and NAV values required" }, { status: 400 });
  }

  const navDate = new Date(date);
  navDate.setHours(0, 0, 0, 0);

  for (const [fundCode, navStr] of Object.entries(navValues)) {
    const nav = parseFloat(navStr as string);
    if (isNaN(nav) || nav <= 0) continue;

    const fund = await prisma.fund.findUnique({ where: { code: fundCode } });
    if (!fund) continue;

    // Update NAV record
    await prisma.navRecord.upsert({
      where: { fundId_date: { fundId: fund.id, date: navDate } },
      update: { nav },
      create: { fundId: fund.id, date: navDate, nav },
    });

    // Update fund current NAV
    await prisma.fund.update({
      where: { code: fundCode },
      data: { previousNav: fund.currentNav, currentNav: nav },
    });

    // Update all holdings market value for this fund
    const holdings = await prisma.fundHolding.findMany({ where: { fundId: fund.id } });
    for (const h of holdings) {
      const currentUnits = Number(h.totalCurrentUnits);
      const newMarketValue = currentUnits * nav;
      const costValue = Number(h.totalCostValueCurrent);
      await prisma.fundHolding.update({
        where: { id: h.id },
        data: {
          nav,
          totalMarketValue: newMarketValue,
          totalUnrealizedGain: newMarketValue - costValue,
          lsMarketValue: Number(h.lsCurrentUnits) * nav,
          sipMarketValue: Number(h.sipCurrentUnits) * nav,
          marketValueSellable: Number(h.totalSellableUnits) * nav,
        },
      });
    }

    // Recalculate AUM
    const aum = await prisma.fundHolding.aggregate({
      where: { fundId: fund.id },
      _sum: { totalMarketValue: true },
    });
    await prisma.fund.update({
      where: { code: fundCode },
      data: { totalAum: aum._sum.totalMarketValue || 0 },
    });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: userId!,
      action: "NAV_UPDATE",
      entity: "NavRecord",
      newValue: JSON.stringify({ date, navValues }),
    },
  });

  return NextResponse.json({ success: true });
}
