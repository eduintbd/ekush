"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2, Clock, User } from "lucide-react";

interface Ticket {
  id: string;
  type: string;
  status: string;
  description: string | null;
  trackingNumber: string;
  slaDeadline: string | null;
  createdAt: string;
  investor: { name: string; investorCode: string };
  comments: { id: string; authorId: string; content: string; createdAt: string }[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const fetchTicket = () => {
    setLoading(true);
    fetch(`/api/support/tickets/${params.ticketId}`)
      .then(r => r.json())
      .then(data => { if (data.id) setTicket(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [params.ticketId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSendLoading(true);
    try {
      await fetch(`/api/support/tickets/${params.ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment.trim() }),
      });
      setComment("");
      fetchTicket();
    } finally {
      setSendLoading(false);
    }
  };

  const statusVariant = (s: string) => {
    if (s === "OPEN") return "warning" as const;
    if (s === "IN_PROGRESS") return "default" as const;
    if (s === "RESOLVED") return "success" as const;
    return "outline" as const;
  };

  if (loading && !ticket) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  if (!ticket) {
    return <p className="text-gray-500 text-center py-20">Ticket not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => router.push("/support")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Support
      </button>

      {/* Ticket Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
                <span className="text-lg font-bold">{ticket.type.replace(/_/g, " ")}</span>
              </div>
              <p className="text-sm text-gray-500">#{ticket.trackingNumber}</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Created: {new Date(ticket.createdAt).toLocaleString("en-GB")}</p>
              {ticket.slaDeadline && (
                <p className="flex items-center gap-1 justify-end mt-1">
                  <Clock className="w-3 h-3" /> SLA: {new Date(ticket.slaDeadline).toLocaleDateString("en-GB")}
                </p>
              )}
            </div>
          </div>
          {ticket.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{ticket.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Messages ({ticket.comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No messages yet. Start the conversation below.</p>
          ) : (
            <div className="space-y-3 mb-4">
              {ticket.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">{c.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString("en-GB")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply */}
          {ticket.status !== "CLOSED" && (
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button type="submit" disabled={!comment.trim() || sendLoading} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
                {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
