import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.sipPlan.findMany({
    where: { investorId },
    include: { fund: true, bankAccount: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;
  const userId = (session?.user as any)?.id;

  if (!investorId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fundCode, amount, frequency, debitDay, startDate } = body;

  if (!fundCode || !amount || amount <= 0) {
    return NextResponse.json({ error: "Fund and positive amount required" }, { status: 400 });
  }

  const fund = await prisma.fund.findUnique({ where: { code: fundCode } });
  if (!fund) {
    return NextResponse.json({ error: "Fund not found" }, { status: 404 });
  }

  const plan = await prisma.sipPlan.create({
    data: {
      investorId,
      fundId: fund.id,
      amount,
      frequency: frequency || "MONTHLY",
      debitDay: debitDay || 10,
      startDate: startDate ? new Date(startDate) : new Date(),
      status: "ACTIVE",
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "SIP",
      title: "SIP Plan Created",
      message: `Your SIP of BDT ${amount.toLocaleString("en-IN")} ${frequency || "MONTHLY"} in ${fundCode} has been activated.`,
      link: "/sip",
    },
  });

  return NextResponse.json({ id: plan.id, status: "ACTIVE", message: "SIP plan created successfully." });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, action, amount } = body;

  if (!id || !action) {
    return NextResponse.json({ error: "Plan ID and action required" }, { status: 400 });
  }

  const plan = await prisma.sipPlan.findFirst({ where: { id, investorId } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  if (action === "pause") {
    await prisma.sipPlan.update({ where: { id }, data: { status: "PAUSED" } });
  } else if (action === "resume") {
    await prisma.sipPlan.update({ where: { id }, data: { status: "ACTIVE" } });
  } else if (action === "cancel") {
    await prisma.sipPlan.update({ where: { id }, data: { status: "CANCELLED" } });
  } else if (action === "update_amount" && amount > 0) {
    await prisma.sipPlan.update({ where: { id }, data: { amount } });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
