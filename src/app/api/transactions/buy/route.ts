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
  const { fundCode, amount, channel } = body;

  if (!fundCode || !amount || amount <= 0) {
    return NextResponse.json({ error: "Fund and positive amount required" }, { status: 400 });
  }

  const fund = await prisma.fund.findUnique({ where: { code: fundCode } });
  if (!fund) {
    return NextResponse.json({ error: "Fund not found" }, { status: 404 });
  }

  const nav = Number(fund.currentNav);
  if (nav <= 0) {
    return NextResponse.json({ error: "NAV not available" }, { status: 400 });
  }

  const units = amount / nav;
  const unitCapital = units * 10; // face value
  const unitPremium = amount - unitCapital;

  // Create pending transaction
  const transaction = await prisma.transaction.create({
    data: {
      investorId,
      fundId: fund.id,
      channel: channel || "LS",
      direction: "BUY",
      amount,
      nav,
      units,
      cumulativeUnits: 0, // will be updated on execution
      unitCapital,
      unitPremium,
      avgCostAtTime: nav,
      realizedGain: 0,
      costOfUnitsSold: 0,
      orderDate: new Date(),
      status: "PENDING",
    },
  });

  // Create approval queue entry (maker-checker)
  await prisma.approvalQueue.create({
    data: {
      entityType: "TRANSACTION",
      entityId: transaction.id,
      makerId: userId,
      status: "PENDING",
      notes: `BUY ${fundCode} - BDT ${amount.toLocaleString("en-IN")} (${units.toFixed(4)} units @ NAV ${nav.toFixed(4)})`,
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: "TRANSACTION",
      title: "Buy Order Placed",
      message: `Your buy order for ${fundCode} of BDT ${amount.toLocaleString("en-IN")} has been submitted and is pending approval.`,
      link: "/transactions",
    },
  });

  return NextResponse.json({
    id: transaction.id,
    status: "PENDING",
    fund: fundCode,
    amount,
    estimatedUnits: units,
    nav,
    message: "Order submitted successfully. Pending approval.",
  });
}
