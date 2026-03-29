import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Using ServiceRequest with type "CALLBACK" or "APPOINTMENT" for appointments
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;
  const userId = (session?.user as any)?.id;

  if (!investorId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, date, time, topic, notes } = body;

  if (!type) {
    return NextResponse.json({ error: "Type required" }, { status: 400 });
  }

  const prefix = "AP";
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const trackingNumber = `${prefix}${dateStr}${rand}`;

  const description = [
    type === "CALLBACK" ? "Callback Request" : "Appointment Booking",
    date ? `Date: ${date}` : "",
    time ? `Time: ${time}` : "",
    topic ? `Topic: ${topic}` : "",
    notes || "",
  ].filter(Boolean).join(" | ");

  const ticket = await prisma.serviceRequest.create({
    data: {
      investorId,
      type: type === "CALLBACK" ? "CALLBACK_REQUEST" : "APPOINTMENT",
      description,
      trackingNumber,
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "APPOINTMENT",
      title: type === "CALLBACK" ? "Callback Requested" : "Appointment Booked",
      message: `Your ${type === "CALLBACK" ? "callback request" : "appointment"} has been submitted. We'll confirm shortly.`,
      link: `/support/${ticket.id}`,
    },
  });

  return NextResponse.json({ id: ticket.id, trackingNumber, message: "Request submitted successfully." });
}
