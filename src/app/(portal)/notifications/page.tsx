import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BellOff } from "lucide-react";
import { MarkAllReadButton, MarkReadButton } from "@/components/notifications/notification-actions";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return <p className="text-text-body text-center py-20">Please log in.</p>;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani">Notifications</h1>
          <p className="text-sm text-text-body">{unread} unread notification{unread !== 1 ? "s" : ""}</p>
        </div>
        {unread > 0 && <MarkAllReadButton />}
      </div>

      <Card className="rounded-[10px] shadow-card">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <BellOff className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-body text-sm">No notifications yet.</p>
              <p className="text-text-muted text-xs mt-1">
                You&apos;ll receive notifications about transactions, KYC updates, and important events.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 flex items-start gap-3 ${!n.isRead ? "bg-ekush-orange/5" : ""}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? "bg-ekush-orange" : "bg-text-muted"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-text-dark">{n.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                        {!n.isRead && <MarkReadButton id={n.id} />}
                      </div>
                    </div>
                    <p className="text-xs text-text-body mt-0.5">{n.message}</p>
                    <p className="text-xs text-text-muted mt-1">{formatDate(n.createdAt)}</p>
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
