"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Phone, Mail, HelpCircle, Plus, Loader2, Clock, CheckCircle } from "lucide-react";

const REQUEST_TYPES = [
  { value: "BANK_CHANGE", label: "Change of Bank Account" },
  { value: "ADDRESS_CHANGE", label: "Change of Address" },
  { value: "PHONE_CHANGE", label: "Change of Phone Number" },
  { value: "EMAIL_CHANGE", label: "Change of Email" },
  { value: "NOMINEE_CHANGE", label: "Nominee Change" },
  { value: "NAME_CORRECTION", label: "Name Correction" },
  { value: "UNIT_CERT_REISSUE", label: "Reissue Unit Certificate" },
  { value: "GO_ELECTRONIC", label: "Switch to Electronic Communication" },
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
  { value: "COMPLAINT", label: "Complaint" },
];

interface Ticket {
  id: string;
  type: string;
  status: string;
  description: string | null;
  trackingNumber: string;
  slaDeadline: string | null;
  createdAt: string;
  comments: { id: string; content: string; createdAt: string }[];
}

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchTickets = () => {
    setFetchLoading(true);
    fetch("/api/support/tickets")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTickets(data); })
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type) return;
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ type: "", description: "" });
        fetchTickets();
      }
    } finally {
      setLoading(false);
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "OPEN": return "warning" as const;
      case "IN_PROGRESS": return "default" as const;
      case "RESOLVED": return "success" as const;
      case "CLOSED": return "outline" as const;
      default: return "outline" as const;
    }
  };

  const openTickets = tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani">Support Center</h1>
          <p className="text-sm text-text-body">Submit requests and track their progress</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-ekush-orange hover:bg-ekush-orange/90 text-white rounded-[5px] text-[13px]">
          <Plus className="w-4 h-4 mr-1" /> New Request
        </Button>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[10px] shadow-card"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-ekush-orange/10 rounded-[10px] flex items-center justify-center"><Phone className="w-5 h-5 text-ekush-orange" /></div>
          <div><p className="font-medium text-sm text-text-dark">Call Us</p><p className="text-xs text-text-body">+880-XXX-XXXXXXX</p></div>
        </CardContent></Card>
        <Card className="rounded-[10px] shadow-card"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-[10px] flex items-center justify-center"><Mail className="w-5 h-5 text-green-600" /></div>
          <div><p className="font-medium text-sm text-text-dark">Email</p><p className="text-xs text-text-body">support@ekushwml.com</p></div>
        </CardContent></Card>
        <Card className="rounded-[10px] shadow-card"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-navy/10 rounded-[10px] flex items-center justify-center"><MessageSquare className="w-5 h-5 text-navy" /></div>
          <div><p className="font-medium text-sm text-text-dark">Live Chat</p><p className="text-xs text-text-body">Coming soon</p></div>
        </CardContent></Card>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-ekush-orange/30 rounded-[10px] shadow-card">
          <CardHeader><CardTitle className="text-[16px] font-semibold text-text-dark">New Service Request</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-label block mb-1">Request Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-[50px] rounded-[5px] border border-input-border bg-input-bg px-3 text-sm" required>
                  <option value="">Select type...</option>
                  {REQUEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-label block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-[5px] border border-input-border bg-input-bg px-3 py-2 text-sm min-h-[80px]" placeholder="Provide details about your request..." />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !form.type} className="bg-ekush-orange hover:bg-ekush-orange/90 text-white rounded-[5px] text-[13px]">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  Submit Request
                </Button>
                <Button type="button" onClick={() => setShowCreate(false)} variant="outline" className="rounded-[5px] text-[13px]">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-[10px] shadow-card"><CardContent className="p-4">
          <p className="text-xs text-text-body">Open Requests</p>
          <p className="text-xl font-bold text-amber-600 font-rajdhani">{openTickets.length}</p>
        </CardContent></Card>
        <Card className="rounded-[10px] shadow-card"><CardContent className="p-4">
          <p className="text-xs text-text-body">Total Requests</p>
          <p className="text-xl font-bold text-text-dark font-rajdhani">{tickets.length}</p>
        </CardContent></Card>
        <Card className="rounded-[10px] shadow-card"><CardContent className="p-4">
          <p className="text-xs text-text-body">Resolved</p>
          <p className="text-xl font-bold text-green-600 font-rajdhani">{tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length}</p>
        </CardContent></Card>
      </div>

      {/* Tickets */}
      <Card className="rounded-[10px] shadow-card">
        <CardHeader><CardTitle className="text-[16px] font-semibold text-text-dark">Your Service Requests</CardTitle></CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-text-muted" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-body text-sm">No service requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 bg-page-bg rounded-[10px] hover:bg-page-bg/80 transition-colors cursor-pointer" onClick={() => router.push(`/support/${ticket.id}`)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
                        <span className="text-sm font-medium text-text-dark">{ticket.type.replace(/_/g, " ")}</span>
                      </div>
                      <p className="text-xs text-text-body">#{ticket.trackingNumber} | Created: {new Date(ticket.createdAt).toLocaleDateString("en-GB")}</p>
                      {ticket.description && <p className="text-xs text-text-body mt-1 line-clamp-1">{ticket.description}</p>}
                    </div>
                    <div className="text-right text-xs text-text-muted">
                      {ticket.slaDeadline && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          SLA: {new Date(ticket.slaDeadline).toLocaleDateString("en-GB")}
                        </div>
                      )}
                      {ticket.comments.length > 0 && <p>{ticket.comments.length} message{ticket.comments.length > 1 ? "s" : ""}</p>}
                    </div>
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
