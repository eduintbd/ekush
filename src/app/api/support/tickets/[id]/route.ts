import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticket = await prisma.serviceRequest.findUnique({
    where: { id: params.id },
    include: {
      investor: { select: { name: true, investorCode: true } },
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(ticket);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Add comment
  if (body.comment) {
    await prisma.ticketComment.create({
      data: {
        serviceRequestId: params.id,
        authorId: userId,
        content: body.comment,
        attachmentUrl: body.attachmentUrl || null,
      },
    });
    return NextResponse.json({ success: true });
  }

  // Update status (admin only)
  if (body.status) {
    const role = (session?.user as any)?.role;
    const adminRoles = ["ADMIN", "MANAGER", "COMPLIANCE", "SUPPORT", "SUPER_ADMIN"];
    if (!adminRoles.includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.serviceRequest.update({
      where: { id: params.id },
      data: { status: body.status },
    });

    // Notify investor
    const ticket = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: { investor: true },
    });
    if (ticket) {
      await prisma.notification.create({
        data: {
          userId: ticket.investor.userId,
          type: "SERVICE",
          title: "Service Request Updated",
          message: `Your request #${ticket.trackingNumber} status changed to ${body.status}.`,
          link: `/support/${ticket.id}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
