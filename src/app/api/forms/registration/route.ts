import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;
  if (!investorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const investor = await prisma.investor.findUnique({
    where: { id: investorId },
    include: {
      user: { select: { email: true, phone: true } },
      bankAccounts: { where: { isPrimary: true }, take: 1 },
      nominees: { take: 1 },
    },
  });

  if (!investor) return NextResponse.json({ error: "Investor not found" }, { status: 404 });

  // Get order details from query params
  const fundCode = req.nextUrl.searchParams.get("fundCode") || "";
  const fundName = req.nextUrl.searchParams.get("fundName") || "";
  const amount = req.nextUrl.searchParams.get("amount") || "";
  const units = req.nextUrl.searchParams.get("units") || "";
  const nav = req.nextUrl.searchParams.get("nav") || "";
  const dividendOption = req.nextUrl.searchParams.get("dividend") || "CIP";

  const bank = investor.bankAccounts[0];
  const nominee = investor.nominees[0];

  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const orange = [242, 112, 35] as const;
  const navy = [30, 58, 95] as const;

  // ─── Page 1: Cover ─────────────────────────────────────────────
  // Orange header bar
  doc.setFillColor(...orange);
  doc.rect(0, 0, pw, 8, "F");

  doc.setFontSize(10);
  doc.setTextColor(...orange);
  doc.setFont("helvetica", "italic");
  doc.text("Asset Manager", pw / 2, 30, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.text("EKUSH WEALTH MANAGEMENT LIMITED", pw / 2, 40, { align: "center" });

  doc.setFontSize(28);
  doc.text("REGISTRATION FORM", pw / 2, 80, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Investor Name: ${investor.name}`, 20, 130);
  doc.text(`Investor Code: ${investor.investorCode}`, 20, 140);

  if (fundCode) {
    doc.text(`Fund: ${fundCode} — ${fundName}`, 20, 155);
    doc.text(`Amount: BDT ${Number(amount).toLocaleString("en-IN")}`, 20, 165);
    doc.text(`Units: ${units}`, 20, 175);
    doc.text(`NAV: ${nav}`, 20, 185);
  }

  // Footer bar
  doc.setFillColor(...orange);
  doc.rect(0, 285, pw, 8, "F");

  // ─── Page 2: Principal Applicant ───────────────────────────────
  doc.addPage();
  drawFormHeader(doc, pw, "PRINCIPAL APPLICANT'S INFORMATION");

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${dateStr}`, pw - 20, 42, { align: "right" });

  // Personal Information
  drawSectionTitle(doc, 50, "PERSONAL INFORMATION");

  const personalData = [
    ["Name (in BLOCK LETTER)", investor.name?.toUpperCase() || ""],
    ["Father's/Husband's Name", ""],
    ["Mother's Name", ""],
    ["NID/Passport Number", investor.nidNumber || ""],
  ];

  autoTable(doc, {
    startY: 56,
    body: personalData,
    theme: "grid",
    bodyStyles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold", textColor: [80, 80, 80] },
      1: { cellWidth: pw - 55 - 28 },
    },
    margin: { left: 14, right: 14 },
  });

  // Contact Information
  let y = (doc as any).lastAutoTable.finalY + 8;
  drawSectionTitle(doc, y, "CONTACT INFORMATION");

  const contactData = [
    ["Contact Number/s", investor.user?.phone || ""],
    ["Email Address", investor.user?.email || ""],
    ["Present Address", investor.address || ""],
    ["Permanent Address", investor.address || ""],
  ];

  autoTable(doc, {
    startY: y + 6,
    body: contactData,
    theme: "grid",
    bodyStyles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold", textColor: [80, 80, 80] },
      1: { cellWidth: pw - 55 - 28 },
    },
    margin: { left: 14, right: 14 },
  });

  // Financial Information
  y = (doc as any).lastAutoTable.finalY + 8;
  drawSectionTitle(doc, y, "FINANCIAL AND INVESTMENT-RELATED INFORMATION");

  const financialData = [
    ["Investor's Bank Account Name", bank?.bankName ? investor.name : ""],
    ["Account Number", bank?.accountNumber || ""],
    ["Bank Name", bank?.bankName || ""],
    ["Branch Name", bank?.branchName || ""],
    ["Routing Number", bank?.routingNumber || ""],
    ["BO Account Number", investor.boId || ""],
    ["TIN", investor.tinNumber || ""],
  ];

  autoTable(doc, {
    startY: y + 6,
    body: financialData,
    theme: "grid",
    bodyStyles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold", textColor: [80, 80, 80] },
      1: { cellWidth: pw - 55 - 28 },
    },
    margin: { left: 14, right: 14 },
  });

  // ─── Page 3: Nominee Information ───────────────────────────────
  if (nominee) {
    doc.addPage();
    drawFormHeader(doc, pw, "NOMINEE'S INFORMATION");

    drawSectionTitle(doc, 50, "PERSONAL INFORMATION");

    const nomineeData = [
      ["Name (in BLOCK LETTER)", nominee.name?.toUpperCase() || ""],
      ["NID/Passport Number", nominee.nidNumber || ""],
      ["Relationship", nominee.relationship || ""],
      ["Share (%)", String(nominee.share ?? 100)],
    ];

    autoTable(doc, {
      startY: 56,
      body: nomineeData,
      theme: "grid",
      bodyStyles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: "bold", textColor: [80, 80, 80] },
        1: { cellWidth: pw - 55 - 28 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ─── Page 4: Order Details ─────────────────────────────────────
  if (fundCode) {
    doc.addPage();
    drawFormHeader(doc, pw, "PURCHASE ORDER DETAILS");

    const orderData = [
      ["Fund", `${fundCode} — ${fundName}`],
      ["Investment Amount (BDT)", Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })],
      ["NAV (Unit Price)", nav],
      ["Estimated Units", units],
      ["Dividend Option", dividendOption],
      ["Order Date", dateStr],
      ["Investor Code", investor.investorCode],
      ["Investor Name", investor.name],
    ];

    autoTable(doc, {
      startY: 50,
      body: orderData,
      theme: "grid",
      bodyStyles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold", textColor: [80, 80, 80] },
        1: { cellWidth: pw - 60 - 28 },
      },
      margin: { left: 14, right: 14 },
    });

    const orderY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("I confirm that the information provided above is correct and I agree to the Terms and Conditions", 14, orderY);
    doc.text("of Ekush Wealth Management Limited.", 14, orderY + 5);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Principal Applicant's Signature: ___________________________", 14, orderY + 25);
    doc.text(`Date: ${dateStr}`, 14, orderY + 35);
  }

  // ─── Footer on all pages ───────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    doc.text(
      "Ekush Wealth Management Limited | 9G, Motijheel C/A, 2nd Floor, Dhaka-1000 | info@ekushwml.com | www.ekushwml.com",
      pw / 2,
      290,
      { align: "center" }
    );
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Registration_Form_${investor.investorCode}.pdf"`,
    },
  });
}

function drawFormHeader(doc: jsPDF, pw: number, subtitle: string) {
  doc.setFillColor(242, 112, 35);
  doc.rect(0, 0, pw, 6, "F");

  doc.setFontSize(14);
  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.text("INVESTOR'S REGISTRATION FORM", pw / 2, 18, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Asset Manager: Ekush Wealth Management Limited", pw / 2, 25, { align: "center" });
  doc.text("(Please Fill up the form using only BLOCK LETTERS)", pw / 2, 30, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 95);
  doc.text(subtitle, pw / 2, 40, { align: "center" });
}

function drawSectionTitle(doc: jsPDF, y: number, title: string) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 95);
  doc.text(`\u25AA ${title}`, 14, y);
}
