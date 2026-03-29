import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatBDT, formatPercent, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FundCardProps {
  fund: {
    fundCode: string;
    fundName: string;
    currentNav: number;
    totalUnits: number;
    totalCost: number;
    marketValue: number;
    gain: number;
    gainPercent: number;
  };
}

export function FundCard({ fund }: FundCardProps) {
  const isPositive = fund.gain >= 0;

  return (
    <Link href={`/portfolio/${fund.fundCode}`}>
      <Card className="hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[1px] uppercase text-[#F27023] bg-[#F27023]/10 px-2.5 py-0.5 rounded-full inline-block">
                {fund.fundCode}
              </p>
              <p className="text-[12px] text-[#6c757d] mt-1">{fund.fundName}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#999]">NAV</p>
              <p className="text-[18px] font-bold text-[#333]">{fund.currentNav.toFixed(4)}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6c757d]">Units</span>
              <span className="font-medium text-[#333]">{formatNumber(fund.totalUnits, 4)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6c757d]">Market Value</span>
              <span className="font-medium text-[#333]">{formatBDT(fund.marketValue)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6c757d]">Cost Value</span>
              <span className="font-medium text-[#333]">{formatBDT(fund.totalCost)}</span>
            </div>
            <div className="flex justify-between text-[13px] pt-2.5 border-t border-[#e8ecef]">
              <span className="text-[#6c757d]">Gain/Loss</span>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
                  {formatBDT(fund.gain)} ({formatPercent(fund.gainPercent)})
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
