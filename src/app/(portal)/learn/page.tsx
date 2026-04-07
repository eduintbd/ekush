import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { BookOpen, TrendingUp, Shield, Calculator, Calendar, Phone } from "lucide-react";

export default async function LearnPage() {
  const articles = await prisma.marketCommentary.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani">Learn & Insights</h1>
        <p className="text-sm text-text-body">Market commentary, education, and investment tools</p>
      </div>

      {/* Quick Tools */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/learn/calculator">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full rounded-[10px] shadow-card">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 bg-ekush-orange/10 rounded-[10px] flex items-center justify-center mx-auto mb-3">
                <Calculator className="w-5 h-5 text-ekush-orange" />
              </div>
              <p className="font-medium text-sm text-text-dark">SIP Calculator</p>
              <p className="text-xs text-text-body mt-1">Estimate returns</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn/guides">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full rounded-[10px] shadow-card">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 bg-green-50 rounded-[10px] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <p className="font-medium text-sm text-text-dark">Mutual Fund Basics</p>
              <p className="text-xs text-text-body mt-1">Learn investing</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn/appointments">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full rounded-[10px] shadow-card">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 bg-navy/10 rounded-[10px] flex items-center justify-center mx-auto mb-3">
                <Phone className="w-5 h-5 text-navy" />
              </div>
              <p className="font-medium text-sm text-text-dark">Book Consultation</p>
              <p className="text-xs text-text-body mt-1">Talk to an advisor</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn/events">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full rounded-[10px] shadow-card">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-[10px] flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-medium text-sm text-text-dark">Events & Webinars</p>
              <p className="text-xs text-text-body mt-1">Upcoming sessions</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default">All</Badge>
          {categories.map(c => (
            <Badge key={c} variant="outline">{c}</Badge>
          ))}
        </div>
      )}

      {/* Articles */}
      <div>
        <h3 className="text-[16px] font-semibold text-text-dark font-rajdhani mb-4">Market Commentary & Insights</h3>
        {articles.length === 0 ? (
          <Card className="rounded-[10px] shadow-card">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-body">No articles published yet.</p>
              <p className="text-text-muted text-xs mt-1">Check back soon for market insights and fund manager commentary.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow rounded-[10px] shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {article.category && <Badge variant="outline" className="text-[10px]">{article.category}</Badge>}
                    <span className="text-xs text-text-muted">{article.publishedAt ? formatDate(article.publishedAt) : ""}</span>
                  </div>
                  <h4 className="font-semibold text-text-dark mb-2">{article.title}</h4>
                  <p className="text-sm text-text-body line-clamp-3">{article.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
