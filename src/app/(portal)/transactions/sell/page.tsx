"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface Holding {
  fund: { code: string; name: string; currentNav: number };
  totalSellableUnits: number;
  totalCurrentUnits: number;
  avgCost: number;
  totalMarketValue: number;
}

export default function SellPage() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedFund, setSelectedFund] = useState("");
  const [units, setUnits] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/portfolio").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setHoldings(data);
    }).catch(() => {});
  }, []);

  const holding = holdings.find(h => h.fund.code === selectedFund);
  const sellable = Number(holding?.totalSellableUnits || 0);
  const nav = Number(holding?.fund.currentNav || 0);
  const avgCost = Number(holding?.avgCost || 0);
  const unitsNum = parseFloat(units) || 0;
  const estimatedAmount = unitsNum * nav;
  const estimatedGain = unitsNum * (nav - avgCost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund || unitsNum <= 0) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/transactions/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fundCode: selectedFund, units: unitsNum }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Order failed");
      else setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sell / Redeem Units</h1>
        <p className="text-sm text-gray-500">Place a redemption order for your fund holdings</p>
      </div>

      {result ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-800">Redemption Submitted!</h3>
            <p className="text-sm text-green-700 mt-2">{result.message}</p>
            <div className="mt-4 space-y-1 text-sm text-green-800">
              <p>Fund: <strong>{result.fund}</strong></p>
              <p>Units: <strong>{result.units?.toFixed(4)}</strong></p>
              <p>Est. Amount: <strong>৳{result.estimatedAmount?.toFixed(2)}</strong></p>
              <p>Realized Gain: <strong className={result.realizedGain >= 0 ? "text-green-700" : "text-red-600"}>৳{result.realizedGain?.toFixed(2)}</strong></p>
              <Badge variant="warning" className="mt-2">Pending Approval</Badge>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={() => { setResult(null); setUnits(""); }} variant="outline">Place Another</Button>
              <Button onClick={() => router.push("/transactions")} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">View Orders</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5" /> Redemption Order
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
                  onChange={(e) => { setSelectedFund(e.target.value); setUnits(""); }}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a fund...</option>
                  {holdings.map(h => (
                    <option key={h.fund.code} value={h.fund.code}>
                      {h.fund.code} - Sellable: {Number(h.totalSellableUnits).toFixed(4)} units
                    </option>
                  ))}
                </select>
              </div>

              {holding && (
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Current Units</div>
                  <div className="text-right font-medium">{Number(holding.totalCurrentUnits).toFixed(4)}</div>
                  <div className="text-gray-500">Sellable Units</div>
                  <div className="text-right font-medium text-green-600">{sellable.toFixed(4)}</div>
                  <div className="text-gray-500">Current NAV</div>
                  <div className="text-right font-medium">{nav.toFixed(4)}</div>
                  <div className="text-gray-500">Avg Cost</div>
                  <div className="text-right font-medium">{avgCost.toFixed(4)}</div>
                </div>
              )}

              <div>
                <Input
                  label="Units to Redeem"
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder="Enter number of units"
                  min="0.0001"
                  step="0.0001"
                  max={sellable}
                  required
                />
                {sellable > 0 && (
                  <button type="button" onClick={() => setUnits(sellable.toFixed(4))} className="text-xs text-blue-600 hover:underline mt-1">
                    Redeem all ({sellable.toFixed(4)} units)
                  </button>
                )}
              </div>

              {unitsNum > 0 && nav > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-800">Redemption Estimate</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Est. Amount</div>
                    <div className="text-right font-medium">৳{estimatedAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
                    <div className="text-gray-600">Est. Gain/Loss</div>
                    <div className={`text-right font-medium ${estimatedGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ৳{estimatedGain.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading || !selectedFund || unitsNum <= 0 || unitsNum > sellable} className="w-full bg-red-600 hover:bg-red-700 text-white h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowDownCircle className="w-4 h-4 mr-2" />}
                Place Sell Order
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
