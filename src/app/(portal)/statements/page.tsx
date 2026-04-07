import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatNumber, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { DownloadPortfolioStatement, DownloadTaxCertificate } from "@/components/statements/pdf-buttons";
import { Shield, Eye, Plus } from "lucide-react";

async function getTaxCertificates(investorId: string) {
  return prisma.taxCertificate.findMany({
    where: { investorId },
    include: { fund: true },
    orderBy: { periodEnd: "desc" },
  });
}

async function getDividends(investorId: string) {
  return prisma.dividend.findMany({
    where: { investorId },
    include: { fund: true },
    orderBy: { paymentDate: "desc" },
  });
}

async function getHoldings(investorId: string) {
  return prisma.fundHolding.findMany({
    where: { investorId },
    include: { fund: true },
  });
}

export default async function StatementsPage() {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return <p className="text-text-body text-center py-20">Investor profile not found.</p>;
  }

  const [taxCerts, dividends, holdings] = await Promise.all([
    getTaxCertificates(investorId),
    getDividends(investorId),
    getHoldings(investorId),
  ]);

  // Calculate totals and chart data
  let totalMarketValue = 0;
  const fundsForChart = holdings.map((h) => {
    const mv = Number(h.totalMarketValue);
    totalMarketValue += mv;
    return {
      fundCode: h.fund.code,
      fundName: h.fund.name,
      marketValue: mv,
      weight: 0,
    };
  });
  fundsForChart.forEach((f) => {
    f.weight = totalMarketValue > 0 ? (f.marketValue / totalMarketValue) * 100 : 0;
  });

  // Capital gains
  const capitalGains = holdings.map((h) => ({
    fundCode: h.fund.code,
    fundName: h.fund.name,
    realizedGain: Number(h.totalRealizedGain),
    unrealizedGain: Number(h.totalUnrealizedGain),
    costValue: Number(h.totalCostValueCurrent),
    marketValue: Number(h.totalMarketValue),
  }));
  const totalRealized = capitalGains.reduce((s, h) => s + h.realizedGain, 0);
  const totalUnrealized = capitalGains.reduce((s, h) => s + h.unrealizedGain, 0);

  return (
    <div className="space-y-8">
      {/* Charts Row — Fund Weight + Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px]">Fund weight</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart funds={fundsForChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[16px]">Portfolio Performance</CardTitle>
            <DownloadPortfolioStatement />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-text-body text-sm">
              {/* Performance chart placeholder — uses NAV history data */}
              <p>Performance chart based on NAV history</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Table */}
      <Card>
        <CardContent className="p-0 pt-5">
          <div className="px-6 pb-4">
            <h3 className="text-[16px] font-semibold text-text-dark font-rajdhani">Portfolio</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead>Investments</TableHead>
                <TableHead className="text-right">Mkt Value</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium text-text-dark">{h.fund.name}</TableCell>
                  <TableCell className="text-right font-medium text-text-dark">
                    {formatNumber(Number(h.totalMarketValue), 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Plus className="w-4 h-4 text-text-body cursor-pointer hover:text-ekush-orange" />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-page-bg">
                <TableCell className="font-semibold text-text-dark">Total</TableCell>
                <TableCell className="text-right font-semibold text-text-dark">
                  {formatNumber(totalMarketValue, 0)}
                </TableCell>
                <TableCell className="text-center">
                  <Plus className="w-4 h-4 text-text-body cursor-pointer hover:text-ekush-orange" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Capital Gain/Loss Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[16px]">Capital Gain / Loss Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead>Fund</TableHead>
                <TableHead className="text-right">Cost Value</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
                <TableHead className="text-right">Realized Gain</TableHead>
                <TableHead className="text-right">Unrealized Gain</TableHead>
                <TableHead className="text-right">Total Gain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capitalGains.map((cg) => (
                <TableRow key={cg.fundCode}>
                  <TableCell className="font-medium text-text-dark">{cg.fundCode}</TableCell>
                  <TableCell className="text-right">{formatBDT(cg.costValue)}</TableCell>
                  <TableCell className="text-right">{formatBDT(cg.marketValue)}</TableCell>
                  <TableCell className={`text-right ${cg.realizedGain >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatBDT(cg.realizedGain)}
                  </TableCell>
                  <TableCell className={`text-right ${cg.unrealizedGain >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatBDT(cg.unrealizedGain)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${(cg.realizedGain + cg.unrealizedGain) >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatBDT(cg.realizedGain + cg.unrealizedGain)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-page-bg">
                <TableCell className="font-semibold text-text-dark">Total</TableCell>
                <TableCell className="text-right font-semibold">{formatBDT(capitalGains.reduce((s, h) => s + h.costValue, 0))}</TableCell>
                <TableCell className="text-right font-semibold">{formatBDT(capitalGains.reduce((s, h) => s + h.marketValue, 0))}</TableCell>
                <TableCell className={`text-right font-semibold ${totalRealized >= 0 ? "text-green-500" : "text-red-500"}`}>{formatBDT(totalRealized)}</TableCell>
                <TableCell className={`text-right font-semibold ${totalUnrealized >= 0 ? "text-green-500" : "text-red-500"}`}>{formatBDT(totalUnrealized)}</TableCell>
                <TableCell className={`text-right font-semibold ${(totalRealized + totalUnrealized) >= 0 ? "text-green-500" : "text-red-500"}`}>{formatBDT(totalRealized + totalUnrealized)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[16px] flex items-center gap-2">
            <Shield className="w-4 h-4" /> Tax Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taxCerts.length === 0 ? (
            <p className="text-text-body text-sm text-center py-6">No tax certificates available.</p>
          ) : (
            <div className="space-y-3">
              {taxCerts.map((tc) => (
                <div key={tc.id} className="flex items-center justify-between p-4 bg-page-bg rounded-[10px]">
                  <div>
                    <p className="font-medium text-text-dark">{tc.fund.code} - Tax Certificate</p>
                    <p className="text-xs text-text-body mt-1">
                      Period: {tc.periodStart ? formatDate(tc.periodStart) : "N/A"} - {tc.periodEnd ? formatDate(tc.periodEnd) : "N/A"}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs text-text-body">
                      <span>Realized Gain: {formatBDT(Number(tc.totalRealizedGain))}</span>
                      <span>Tax: {formatBDT(Number(tc.totalTax))}</span>
                      <span>Net Dividend: {formatBDT(Number(tc.totalNetDividend))}</span>
                    </div>
                  </div>
                  <DownloadTaxCertificate certId={tc.id} fundCode={tc.fund.code} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dividends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[16px]">Dividend History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dividends.length === 0 ? (
            <p className="text-text-body text-sm text-center py-6">No dividend records available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead>Fund</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">DPS</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Option</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividends.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-text-dark">{d.fund.code}</TableCell>
                    <TableCell>{d.accountingYear || "N/A"}</TableCell>
                    <TableCell className="text-right">{formatNumber(Number(d.totalUnits), 4)}</TableCell>
                    <TableCell className="text-right">{Number(d.dividendPerUnit).toFixed(4)}</TableCell>
                    <TableCell className="text-right">{formatBDT(Number(d.grossDividend))}</TableCell>
                    <TableCell className="text-right">{formatBDT(Number(d.taxAmount))}</TableCell>
                    <TableCell className="text-right font-medium text-text-dark">{formatBDT(Number(d.netDividend))}</TableCell>
                    <TableCell>
                      <Badge variant={d.dividendOption === "CIP" ? "default" : "outline"}>
                        {d.dividendOption}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
