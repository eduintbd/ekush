import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatNumber, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { ShoppingCart, ArrowDownCircle, Calculator } from "lucide-react";

async function getTransactions(investorId: string) {
  return prisma.transaction.findMany({
    where: { investorId },
    include: { fund: true },
    orderBy: { orderDate: "desc" },
  });
}

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return <p className="text-gray-500 text-center py-20">Investor profile not found.</p>;
  }

  const transactions = await getTransactions(investorId);

  const totalBuys = transactions.filter((t) => t.direction === "BUY");
  const totalSells = transactions.filter((t) => t.direction === "SELL");
  const pendingOrders = transactions.filter((t) => t.status === "PENDING" || t.status === "IN_PROCESS");
  const totalBuyAmount = totalBuys.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSellAmount = totalSells.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500">Place orders and view transaction history</p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions/buy">
            <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
              <ShoppingCart className="w-4 h-4 mr-1" /> Buy
            </Button>
          </Link>
          <Link href="/transactions/sell">
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              <ArrowDownCircle className="w-4 h-4 mr-1" /> Sell
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Transactions</p>
            <p className="text-xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Purchases</p>
            <p className="text-xl font-bold text-green-600">{totalBuys.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Invested</p>
            <p className="text-xl font-bold">{formatBDT(totalBuyAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Redeemed</p>
            <p className="text-xl font-bold">{formatBDT(totalSellAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Pending Orders</p>
            <p className="text-xl font-bold text-amber-600">{pendingOrders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-base text-amber-800">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingOrders.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={tx.direction === "BUY" ? "success" : "danger"}>{tx.direction}</Badge>
                    <div>
                      <p className="text-sm font-medium">{tx.fund.code} - {formatBDT(Number(tx.amount))}</p>
                      <p className="text-xs text-gray-500">{formatDate(tx.orderDate)} | {formatNumber(Number(tx.units), 4)} units @ {Number(tx.nav).toFixed(4)}</p>
                    </div>
                  </div>
                  <Badge variant="warning">{tx.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount (BDT)</TableHead>
                    <TableHead className="text-right">NAV</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(tx.orderDate)}</TableCell>
                      <TableCell>{tx.fund.code}</TableCell>
                      <TableCell><Badge variant={tx.channel === "SIP" ? "success" : "default"}>{tx.channel}</Badge></TableCell>
                      <TableCell><Badge variant={tx.direction === "BUY" ? "success" : "danger"}>{tx.direction}</Badge></TableCell>
                      <TableCell className="text-right">{formatBDT(Number(tx.amount))}</TableCell>
                      <TableCell className="text-right">{Number(tx.nav).toFixed(4)}</TableCell>
                      <TableCell className="text-right">{formatNumber(Number(tx.units), 4)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          tx.status === "EXECUTED" ? "success" :
                          tx.status === "REJECTED" ? "danger" :
                          "warning"
                        }>{tx.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
