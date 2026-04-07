import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatNumber, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";

const PAGE_SIZE = 50;

async function getTransactions(investorId: string, page: number) {
  return prisma.transaction.findMany({
    where: { investorId },
    include: { fund: { select: { code: true, name: true } } },
    orderBy: { orderDate: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return <p className="text-text-body text-center py-20">Investor profile not found.</p>;
  }

  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const transactions = await getTransactions(investorId, page);

  return (
    <div className="space-y-6">
      <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani">All Transactions</h1>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-4">
        <select className="h-[42px] px-4 bg-input-bg border border-input-border rounded-[5px] text-[13px] text-text-body min-w-[180px] focus:outline-none focus:border-ekush-orange">
          <option value="">Select a fund</option>
        </select>
        <select className="h-[42px] px-4 bg-input-bg border border-input-border rounded-[5px] text-[13px] text-text-body min-w-[180px] focus:outline-none focus:border-ekush-orange">
          <option value="">Select a year type</option>
          <option value="calendar">Calendar Year</option>
          <option value="fiscal">Fiscal Year</option>
        </select>
        <select className="h-[42px] px-4 bg-input-bg border border-input-border rounded-[5px] text-[13px] text-text-body min-w-[160px] focus:outline-none focus:border-ekush-orange">
          <option value="">Select a year</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
        <select className="h-[42px] px-4 bg-input-bg border border-input-border rounded-[5px] text-[13px] text-text-body min-w-[160px] focus:outline-none focus:border-ekush-orange">
          <option value="">Select txn type</option>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="text-text-body text-sm text-center py-8">No transactions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead>No.</TableHead>
                  <TableHead>Txn date</TableHead>
                  <TableHead>Txn ID</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Txn type</TableHead>
                  <TableHead className="text-right">No. of units</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Form</TableHead>
                  <TableHead className="text-center">Payment slip</TableHead>
                  <TableHead className="text-center">Ack slip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx, idx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-text-dark">{idx + 1}</TableCell>
                    <TableCell className="whitespace-nowrap text-text-dark">{formatDate(tx.orderDate)}</TableCell>
                    <TableCell className="font-mono text-[12px] text-text-body">{tx.id.slice(0, 16)}</TableCell>
                    <TableCell className="text-text-dark">{tx.fund.code}</TableCell>
                    <TableCell>
                      <span className={tx.direction === "SELL" ? "text-ekush-orange font-medium" : "text-text-dark font-medium"}>
                        {tx.direction === "BUY" ? "Buy" : "Sell"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-text-dark">
                      {formatNumber(Number(tx.units), 0)}
                    </TableCell>
                    <TableCell className="text-right text-text-dark">
                      {Number(tx.nav).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-text-dark">
                      {formatNumber(Number(tx.amount), 0)}
                    </TableCell>
                    <TableCell>
                      <span className={
                        tx.status === "EXECUTED" ? "text-green-600 text-[12px] font-medium" :
                        tx.status === "REJECTED" ? "text-red-500 text-[12px] font-medium" :
                        "text-[#E09079] text-[12px] font-medium"
                      }>
                        {tx.status === "EXECUTED" ? "Active" : tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Download className="w-4 h-4 text-ekush-orange mx-auto cursor-pointer hover:text-ekush-orange-dark" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Download className="w-4 h-4 text-ekush-orange mx-auto cursor-pointer hover:text-ekush-orange-dark" />
                    </TableCell>
                    <TableCell className="text-center">
                      {tx.status === "EXECUTED" && (
                        <Download className="w-4 h-4 text-ekush-orange mx-auto cursor-pointer hover:text-ekush-orange-dark" />
                      )}
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
