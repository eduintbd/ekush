import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INVESTOR_TYPE_LABELS } from "@/lib/constants";
import Link from "next/link";

export default async function AdminInvestorsPage() {
  const investors = await prisma.investor.findMany({
    include: {
      user: { select: { status: true, email: true, phone: true } },
      holdings: { include: { fund: true } },
    },
    orderBy: { investorCode: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Investors</h1>
          <p className="text-sm text-gray-500">{investors.length} total investors</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Funds</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investors.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">{inv.investorCode}</TableCell>
                    <TableCell className="font-medium">{inv.name}</TableCell>
                    <TableCell className="text-sm">
                      {INVESTOR_TYPE_LABELS[inv.investorType] || inv.investorType}
                    </TableCell>
                    <TableCell>
                      <Badge variant={inv.user.status === "ACTIVE" ? "success" : "warning"}>
                        {inv.user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {inv.holdings.map((h) => (
                          <Badge key={h.id} variant="outline" className="text-[10px]">
                            {h.fund.code}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {inv.user.email || inv.user.phone || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/investors/${inv.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
