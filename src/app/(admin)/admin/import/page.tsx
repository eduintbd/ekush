"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Database, FileSpreadsheet, CheckCircle } from "lucide-react";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani">Data Import</h1>
        <p className="text-[13px] text-text-body">Import investor and financial data from Excel files</p>
      </div>

      {/* Last Import Info */}
      <Card className="shadow-card rounded-[10px] border-green-200 bg-green-50">
        <CardContent className="p-5 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800">Initial Data Import Complete</p>
            <p className="text-sm text-green-700 mt-1">
              Successfully imported investor data from the following Excel files:
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <FileSpreadsheet className="w-4 h-4" />
                <span>EFUF: 2026.03.25 INVESTORS.xlsx — 728 investors</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <FileSpreadsheet className="w-4 h-4" />
                <span>EGF: EGF_2026.03.25 INVESTORS.xlsx — 721 investors</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <FileSpreadsheet className="w-4 h-4" />
                <span>ESRF: ESRF_2026.03.25 INVESTORS - Copy.xlsx — 724 investors</span>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-green-600">
              <Badge variant="success">725 unique investors</Badge>
              <Badge variant="success">2,173 fund holdings</Badge>
              <Badge variant="success">3 funds</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card rounded-[10px] hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-page-bg rounded-[10px] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-ekush-orange" />
            </div>
            <h3 className="font-semibold text-text-dark font-rajdhani">Upload New Data</h3>
            <p className="text-[13px] text-text-body mt-1">
              Upload updated INVESTORS Excel files to refresh investor holdings and transaction data.
            </p>
            <p className="text-xs text-text-muted mt-3">
              Supported: .xlsx files from EFUF, EGF, ESRF
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card rounded-[10px] hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-page-bg rounded-[10px] flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-text-dark font-rajdhani">Re-run Seed</h3>
            <p className="text-[13px] text-text-body mt-1">
              Re-import all data from the original Excel files at C:\Repos\Ekush. Uses upsert to avoid duplicates.
            </p>
            <p className="text-xs text-text-muted mt-3">
              Run: npm run db:seed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Source Info */}
      <Card className="shadow-card rounded-[10px]">
        <CardHeader><CardTitle className="text-[16px] font-semibold font-rajdhani text-text-dark">Data Sources</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-text-body">
                <th className="pb-2 font-medium">Fund</th>
                <th className="pb-2 font-medium">Investors File</th>
                <th className="pb-2 font-medium">Financial File</th>
                <th className="pb-2 font-medium">Sheets</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: "EFUF", inv: "2026.03.25 INVESTORS.xlsx", fin: "2026.03.25 FIN STATS.xlsx", sheets: "INVESTORS, LS, SIP, Dividend & Tax" },
                { code: "EGF", inv: "EGF_2026.03.25 INVESTORS.xlsx", fin: "EGF_2026.03.25 FIN STATS.xlsx", sheets: "INVESTORS, LS, SIP, Dividend & Tax" },
                { code: "ESRF", inv: "ESRF_2026.03.25 INVESTORS - Copy.xlsx", fin: "ESRF_2026.03.25 FIN STATS - Copy.xlsx", sheets: "INVESTORS, LS, SIP, TAX CERTIFICATE" },
              ].map(f => (
                <tr key={f.code} className="border-b last:border-0">
                  <td className="py-2 font-medium text-text-dark">{f.code}</td>
                  <td className="py-2 text-xs text-text-body">{f.inv}</td>
                  <td className="py-2 text-xs text-text-body">{f.fin}</td>
                  <td className="py-2 text-xs text-text-body">{f.sheets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
