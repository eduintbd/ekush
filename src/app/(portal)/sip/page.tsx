"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Pause, Play, X, Loader2, Calendar } from "lucide-react";

interface SipPlan {
  id: string;
  amount: number;
  frequency: string;
  debitDay: number;
  startDate: string;
  endDate: string | null;
  status: string;
  fund: { code: string; name: string; currentNav: number };
}

interface Fund { code: string; name: string; currentNav: number; }

export default function SipPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SipPlan[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fundCode: "", amount: "", frequency: "MONTHLY", debitDay: "10" });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPlans = () => fetch("/api/sip").then(r => r.json()).then(setPlans).catch(() => {});
  const fetchFunds = () => fetch("/api/funds").then(r => r.json()).then(setFunds).catch(() => {});

  useEffect(() => { fetchPlans(); fetchFunds(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), debitDay: parseInt(form.debitDay) }),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ fundCode: "", amount: "", frequency: "MONTHLY", debitDay: "10" });
        fetchPlans();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      await fetch("/api/sip", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      fetchPlans();
    } finally {
      setActionLoading(null);
    }
  };

  const statusVariant = (s: string) => {
    if (s === "ACTIVE") return "success" as const;
    if (s === "PAUSED") return "warning" as const;
    return "danger" as const;
  };

  const activePlans = plans.filter(p => p.status === "ACTIVE");
  const totalMonthly = activePlans.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SIP Management</h1>
          <p className="text-sm text-gray-500">Manage your Systematic Investment Plans</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
          <Plus className="w-4 h-4 mr-1" /> New SIP
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Active Plans</p>
            <p className="text-2xl font-bold text-green-600">{activePlans.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Monthly Investment</p>
            <p className="text-2xl font-bold">৳{totalMonthly.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Plans</p>
            <p className="text-2xl font-bold">{plans.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Create New SIP</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Fund</label>
                <select value={form.fundCode} onChange={(e) => setForm({ ...form, fundCode: e.target.value })} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm" required>
                  <option value="">Select fund...</option>
                  {funds.map(f => <option key={f.code} value={f.code}>{f.code} - {f.name}</option>)}
                </select>
              </div>
              <Input label="Amount (BDT)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="5000" min="500" required />
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Frequency</label>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
              </div>
              <Input label="Debit Day" type="number" value={form.debitDay} onChange={(e) => setForm({ ...form, debitDay: e.target.value })} min="1" max="28" />
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={loading} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  Create SIP
                </Button>
                <Button type="button" onClick={() => setShowCreate(false)} variant="outline">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your SIP Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">No SIP plans yet. Create one to start investing regularly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{plan.fund.code}</p>
                      <Badge variant={statusVariant(plan.status)}>{plan.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{plan.fund.name}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-600">
                      <span>৳{Number(plan.amount).toLocaleString("en-IN")} / {plan.frequency.toLowerCase()}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Day {plan.debitDay}</span>
                      <span>Since {new Date(plan.startDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.status === "ACTIVE" && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(plan.id, "pause")} disabled={actionLoading === plan.id}>
                        {actionLoading === plan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
                      </Button>
                    )}
                    {plan.status === "PAUSED" && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(plan.id, "resume")} disabled={actionLoading === plan.id}>
                        {actionLoading === plan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      </Button>
                    )}
                    {plan.status !== "CANCELLED" && (
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Cancel this SIP?")) handleAction(plan.id, "cancel"); }} disabled={actionLoading === plan.id}>
                        <X className="w-3 h-3" />
                      </Button>
                    )}
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
