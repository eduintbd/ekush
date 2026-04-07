import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const holdings = await prisma.fundHolding.findMany({
    where: { investorId },
    include: { fund: true },
  });

  return NextResponse.json(holdings);
}
