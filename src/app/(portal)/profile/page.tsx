import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { INVESTOR_TYPE_LABELS } from "@/lib/constants";
import { User, Phone, Mail, MapPin, CreditCard, Shield, Users, Edit } from "lucide-react";
import { EditContactForm, EditPersonalForm, AddBankForm, AddNomineeForm, DeleteButton } from "@/components/profile/edit-forms";

async function getInvestorProfile(investorId: string) {
  return prisma.investor.findUnique({
    where: { id: investorId },
    include: {
      user: { select: { email: true, phone: true, twoFactorEnabled: true, status: true, lastLoginAt: true } },
      bankAccounts: { orderBy: { createdAt: "asc" } },
      nominees: { orderBy: { createdAt: "asc" } },
      kycRecords: { orderBy: { createdAt: "desc" } },
    },
  });
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const investorId = (session?.user as any)?.investorId;

  if (!investorId) {
    return <p className="text-gray-500 text-center py-20">Investor profile not found.</p>;
  }

  const investor = await getInvestorProfile(investorId);
  if (!investor) return <p className="text-gray-500 text-center py-20">Profile not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="text-sm text-gray-500">Manage your personal information and settings</p>
      </div>

      {/* Personal Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Name" value={investor.name} />
            <InfoRow label="Investor Code" value={investor.investorCode} />
            <InfoRow label="Type" value={INVESTOR_TYPE_LABELS[investor.investorType] || investor.investorType} />
            <InfoRow label="Title" value={investor.title || "N/A"} />
            <InfoRow label="BO ID" value={investor.boId || "N/A"} />
            <InfoRow label="Account Status">
              <Badge variant={investor.user.status === "ACTIVE" ? "success" : "warning"}>
                {investor.user.status}
              </Badge>
            </InfoRow>
          </div>
        </CardContent>
      </Card>

      {/* Editable Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Details (Editable) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4" /> Contact Details
              <Edit className="w-3 h-3 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EditContactForm
              email={investor.user.email || undefined}
              phone={investor.user.phone || undefined}
            />
          </CardContent>
        </Card>

        {/* Personal Details (Editable) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Personal Details
              <Edit className="w-3 h-3 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EditPersonalForm
              address={investor.address || undefined}
              nidNumber={investor.nidNumber || undefined}
              tinNumber={investor.tinNumber || undefined}
            />
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" /> Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Two-Factor Auth</span>
              <Badge variant={investor.user.twoFactorEnabled ? "success" : "outline"}>
                {investor.user.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Last Login</span>
              <span className="text-sm font-medium">
                {investor.user.lastLoginAt ? new Date(investor.user.lastLoginAt).toLocaleString("en-GB") : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">KYC Status</span>
              <Badge variant={investor.kycRecords.some(k => k.status === "VERIFIED") ? "success" : "warning"}>
                {investor.kycRecords.some(k => k.status === "VERIFIED") ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Bank Accounts
          </CardTitle>
          <AddBankForm />
        </CardHeader>
        <CardContent>
          {investor.bankAccounts.length === 0 ? (
            <p className="text-gray-500 text-sm">No bank accounts linked. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {investor.bankAccounts.map((ba) => (
                <div key={ba.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{ba.bankName}</p>
                    <p className="text-xs text-gray-500">{ba.branchName} - A/C: {ba.accountNumber}</p>
                    {ba.routingNumber && <p className="text-xs text-gray-400">Routing: {ba.routingNumber}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {ba.isPrimary && <Badge variant="success">Primary</Badge>}
                    <DeleteButton id={ba.id} action="delete_bank" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nominees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" /> Nominees
          </CardTitle>
          <AddNomineeForm />
        </CardHeader>
        <CardContent>
          {investor.nominees.length === 0 ? (
            <p className="text-gray-500 text-sm">No nominees registered. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {investor.nominees.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{n.name}</p>
                    <p className="text-xs text-gray-500">
                      {n.relationship || "Relationship not specified"}
                      {n.nidNumber && ` | NID: ${n.nidNumber}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{Number(n.share)}%</span>
                    <DeleteButton id={n.id} action="delete_nominee" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      {children || <span className="text-sm font-medium text-gray-800">{value}</span>}
    </div>
  );
}
