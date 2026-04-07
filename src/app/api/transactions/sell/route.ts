import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;
  const userId = (session?.user as any)?.id;

  if (!investorId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fundCode, units: requestedUnits, channel } = body;

  if (!fundCode || !requestedUnits || requestedUnits <= 0) {
    return NextResponse.json({ error: "Fund and positive units required" }, { status: 400 });
  }

  const fund = await prisma.fund.findUnique({ where: { code: fundCode } });
  if (!fund) {
    return NextResponse.json({ error: "Fund not found" }, { status: 404 });
  }

  // Check sellable units
  const holding = await prisma.fundHolding.findFirst({
    where: { investorId, fundId: fund.id },
  });

  if (!holding) {
    return NextResponse.json({ error: "No holdings in this fund" }, { status: 400 });
  }

  const sellableUnits = Number(holding.totalSellableUnits);
  if (requestedUnits > sellableUnits) {
    return NextResponse.json({
      error: `Insufficient sellable units. Available: ${sellableUnits.toFixed(4)}`,
    }, { status: 400 });
  }

  const nav = Number(fund.currentNav);
  const amount = requestedUnits * nav;
  const avgCost = Number(holding.avgCost);
  const costOfSold = requestedUnits * avgCost;
  const realizedGain = amount - costOfSold;

  const transaction = await prisma.transaction.create({
    data: {
      investorId,
      fundId: fund.id,
      channel: channel || "LS",
      direction: "SELL",
      amount,
      nav,
      units: requestedUnits,
      cumulativeUnits: 0,
      unitCapital: requestedUnits * 10,
      unitPremium: 0,
      avgCostAtTime: avgCost,
      realizedGain,
      costOfUnitsSold: costOfSold,
      orderDate: new Date(),
      status: "PENDING",
    },
  });

  // Create approval queue entry and notification in parallel
  await Promise.all([
    prisma.approvalQueue.create({
      data: {
        entityType: "TRANSACTION",
        entityId: transaction.id,
        makerId: userId,
        status: "PENDING",
        notes: `SELL ${fundCode} - ${requestedUnits.toFixed(4)} units @ NAV ${nav.toFixed(4)} = BDT ${amount.toFixed(2)}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: "TRANSACTION",
        title: "Sell Order Placed",
        message: `Your sell order for ${requestedUnits.toFixed(4)} units of ${fundCode} has been submitted and is pending approval.`,
        link: "/transactions",
      },
    }),
  ]);

  return NextResponse.json({
    id: transaction.id,
    status: "PENDING",
    fund: fundCode,
    units: requestedUnits,
    estimatedAmount: amount,
    nav,
    realizedGain,
    message: "Redemption order submitted. Pending approval.",
  });
}
