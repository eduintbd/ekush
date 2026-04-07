import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateXIRR, buildCashFlows } from "@/lib/xirr";

export async function GET() {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [transactions, holdings] = await Promise.all([
    prisma.transaction.findMany({
      where: { investorId, status: "EXECUTED" },
      include: { fund: true },
      orderBy: { orderDate: "asc" },
    }),
    prisma.fundHolding.findMany({
      where: { investorId },
      include: { fund: true },
    }),
  ]);

  // Overall XIRR
  const totalMarketValue = holdings.reduce((s, h) => s + Number(h.totalMarketValue), 0);
  const allFlows = buildCashFlows(
    transactions.map(t => ({
      orderDate: t.orderDate,
      direction: t.direction,
      amount: Number(t.amount),
    })),
    totalMarketValue
  );
  const overallXirr = calculateXIRR(allFlows);

  // Per-fund XIRR — build map once for O(1) lookups instead of O(n) filter per holding
  const txByFund = new Map<string, typeof transactions>();
  for (const tx of transactions) {
    if (!txByFund.has(tx.fundId)) txByFund.set(tx.fundId, []);
    txByFund.get(tx.fundId)!.push(tx);
  }

  const fundXirrs: Record<string, number | null> = {};
  for (const h of holdings) {
    const fundTx = txByFund.get(h.fundId) || [];
    const fundFlows = buildCashFlows(
      fundTx.map(t => ({
        orderDate: t.orderDate,
        direction: t.direction,
        amount: Number(t.amount),
      })),
      Number(h.totalMarketValue)
    );
    fundXirrs[h.fund.code] = calculateXIRR(fundFlows);
  }

  return NextResponse.json({
    overall: overallXirr,
    byFund: fundXirrs,
  });
}
