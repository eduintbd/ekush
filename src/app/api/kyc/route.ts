import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.kycRecord.findMany({
    where: { investorId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;
  const userId = (session?.user as any)?.id;

  if (!investorId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const type = formData.get("type") as string;
  const file = formData.get("file") as File | null;
  const selfie = formData.get("selfie") as File | null;

  if (!type) {
    return NextResponse.json({ error: "KYC type required" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "uploads", "kyc", investorId);
  await mkdir(uploadDir, { recursive: true });

  let documentUrl: string | null = null;
  let selfieUrl: string | null = null;

  if (file) {
    const fileName = `${type}_${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    documentUrl = `uploads/kyc/${investorId}/${fileName}`;
  }

  if (selfie) {
    const fileName = `selfie_${Date.now()}_${selfie.name}`;
    const filePath = path.join(uploadDir, fileName);
    const bytes = await selfie.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    selfieUrl = `uploads/kyc/${investorId}/${fileName}`;
  }

  // Create KYC record and notification in parallel
  const [record] = await Promise.all([
    prisma.kycRecord.create({
      data: {
        investorId,
        type,
        status: "PENDING",
        documentUrl,
        selfieUrl,
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: "KYC",
        title: "KYC Document Submitted",
        message: `Your ${type} document has been submitted for verification.`,
        link: "/profile",
      },
    }),
  ]);

  return NextResponse.json(record);
}
