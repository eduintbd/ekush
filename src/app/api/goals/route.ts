import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;
  if (!investorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.investmentGoal.findMany({
    where: { investorId },
    orderBy: { createdAt: "desc" },
  });

  // Get current total portfolio value for progress tracking
  const holdings = await prisma.fundHolding.findMany({
    where: { investorId },
    select: { totalMarketValue: true, totalCostValueCurrent: true },
  });

  const totalMarketValue = holdings.reduce((s, h) => s + Number(h.totalMarketValue), 0);
  const totalCostValue = holdings.reduce((s, h) => s + Number(h.totalCostValueCurrent), 0);

  return NextResponse.json({
    goals: goals.map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      lumpsumAmount: g.lumpsumAmount,
      monthlySip: g.monthlySip,
      expectedReturn: g.expectedReturn,
      timePeriodYears: g.timePeriodYears,
      deadline: g.deadline.toISOString(),
      status: g.status,
      createdAt: g.createdAt.toISOString(),
    })),
    portfolio: { totalMarketValue, totalCostValue },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;
  if (!investorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, targetAmount, lumpsumAmount, monthlySip, expectedReturn, timePeriodYears } = body;

  if (!name || !targetAmount || !timePeriodYears) {
    return NextResponse.json({ error: "Name, target amount, and time period are required" }, { status: 400 });
  }

  const deadline = new Date();
  deadline.setFullYear(deadline.getFullYear() + timePeriodYears);

  const goal = await prisma.investmentGoal.create({
    data: {
      investorId,
      name,
      targetAmount: Number(targetAmount),
      lumpsumAmount: Number(lumpsumAmount || 0),
      monthlySip: Number(monthlySip || 0),
      expectedReturn: Number(expectedReturn || 10),
      timePeriodYears: Number(timePeriodYears),
      deadline,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;
  if (!investorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Goal ID required" }, { status: 400 });

  // Verify ownership
  const goal = await prisma.investmentGoal.findFirst({ where: { id, investorId } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  await prisma.investmentGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
