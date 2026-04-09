import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DownloadTaxCertificate } from "@/components/statements/pdf-buttons";

function getAssessmentYear(periodEnd: Date | null): string {
  if (!periodEnd) return "N/A";
  const endYear = periodEnd.getFullYear();
  const endMonth = periodEnd.getMonth(); // 0-indexed
  // Bangladesh assessment year: income earned in July-June → assessment year is the year ending+1
  // e.g. period July 2024 – June 2025 → Assessment Year 2025-26
  if (endMonth <= 5) {
    // Ends Jan–Jun → assessment year is endYear to endYear+1
    return `${endYear} - ${String(endYear + 1).slice(-2)}`;
  }
  // Ends Jul–Dec → assessment year is endYear+1 to endYear+2
  return `${endYear + 1} - ${String(endYear + 2).slice(-2)}`;
}

async function getTaxCertificates(investorId: string) {
  return prisma.taxCertificate.findMany({
    where: { investorId },
    include: { fund: { select: { code: true, name: true } } },
    orderBy: { periodEnd: "desc" },
  });
}

export default async function TaxCertificatePage() {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return <p className="text-text-body text-center py-20">Investor profile not found.</p>;
  }

  const taxCerts = await getTaxCertificates(investorId);

  return (
    <div className="space-y-6">
      <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani">Tax Certificate</h1>

      {taxCerts.length === 0 ? (
        <p className="text-text-body text-sm text-center py-10">No tax certificates available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {taxCerts.map((tc) => {
            const assessmentYear = getAssessmentYear(tc.periodEnd);

            return (
              <div
                key={tc.id}
                className="bg-white rounded-card shadow-card p-6 flex flex-col items-center text-center"
              >
                <h3 className="text-[15px] font-semibold text-text-muted mb-1">
                  {tc.fund.name}
                </h3>
                <p className="text-[13px] text-text-body mb-5">
                  Assessment Year: {assessmentYear}
                </p>
                <DownloadTaxCertificateButton certId={tc.id} fundCode={tc.fund.code} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DownloadTaxCertificateButton({ certId, fundCode }: { certId: string; fundCode: string }) {
  return <DownloadTaxCertificate certId={certId} fundCode={fundCode} />;
}
