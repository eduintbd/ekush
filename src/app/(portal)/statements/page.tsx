import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatNumber, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DownloadPortfolioStatement, DownloadTaxCertificate } from "@/components/statements/pdf-buttons";
import { FileText, Shield, Receipt, Download } from "lucide-react";

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
    return <p className="text-gray-500 text-center py-20">Investor profile not found.</p>;
  }

  const [taxCerts, dividends, holdings] = await Promise.all([
    getTaxCertificates(investorId),
    getDividends(investorId),
    getHoldings(investorId),
  ]);

  // Calculate capital gains
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Statements & Reports</h1>
          <p className="text-sm text-gray-500">Download your financial statements and tax documents</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Portfolio Statement</p>
                <p className="text-xs text-gray-500">Current holdings summary with gain/loss</p>
              </div>
            </div>
            <DownloadPortfolioStatement />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Transaction Report</p>
                <p className="text-xs text-gray-500">Full transaction history export</p>
              </div>
            </div>
            <a href="/transactions" className="text-sm text-blue-600 hover:underline">
              View Transactions
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Dividend Statement</p>
                <p className="text-xs text-gray-500">Dividend payment history</p>
              </div>
            </div>
            <Badge variant="outline">{dividends.length} records</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Capital Gain/Loss Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capital Gain / Loss Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Fund</th>
                  <th className="pb-2 font-medium text-right">Cost Value</th>
                  <th className="pb-2 font-medium text-right">Market Value</th>
                  <th className="pb-2 font-medium text-right">Realized Gain</th>
                  <th className="pb-2 font-medium text-right">Unrealized Gain</th>
                  <th className="pb-2 font-medium text-right">Total Gain</th>
                </tr>
              </thead>
              <tbody>
                {capitalGains.map((cg) => (
                  <tr key={cg.fundCode} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{cg.fundCode}</td>
                    <td className="py-2.5 text-right">{formatBDT(cg.costValue)}</td>
                    <td className="py-2.5 text-right">{formatBDT(cg.marketValue)}</td>
                    <td className={`py-2.5 text-right ${cg.realizedGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatBDT(cg.realizedGain)}
                    </td>
                    <td className={`py-2.5 text-right ${cg.unrealizedGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatBDT(cg.unrealizedGain)}
                    </td>
                    <td className={`py-2.5 text-right font-semibold ${(cg.realizedGain + cg.unrealizedGain) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatBDT(cg.realizedGain + cg.unrealizedGain)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2.5">Total</td>
                  <td className="py-2.5 text-right">{formatBDT(capitalGains.reduce((s, h) => s + h.costValue, 0))}</td>
                  <td className="py-2.5 text-right">{formatBDT(capitalGains.reduce((s, h) => s + h.marketValue, 0))}</td>
                  <td className={`py-2.5 text-right ${totalRealized >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatBDT(totalRealized)}
                  </td>
                  <td className={`py-2.5 text-right ${totalUnrealized >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatBDT(totalUnrealized)}
                  </td>
                  <td className={`py-2.5 text-right ${(totalRealized + totalUnrealized) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatBDT(totalRealized + totalUnrealized)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Certificates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" /> Tax Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taxCerts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No tax certificates available.</p>
          ) : (
            <div className="space-y-3">
              {taxCerts.map((tc) => (
                <div key={tc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{tc.fund.code} - Tax Certificate</p>
                    <p className="text-xs text-gray-500">
                      Period: {tc.periodStart ? formatDate(tc.periodStart) : "N/A"} - {tc.periodEnd ? formatDate(tc.periodEnd) : "N/A"}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-600">
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
          <CardTitle className="text-base">Dividend History</CardTitle>
        </CardHeader>
        <CardContent>
          {dividends.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No dividend records available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Fund</th>
                    <th className="pb-2 font-medium">Year</th>
                    <th className="pb-2 font-medium text-right">Units</th>
                    <th className="pb-2 font-medium text-right">DPS</th>
                    <th className="pb-2 font-medium text-right">Gross</th>
                    <th className="pb-2 font-medium text-right">Tax</th>
                    <th className="pb-2 font-medium text-right">Net</th>
                    <th className="pb-2 font-medium">Option</th>
                  </tr>
                </thead>
                <tbody>
                  {dividends.map((d) => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="py-2.5">{d.fund.code}</td>
                      <td className="py-2.5">{d.accountingYear || "N/A"}</td>
                      <td className="py-2.5 text-right">{formatNumber(Number(d.totalUnits), 4)}</td>
                      <td className="py-2.5 text-right">{Number(d.dividendPerUnit).toFixed(4)}</td>
                      <td className="py-2.5 text-right">{formatBDT(Number(d.grossDividend))}</td>
                      <td className="py-2.5 text-right">{formatBDT(Number(d.taxAmount))}</td>
                      <td className="py-2.5 text-right font-medium">{formatBDT(Number(d.netDividend))}</td>
                      <td className="py-2.5">
                        <Badge variant={d.dividendOption === "CIP" ? "default" : "outline"}>
                          {d.dividendOption}
                        </Badge>
                      </td>
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
