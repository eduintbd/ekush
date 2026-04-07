import { getSession } from "@/lib/auth";


import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { FileText, FolderOpen, Shield, Receipt, File } from "lucide-react";
import { DocumentUploadForm } from "@/components/documents/upload-form";

const typeIcons: Record<string, typeof FileText> = {
  KYC_DOC: Shield,
  STATEMENT: FileText,
  TAX_CERT: Receipt,
  UNIT_CERT: File,
  CONTRACT_NOTE: FileText,
};

const typeLabels: Record<string, string> = {
  KYC_DOC: "KYC Document",
  STATEMENT: "Statement",
  TAX_CERT: "Tax Certificate",
  UNIT_CERT: "Unit Certificate",
  CONTRACT_NOTE: "Contract Note",
  OTHER: "Other",
};

export default async function DocumentsPage() {
  const session = await getSession();
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return <p className="text-text-body text-center py-20">Investor profile not found.</p>;
  }

  const documents = await prisma.document.findMany({
    where: { investorId },
    orderBy: { createdAt: "desc" },
  });

  // Group by type
  const grouped = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-text-dark font-rajdhani">Document Vault</h1>
        <p className="text-sm text-text-body">All your investment documents in one secure place</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-2 space-y-4">
          {documents.length === 0 ? (
            <Card className="rounded-[10px] shadow-card">
              <CardContent className="py-16 text-center">
                <FolderOpen className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-body">No documents yet.</p>
                <p className="text-text-muted text-xs mt-1">
                  Upload your first document using the form on the right.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(grouped).map(([type, docs]) => {
              const Icon = typeIcons[type] || FileText;
              return (
                <Card key={type} className="rounded-[10px] shadow-card">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm flex items-center gap-2 text-text-dark">
                      <Icon className="w-4 h-4 text-ekush-orange" />
                      {typeLabels[type] || type}
                      <Badge variant="outline">{docs.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-page-bg rounded-[10px] hover:bg-page-bg/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-text-muted shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-text-dark">{doc.fileName}</p>
                              <p className="text-xs text-text-body">{formatDate(doc.createdAt)}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {doc.mimeType?.split("/")[1]?.toUpperCase() || "FILE"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Upload Form */}
        <div>
          <Card className="rounded-[10px] shadow-card">
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold text-text-dark">Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUploadForm />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4 rounded-[10px] shadow-card">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-text-dark mb-2">Document Summary</p>
              <div className="space-y-1">
                {Object.entries(grouped).map(([type, docs]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="text-text-body">{typeLabels[type] || type}</span>
                    <span className="font-medium text-text-dark">{docs.length}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs pt-1 border-t mt-1">
                  <span className="text-text-dark font-medium">Total</span>
                  <span className="font-bold text-text-dark">{documents.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
