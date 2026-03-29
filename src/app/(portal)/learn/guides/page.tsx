import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp, Shield, BarChart3, RefreshCw, PiggyBank } from "lucide-react";

const GUIDES = [
  {
    title: "What is a Mutual Fund?",
    icon: PiggyBank,
    color: "bg-blue-50 text-blue-600",
    content: "A mutual fund pools money from many investors to invest in a diversified portfolio of securities like stocks, bonds, and other instruments. It is managed by professional fund managers who make investment decisions on behalf of the investors. In Bangladesh, mutual funds are regulated by the Bangladesh Securities and Exchange Commission (BSEC)."
  },
  {
    title: "Understanding NAV",
    icon: TrendingUp,
    color: "bg-green-50 text-green-600",
    content: "Net Asset Value (NAV) represents the per-unit market value of a mutual fund. It is calculated by dividing the total value of all assets minus liabilities by the number of outstanding units. NAV changes daily based on market movements. When you buy units, you pay the current NAV; when you sell, you receive the current NAV."
  },
  {
    title: "Lump Sum vs SIP",
    icon: RefreshCw,
    color: "bg-violet-50 text-violet-600",
    content: "Lump Sum investment means investing a large amount at once, which works well when markets are low. Systematic Investment Plan (SIP) involves investing a fixed amount at regular intervals (monthly/quarterly), which benefits from rupee-cost averaging — you buy more units when prices are low and fewer when prices are high. SIP is ideal for building wealth over time."
  },
  {
    title: "Risk and Returns",
    icon: BarChart3,
    color: "bg-amber-50 text-amber-600",
    content: "Higher potential returns typically come with higher risk. Equity-focused funds like EGF may provide higher returns but with more volatility. Balanced funds like EFUF offer moderate risk-return. Stable return funds like ESRF focus on fixed-income securities for lower risk. Your choice should align with your investment horizon and risk tolerance."
  },
  {
    title: "Tax Benefits",
    icon: Shield,
    color: "bg-red-50 text-red-600",
    content: "In Bangladesh, mutual fund investments offer tax advantages. Dividend tax rates vary by investor type: Individuals with TIN pay 10%, without TIN 15%, Companies 20%, and Mutual Funds/Provident Funds have preferential rates. Capital gains from mutual funds held over certain periods may qualify for reduced taxation. Always consult with a tax advisor for your specific situation."
  },
  {
    title: "How to Read Your Statement",
    icon: BookOpen,
    color: "bg-teal-50 text-teal-600",
    content: "Your portfolio statement shows: Units Held (total units in each fund), Average Cost (your average purchase price per unit), Current NAV (today's unit price), Market Value (units × NAV), Cost Value (units × average cost), and Gain/Loss (market value minus cost value). Realized gains are from sold units; unrealized gains are from units you still hold."
  },
];

export default function GuidesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Investment Guides</h1>
        <p className="text-sm text-gray-500">Everything you need to know about mutual fund investing</p>
      </div>

      <div className="space-y-4">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <Card key={guide.title}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${guide.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{guide.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{guide.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        These guides are for educational purposes only. Please consult with a financial advisor before making investment decisions.
      </p>
    </div>
  );
}
