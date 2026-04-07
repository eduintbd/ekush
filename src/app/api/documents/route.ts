import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";

export async function GET() {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { investorId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "KYC_DOC";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const filePath = await uploadFile(
    file,
    `${investorId}/${Date.now()}_${safeName}`
  );

  const document = await prisma.document.create({
    data: {
      investorId,
      type,
      fileName: file.name,
      filePath,
      mimeType: file.type || null,
    },
  });

  return NextResponse.json(document);
}
