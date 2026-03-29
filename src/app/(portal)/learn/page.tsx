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
        <h1 className="text-2xl font-bold text-gray-800">Learn & Insights</h1>
        <p className="text-sm text-gray-500">Market commentary, education, and investment tools</p>
      </div>

      {/* Quick Tools */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/learn/calculator">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calculator className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-medium text-sm">SIP Calculator</p>
              <p className="text-xs text-gray-500 mt-1">Estimate returns</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn/guides">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <p className="font-medium text-sm">Mutual Fund Basics</p>
              <p className="text-xs text-gray-500 mt-1">Learn investing</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn/appointments">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Phone className="w-5 h-5 text-violet-600" />
              </div>
              <p className="font-medium text-sm">Book Consultation</p>
              <p className="text-xs text-gray-500 mt-1">Talk to an advisor</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn/events">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-medium text-sm">Events & Webinars</p>
              <p className="text-xs text-gray-500 mt-1">Upcoming sessions</p>
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Market Commentary & Insights</h3>
        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No articles published yet.</p>
              <p className="text-gray-400 text-xs mt-1">Check back soon for market insights and fund manager commentary.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {article.category && <Badge variant="outline" className="text-[10px]">{article.category}</Badge>}
                    <span className="text-xs text-gray-400">{article.publishedAt ? formatDate(article.publishedAt) : ""}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{article.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{article.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
