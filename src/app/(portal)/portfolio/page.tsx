import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatNumber, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

async function getHoldings(investorId: string) {
  return prisma.fundHolding.findMany({
    where: { investorId },
    include: { fund: true },
  });
}

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return <p className="text-text-body text-center py-20">Investor profile not found.</p>;
  }

  const holdings = await getHoldings(investorId);

  if (holdings.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-body">No fund holdings found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani">Portfolio</h1>

      {holdings.map((h) => {
        const marketValue = Number(h.totalMarketValue);
        const costValue = Number(h.totalCostValueCurrent);
        const gain = marketValue - costValue;
        const gainPct = costValue > 0 ? (gain / costValue) * 100 : 0;
        const isPositive = gain >= 0;

        return (
          <Card key={h.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-[16px]">{h.fund.name}</CardTitle>
                <p className="text-[13px] text-text-body">{h.fund.code}</p>
              </div>
              <Link
                href={`/portfolio/${h.fund.code}`}
                className="text-ekush-orange hover:underline flex items-center gap-1 text-[13px]"
              >
                Details <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {/* Summary Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-5 bg-page-bg rounded-[10px]">
                <div>
                  <p className="text-[12px] text-text-body">Current Units</p>
                  <p className="font-semibold text-text-dark font-rajdhani text-[18px]">{formatNumber(Number(h.totalCurrentUnits), 4)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-text-body">Avg Cost</p>
                  <p className="font-semibold text-text-dark font-rajdhani text-[18px]">{Number(h.avgCost).toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-text-body">NAV</p>
                  <p className="font-semibold text-text-dark font-rajdhani text-[18px]">{Number(h.nav).toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-text-body">Market Value</p>
                  <p className="font-semibold text-text-dark font-rajdhani text-[18px]">{formatBDT(marketValue)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-text-body">Gain/Loss</p>
                  <p className={`font-semibold font-rajdhani text-[18px] ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {formatBDT(gain)} ({formatPercent(gainPct)})
                  </p>
                </div>
              </div>

              {/* LS vs SIP Breakdown */}
              <Table>
                <TableHeader>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Units Bought</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Current Units</TableHead>
                    <TableHead className="text-right">Cost Value</TableHead>
                    <TableHead className="text-right">Market Value</TableHead>
                    <TableHead className="text-right">Realized Gain</TableHead>
                    <TableHead className="text-right">Avg Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Badge variant="default">Lump Sum</Badge></TableCell>
                    <TableCell className="text-right">{formatNumber(Number(h.lsUnitsBought), 4)}</TableCell>
                    <TableCell className="text-right">{formatNumber(Number(h.lsUnitsSold), 4)}</TableCell>
                    <TableCell className="text-right">{formatNumber(Number(h.lsCurrentUnits), 4)}</TableCell>
                    <TableCell className="text-right">{formatBDT(Number(h.lsCostValueCurrent))}</TableCell>
                    <TableCell className="text-right">{formatBDT(Number(h.lsMarketValue))}</TableCell>
                    <TableCell className="text-right">{formatBDT(Number(h.lsRealizedGain))}</TableCell>
                    <TableCell className="text-right">{Number(h.lsAvgCost).toFixed(4)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="success">SIP</Badge></TableCell>
                    <TableCell className="text-right">{formatNumber(Number(h.sipUnitsBought), 4)}</TableCell>
                    <TableCell className="text-right">{formatNumber(Number(h.sipUnitsSold), 4)}</TableCell>
                    <TableCell className="text-right">{formatNumber(Number(h.sipCurrentUnits), 4)}</TableCell>
                    <TableCell className="text-right">{formatBDT(Number(h.sipCostValueCurrent))}</TableCell>
                    <TableCell className="text-right">{formatBDT(Number(h.sipMarketValue))}</TableCell>
                    <TableCell className="text-right">{formatBDT(Number(h.sipRealizedGain))}</TableCell>
                    <TableCell className="text-right">{Number(h.sipAvgCost).toFixed(4)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-5 bg-page-bg rounded-[10px] text-[13px]">
                <div>
                  <p className="text-text-body">Sellable Units</p>
                  <p className="font-medium text-text-dark">{formatNumber(Number(h.totalSellableUnits), 4)}</p>
                </div>
                <div>
                  <p className="text-text-body">Realized Gain</p>
                  <p className="font-medium text-text-dark">{formatBDT(Number(h.totalRealizedGain))}</p>
                </div>
                <div>
                  <p className="text-text-body">Unrealized Gain</p>
                  <p className={`font-medium ${Number(h.totalUnrealizedGain) >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatBDT(Number(h.totalUnrealizedGain))}
                  </p>
                </div>
                <div>
                  <p className="text-text-body">Weight in Fund</p>
                  <p className="font-medium text-text-dark">{Number(h.percentUnitsHold).toFixed(4)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
