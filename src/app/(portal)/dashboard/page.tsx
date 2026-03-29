import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatPercent, getGainColor } from "@/lib/utils";
import { FUND_NAMES, FUND_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { FundCard } from "@/components/dashboard/fund-card";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";

async function getPortfolioData(investorId: string) {
  const holdings = await prisma.fundHolding.findMany({
    where: { investorId },
    include: { fund: true },
  });

  let totalValue = 0;
  let totalCost = 0;

  const funds = holdings.map((h) => {
    const marketValue = Number(h.totalMarketValue);
    const costValue = Number(h.totalCostValueCurrent);
    const gain = marketValue - costValue;
    const gainPercent = costValue > 0 ? (gain / costValue) * 100 : 0;

    totalValue += marketValue;
    totalCost += costValue;

    return {
      fundCode: h.fund.code,
      fundName: h.fund.name,
      currentNav: Number(h.nav),
      totalUnits: Number(h.totalCurrentUnits),
      totalCost: costValue,
      marketValue,
      gain,
      gainPercent,
    };
  });

  // Calculate weights after totals
  const fundsWithWeight = funds.map((f) => ({
    ...f,
    weight: totalValue > 0 ? (f.marketValue / totalValue) * 100 : 0,
  }));

  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
    funds: fundsWithWeight,
  };
}

async function getRecentTransactions(investorId: string) {
  return prisma.transaction.findMany({
    where: { investorId },
    include: { fund: true },
    orderBy: { orderDate: "desc" },
    take: 5,
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Investor profile not found. Please contact support.</p>
      </div>
    );
  }

  const [portfolio, recentTx] = await Promise.all([
    getPortfolioData(investorId),
    getRecentTransactions(investorId),
  ]);

  const gainColor = portfolio.totalGain >= 0 ? "text-green-600" : "text-red-600";
  const GainIcon = portfolio.totalGain >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-[#6c757d]">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-[#333]">
                  {formatBDT(portfolio.totalValue)}
                </p>
              </div>
              <div className="w-10 h-10 bg-[#F27023]/10 rounded-[10px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#F27023]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-[#6c757d]">Total Investment</p>
                <p className="text-2xl font-bold text-[#333]">
                  {formatBDT(portfolio.totalCost)}
                </p>
              </div>
              <div className="w-10 h-10 bg-[#f8f9fa] rounded-[10px] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-[#6c757d]">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${gainColor}`}>
                  {formatBDT(portfolio.totalGain)}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${portfolio.totalGain >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                <GainIcon className={`w-5 h-5 ${gainColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-[#6c757d]">Return</p>
                <p className={`text-2xl font-bold ${gainColor}`}>
                  {formatPercent(portfolio.totalGainPercent)}
                </p>
              </div>
              <Badge variant={portfolio.totalGain >= 0 ? "success" : "danger"}>
                {portfolio.totalGain >= 0 ? "Profit" : "Loss"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioChart funds={portfolio.funds} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationChart funds={portfolio.funds} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fund Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Funds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portfolio.funds.map((fund) => (
            <FundCard key={fund.fundCode} fund={fund} />
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Link href="/transactions" className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {recentTx.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No transactions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Fund</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium text-right">Units</th>
                    <th className="pb-2 font-medium text-right">NAV</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-2.5">
                        {new Date(tx.orderDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-2.5">{tx.fund.code}</td>
                      <td className="py-2.5">
                        <Badge
                          variant={tx.direction === "BUY" ? "success" : "danger"}
                        >
                          {tx.direction} ({tx.channel})
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right">{formatBDT(Number(tx.amount))}</td>
                      <td className="py-2.5 text-right">
                        {Number(tx.units).toLocaleString("en-IN", { maximumFractionDigits: 4 })}
                      </td>
                      <td className="py-2.5 text-right">{Number(tx.nav).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
