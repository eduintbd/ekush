import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cache for 60 seconds — funds data rarely changes
export const revalidate = 60;

export async function GET() {
  const funds = await prisma.fund.findMany({ orderBy: { code: "asc" } });
  const response = NextResponse.json(funds);
  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  return response;
}
