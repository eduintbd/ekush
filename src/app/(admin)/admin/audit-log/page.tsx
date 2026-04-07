import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Shield } from "lucide-react";

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { email: true, investor: { select: { name: true, investorCode: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani flex items-center gap-2"><Shield className="w-6 h-6" /> Audit Log</h1>
        <p className="text-[13px] text-text-body">Complete audit trail of all system actions</p>
      </div>

      <Card className="shadow-card rounded-[10px]">
        <CardHeader><CardTitle className="text-[16px] font-semibold font-rajdhani text-text-dark">Recent Activity ({logs.length} entries)</CardTitle></CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-text-body text-sm text-center py-8">No audit log entries yet. Actions will be recorded as users interact with the system.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-page-bg rounded-[10px]">
                  <div className="w-2 h-2 rounded-full bg-ekush-orange mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                      <Badge variant="default" className="text-[10px]">{log.entity}</Badge>
                      <span className="text-xs text-text-body">
                        {log.user.investor ? `${log.user.investor.name} (${log.user.investor.investorCode})` : log.user.email || "System"}
                      </span>
                    </div>
                    {log.entityId && <p className="text-xs text-text-muted mt-0.5">Entity ID: {log.entityId}</p>}
                    <p className="text-xs text-text-muted">{formatDate(log.createdAt)} {log.ipAddress && `| IP: ${log.ipAddress}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
