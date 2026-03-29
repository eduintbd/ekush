import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBDT } from "@/lib/utils";
import { Users, Briefcase, ArrowLeftRight, AlertCircle, TrendingUp, FileText, Bell, Clock } from "lucide-react";

export default async function AdminDashboard() {
  const [
    investorCount, fundCount, txCount, pendingApprovals,
    funds, recentUsers, openTickets, notificationCount,
    pendingKyc, activeInvestors
  ] = await Promise.all([
    prisma.investor.count(),
    prisma.fund.count(),
    prisma.transaction.count(),
    prisma.approvalQueue.count({ where: { status: "PENDING" } }),
    prisma.fund.findMany(),
    prisma.user.count({ where: { lastLoginAt: { not: null } } }),
    prisma.serviceRequest.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.notification.count(),
    prisma.kycRecord.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
  ]);

  const totalAum = funds.reduce((s, f) => s + Number(f.totalAum), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{investorCount}</p><p className="text-xs text-gray-500">Total Investors</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{formatBDT(totalAum)}</p><p className="text-xs text-gray-500">Total AUM</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center"><ArrowLeftRight className="w-5 h-5 text-violet-600" /></div>
            <div><p className="text-2xl font-bold">{txCount}</p><p className="text-xs text-gray-500">Transactions</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold">{pendingApprovals}</p><p className="text-xs text-gray-500">Pending Approvals</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Active Users</p><p className="text-lg font-bold">{activeInvestors}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Users Who Logged In</p><p className="text-lg font-bold">{recentUsers}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Open Tickets</p><p className="text-lg font-bold text-amber-600">{openTickets}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Pending KYC</p><p className="text-lg font-bold text-red-600">{pendingKyc}</p></CardContent></Card>
      </div>

      {/* Fund Summary */}
      <Card>
        <CardHeader><CardTitle className="text-base">Fund Overview</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Fund</th>
                <th className="pb-2 font-medium">Code</th>
                <th className="pb-2 font-medium text-right">Current NAV</th>
                <th className="pb-2 font-medium text-right">Total AUM</th>
                <th className="pb-2 font-medium text-right">Total Units</th>
                <th className="pb-2 font-medium text-right">Face Value</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((f) => (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{f.name}</td>
                  <td className="py-3">{f.code}</td>
                  <td className="py-3 text-right font-mono">{Number(f.currentNav).toFixed(4)}</td>
                  <td className="py-3 text-right">{formatBDT(Number(f.totalAum))}</td>
                  <td className="py-3 text-right">{Number(f.totalUnits).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                  <td className="py-3 text-right">৳{Number(f.faceValue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/admin/approvals" className="block"><Card className="hover:shadow-md transition-shadow"><CardContent className="p-4 flex items-center gap-3"><Clock className="w-5 h-5 text-amber-500" /><span className="text-sm font-medium">Approvals ({pendingApprovals})</span></CardContent></Card></a>
        <a href="/admin/tickets" className="block"><Card className="hover:shadow-md transition-shadow"><CardContent className="p-4 flex items-center gap-3"><FileText className="w-5 h-5 text-blue-500" /><span className="text-sm font-medium">Tickets ({openTickets})</span></CardContent></Card></a>
        <a href="/admin/content" className="block"><Card className="hover:shadow-md transition-shadow"><CardContent className="p-4 flex items-center gap-3"><Bell className="w-5 h-5 text-green-500" /><span className="text-sm font-medium">Content</span></CardContent></Card></a>
        <a href="/admin/audit-log" className="block"><Card className="hover:shadow-md transition-shadow"><CardContent className="p-4 flex items-center gap-3"><FileText className="w-5 h-5 text-gray-500" /><span className="text-sm font-medium">Audit Log</span></CardContent></Card></a>
      </div>
    </div>
  );
}
