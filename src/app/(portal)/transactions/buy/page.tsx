"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface Fund { code: string; name: string; currentNav: number; }

export default function BuyPage() {
  const router = useRouter();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedFund, setSelectedFund] = useState("");
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState("LS");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/funds").then(r => r.json()).then(setFunds).catch(() => {});
  }, []);

  const fund = funds.find(f => f.code === selectedFund);
  const nav = fund?.currentNav || 0;
  const amountNum = parseFloat(amount) || 0;
  const estimatedUnits = nav > 0 ? amountNum / nav : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund || amountNum <= 0) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/transactions/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fundCode: selectedFund, amount: amountNum, channel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Buy / Purchase Units</h1>
        <p className="text-sm text-gray-500">Place a purchase order for Ekush mutual funds</p>
      </div>

      {result ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-800">Order Submitted!</h3>
            <p className="text-sm text-green-700 mt-2">{result.message}</p>
            <div className="mt-4 space-y-1 text-sm text-green-800">
              <p>Fund: <strong>{result.fund}</strong></p>
              <p>Amount: <strong>৳{result.amount?.toLocaleString("en-IN")}</strong></p>
              <p>Est. Units: <strong>{result.estimatedUnits?.toFixed(4)}</strong></p>
              <p>NAV: <strong>{result.nav?.toFixed(4)}</strong></p>
              <Badge variant="warning" className="mt-2">Pending Approval</Badge>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={() => { setResult(null); setAmount(""); }} variant="outline">Place Another Order</Button>
              <Button onClick={() => router.push("/transactions")} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">View Orders</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Purchase Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Select Fund</label>
                <select
                  value={selectedFund}
                  onChange={(e) => setSelectedFund(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a fund...</option>
                  {funds.map(f => (
                    <option key={f.code} value={f.code}>{f.code} - {f.name} (NAV: {Number(f.currentNav).toFixed(4)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Investment Channel</label>
                <div className="flex gap-3">
                  {["LS", "SIP"].map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        channel === ch
                          ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {ch === "LS" ? "Lump Sum" : "SIP"}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Investment Amount (BDT)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                required
              />

              {/* Estimation Panel */}
              {amountNum > 0 && nav > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-800">Order Estimate</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Current NAV</div>
                    <div className="text-right font-medium">{nav.toFixed(4)}</div>
                    <div className="text-gray-600">Est. Units</div>
                    <div className="text-right font-medium">{estimatedUnits.toFixed(4)}</div>
                    <div className="text-gray-600">Unit Capital</div>
                    <div className="text-right font-medium">৳{(estimatedUnits * 10).toFixed(2)}</div>
                    <div className="text-gray-600">Unit Premium</div>
                    <div className="text-right font-medium">৳{(amountNum - estimatedUnits * 10).toFixed(2)}</div>
                  </div>
                </div>
              )}

              {/* Cut-off Warning */}
              <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-lg text-xs text-amber-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Cut-off Time Notice</p>
                  <p>Orders placed before 2:00 PM will be processed at today&apos;s NAV. Orders after 2:00 PM will use the next business day&apos;s NAV.</p>
                </div>
              </div>

              <Button type="submit" disabled={loading || !selectedFund || amountNum <= 0} className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                Place Buy Order
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
