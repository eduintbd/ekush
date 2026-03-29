"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, CheckCircle } from "lucide-react";

interface Fund { id: string; code: string; name: string; currentNav: number; }

export default function NavEntryPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [navValues, setNavValues] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/funds").then(r => r.json()).then((data: Fund[]) => {
      setFunds(data);
      const vals: Record<string, string> = {};
      data.forEach(f => { vals[f.code] = String(Number(f.currentNav)); });
      setNavValues(vals);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/nav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, navValues }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daily NAV Entry</h1>
        <p className="text-sm text-gray-500">Enter daily NAV values for each fund</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">NAV Update</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="NAV Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          {funds.map(f => (
            <div key={f.code} className="flex items-center gap-4">
              <div className="w-20">
                <Badge variant="outline">{f.code}</Badge>
              </div>
              <div className="flex-1">
                <Input
                  label={f.name}
                  type="number"
                  step="0.0001"
                  value={navValues[f.code] || ""}
                  onChange={(e) => setNavValues({ ...navValues, [f.code]: e.target.value })}
                  placeholder="Enter NAV"
                />
              </div>
              <div className="text-xs text-gray-400 w-24 text-right">
                Current: {Number(f.currentNav).toFixed(4)}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={loading} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save NAV
            </Button>
            {saved && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> NAV updated successfully!</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
