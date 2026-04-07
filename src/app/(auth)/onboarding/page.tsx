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
    <div className="min-h-screen bg-page-bg py-8 px-4 font-poppins">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ekush-orange rounded-[5px] flex items-center justify-center font-bold text-white text-lg shadow-card">E</div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-text-dark font-rajdhani">Complete Your Profile</h1>
              <p className="text-sm text-text-body">Digital onboarding & e-KYC</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? "bg-green-500 text-white" :
                i === step ? "bg-navy text-white" :
                "bg-input-border/40 text-text-body"
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-green-500" : "bg-input-border/40"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-input-border/30">
            <h2 className="text-base font-bold text-text-dark font-rajdhani flex items-center gap-2">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="w-5 h-5 text-ekush-orange" />; })()}
              Step {step + 1}: {STEPS[step].title}
            </h2>
          </div>
          <div className="p-6 space-y-4">

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
                <p className="text-sm text-text-body">Upload your National ID (NID) or Passport for identity verification.</p>
                <div>
                  <label className="text-[14px] font-medium text-text-label block mb-2">NID / Passport *</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setNidFile(e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-[5px] file:border-0 file:text-sm file:font-semibold file:bg-ekush-orange/10 file:text-ekush-orange" />
                  {nidFile && <p className="text-xs text-green-600 mt-1">Selected: {nidFile.name}</p>}
                </div>
                <div>
                  <label className="text-[14px] font-medium text-text-label block mb-2">Selfie Photo (optional, for face match)</label>
                  <input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-[5px] file:border-0 file:text-sm file:font-semibold file:bg-ekush-orange/10 file:text-ekush-orange" />
                </div>
              </>
            )}

            {/* Step 2: FATCA/CRS */}
            {step === 2 && (
              <>
                <p className="text-sm text-text-body">Foreign Account Tax Compliance Act (FATCA) and Common Reporting Standard (CRS) declaration.</p>
                <div>
                  <label className="text-[14px] font-medium text-text-label block mb-2">Are you a US Person?</label>
                  <select value={fatca.usPerson} onChange={(e) => setFatca({ ...fatca, usPerson: e.target.value })} className="w-full h-[50px] rounded-[5px] border border-input-border bg-input-bg px-5 text-[14px] text-text-dark">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <Input label="Country of Tax Residence" value={fatca.taxResidence} onChange={(e) => setFatca({ ...fatca, taxResidence: e.target.value })} />
                <div>
                  <label className="text-[14px] font-medium text-text-label block mb-2">TIN Provided?</label>
                  <select value={fatca.tinProvided} onChange={(e) => setFatca({ ...fatca, tinProvided: e.target.value })} className="w-full h-[50px] rounded-[5px] border border-input-border bg-input-bg px-5 text-[14px] text-text-dark">
                    <option value="yes">Yes</option>
                    <option value="no">No - will provide later</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 3: Bank */}
            {step === 3 && (
              <>
                <p className="text-sm text-text-body">Add your bank account for investments and redemptions.</p>
                <Input label="Bank Name *" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} placeholder="e.g., Dutch Bangla Bank" required />
                <Input label="Branch" value={bank.branchName} onChange={(e) => setBank({ ...bank, branchName: e.target.value })} placeholder="Branch name" />
                <Input label="Account Number *" value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} placeholder="Account number" required />
                <Input label="Routing Number" value={bank.routingNumber} onChange={(e) => setBank({ ...bank, routingNumber: e.target.value })} placeholder="Routing number" />
              </>
            )}

            {/* Step 4: Risk Profile */}
            {step === 4 && (
              <>
                <p className="text-sm text-text-body">Help us understand your risk tolerance to recommend suitable investments.</p>
                {RISK_QUESTIONS.map((rq, i) => (
                  <div key={i}>
                    <label className="text-[14px] font-medium text-text-label block mb-2">{rq.q}</label>
                    <select value={riskAnswers[i]} onChange={(e) => {
                      const a = [...riskAnswers]; a[i] = e.target.value; setRiskAnswers(a);
                    }} className="w-full h-[50px] rounded-[5px] border border-input-border bg-input-bg px-5 text-[14px] text-text-dark" required>
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
                <div className="bg-page-bg rounded-[5px] p-4 text-sm text-text-body max-h-48 overflow-y-auto space-y-2">
                  <p className="font-medium text-text-dark">Terms & Conditions</p>
                  <p>I hereby confirm that the information provided is true and correct to the best of my knowledge.</p>
                  <p>I authorize Ekush Wealth Management Ltd to process my personal data for account management, KYC compliance, and regulatory requirements as per Bangladesh Bank and BSEC guidelines.</p>
                  <p>I understand that mutual fund investments are subject to market risk and past performance does not guarantee future results.</p>
                  <p>I consent to receiving communications via email, SMS, and in-portal notifications regarding my investments, account updates, and regulatory notices.</p>
                  <p>I acknowledge that my KYC documents will be verified and I may be required to provide additional documents if necessary.</p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} className="mt-1 w-4 h-4 accent-ekush-orange" />
                  <span className="text-sm text-text-dark">I have read and agree to the Terms & Conditions, Privacy Policy, and consent to data processing as described above.</span>
                </label>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-input-border/30">
              <Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext} disabled={!canProceed()}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={!canProceed() || loading} className="bg-green-600 hover:bg-green-700 border-green-600 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  Complete Onboarding
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-text-body text-center mt-4">
          Your data is encrypted and stored securely. Licensed by BSEC.
        </p>
      </div>
    </div>
  );
}
