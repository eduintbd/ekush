"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, ChevronLeft, Upload, Loader2, Shield, User, CreditCard, FileText, AlertTriangle } from "lucide-react";

const STEPS = [
  { id: "personal", title: "Personal Info", icon: User },
  { id: "identity", title: "Identity (e-KYC)", icon: Shield },
  { id: "fatca", title: "FATCA/CRS", icon: FileText },
  { id: "bank", title: "Bank Details", icon: CreditCard },
  { id: "risk", title: "Risk Profile", icon: AlertTriangle },
  { id: "consent", title: "Consent", icon: CheckCircle },
];

const RISK_QUESTIONS = [
  { q: "What is your investment horizon?", opts: ["Less than 1 year", "1-3 years", "3-5 years", "More than 5 years"] },
  { q: "How would you react if your portfolio dropped 20%?", opts: ["Sell everything immediately", "Sell some holdings", "Do nothing", "Buy more"] },
  { q: "What is your primary investment goal?", opts: ["Capital preservation", "Regular income", "Balanced growth", "Aggressive growth"] },
  { q: "What percentage of income do you invest?", opts: ["Less than 10%", "10-25%", "25-50%", "More than 50%"] },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [personal, setPersonal] = useState({ address: "", phone: "", email: "" });
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [fatca, setFatca] = useState({ usPerson: "no", taxResidence: "Bangladesh", tinProvided: "yes" });
  const [bank, setBank] = useState({ bankName: "", branchName: "", accountNumber: "", routingNumber: "" });
  const [riskAnswers, setRiskAnswers] = useState<string[]>(Array(RISK_QUESTIONS.length).fill(""));
  const [consented, setConsented] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 0: return personal.address && (personal.phone || personal.email);
      case 1: return nidFile !== null;
      case 2: return true;
      case 3: return bank.bankName && bank.accountNumber;
      case 4: return riskAnswers.every(a => a !== "");
      case 5: return consented;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Save contact info
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_contact", email: personal.email, phone: personal.phone }),
      });

      // Save personal info
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_personal", address: personal.address }),
      });

      // Upload NID
      if (nidFile) {
        const formData = new FormData();
        formData.append("type", "NID");
        formData.append("file", nidFile);
        if (selfieFile) formData.append("selfie", selfieFile);
        await fetch("/api/kyc", { method: "POST", body: formData });
      }

      // Save bank
      if (bank.bankName && bank.accountNumber) {
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add_bank", ...bank }),
        });
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#d4a843] rounded-lg flex items-center justify-center font-bold text-[#1e3a5f] text-lg">E</div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-800">Complete Your Profile</h1>
              <p className="text-sm text-gray-500">Digital onboarding & e-KYC</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? "bg-green-500 text-white" :
                i === step ? "bg-[#1e3a5f] text-white" :
                "bg-gray-200 text-gray-500"
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="w-5 h-5" />; })()}
              Step {step + 1}: {STEPS[step].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Step 0: Personal */}
            {step === 0 && (
              <>
                <Input label="Address" value={personal.address} onChange={(e) => setPersonal({ ...personal, address: e.target.value })} placeholder="Your full address" required />
                <Input label="Phone Number" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} placeholder="+880-XXX-XXXXXXX" />
                <Input label="Email" type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} placeholder="your@email.com" />
              </>
            )}

            {/* Step 1: Identity */}
            {step === 1 && (
              <>
                <p className="text-sm text-gray-600">Upload your National ID (NID) or Passport for identity verification.</p>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">NID / Passport *</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setNidFile(e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700" />
                  {nidFile && <p className="text-xs text-green-600 mt-1">Selected: {nidFile.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Selfie Photo (optional, for face match)</label>
                  <input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700" />
                </div>
              </>
            )}

            {/* Step 2: FATCA/CRS */}
            {step === 2 && (
              <>
                <p className="text-sm text-gray-600">Foreign Account Tax Compliance Act (FATCA) and Common Reporting Standard (CRS) declaration.</p>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Are you a US Person?</label>
                  <select value={fatca.usPerson} onChange={(e) => setFatca({ ...fatca, usPerson: e.target.value })} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <Input label="Country of Tax Residence" value={fatca.taxResidence} onChange={(e) => setFatca({ ...fatca, taxResidence: e.target.value })} />
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">TIN Provided?</label>
                  <select value={fatca.tinProvided} onChange={(e) => setFatca({ ...fatca, tinProvided: e.target.value })} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
                    <option value="yes">Yes</option>
                    <option value="no">No - will provide later</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 3: Bank */}
            {step === 3 && (
              <>
                <p className="text-sm text-gray-600">Add your bank account for investments and redemptions.</p>
                <Input label="Bank Name *" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} placeholder="e.g., Dutch Bangla Bank" required />
                <Input label="Branch" value={bank.branchName} onChange={(e) => setBank({ ...bank, branchName: e.target.value })} placeholder="Branch name" />
                <Input label="Account Number *" value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} placeholder="Account number" required />
                <Input label="Routing Number" value={bank.routingNumber} onChange={(e) => setBank({ ...bank, routingNumber: e.target.value })} placeholder="Routing number" />
              </>
            )}

            {/* Step 4: Risk Profile */}
            {step === 4 && (
              <>
                <p className="text-sm text-gray-600">Help us understand your risk tolerance to recommend suitable investments.</p>
                {RISK_QUESTIONS.map((rq, i) => (
                  <div key={i}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{rq.q}</label>
                    <select value={riskAnswers[i]} onChange={(e) => {
                      const a = [...riskAnswers]; a[i] = e.target.value; setRiskAnswers(a);
                    }} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm" required>
                      <option value="">Select...</option>
                      {rq.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </>
            )}

            {/* Step 5: Consent */}
            {step === 5 && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 max-h-48 overflow-y-auto space-y-2">
                  <p className="font-medium text-gray-800">Terms & Conditions</p>
                  <p>I hereby confirm that the information provided is true and correct to the best of my knowledge.</p>
                  <p>I authorize Ekush Wealth Management Ltd to process my personal data for account management, KYC compliance, and regulatory requirements as per Bangladesh Bank and BSEC guidelines.</p>
                  <p>I understand that mutual fund investments are subject to market risk and past performance does not guarantee future results.</p>
                  <p>I consent to receiving communications via email, SMS, and in-portal notifications regarding my investments, account updates, and regulatory notices.</p>
                  <p>I acknowledge that my KYC documents will be verified and I may be required to provide additional documents if necessary.</p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} className="mt-1 w-4 h-4" />
                  <span className="text-sm text-gray-700">I have read and agree to the Terms & Conditions, Privacy Policy, and consent to data processing as described above.</span>
                </label>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext} disabled={!canProceed()} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={!canProceed() || loading} className="bg-green-600 hover:bg-green-700 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  Complete Onboarding
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-4">
          Your data is encrypted and stored securely. Licensed by BSEC.
        </p>
      </div>
    </div>
  );
}
