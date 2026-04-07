"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Shield, User, ChevronRight } from "lucide-react";

const DEV_ACCOUNTS = [
  {
    label: "Admin",
    description: "Super Admin - Full access to admin panel, approvals, NAV entry, content management",
    login: "admin@ekushwml.com",
    password: "admin@ekush2026",
    icon: Shield,
    color: "from-red-500 to-red-600",
    redirect: "/admin/dashboard",
  },
  {
    label: "Investor A00002",
    description: "Sample individual investor with holdings in all 3 funds (EFUF, EGF, ESRF)",
    login: "A00002",
    password: "Ekush@A000022026",
    icon: User,
    color: "from-[#F27023] to-[#e85d04]",
    redirect: "/dashboard",
  },
  {
    label: "Investor A00003",
    description: "Ekush WML corporate account - appears across all funds",
    login: "A00003",
    password: "Ekush@A000032026",
    icon: User,
    color: "from-blue-500 to-blue-600",
    redirect: "/dashboard",
  },
  {
    label: "Investor A00010",
    description: "Another individual investor for testing different portfolios",
    login: "A00010",
    password: "Ekush@A000102026",
    icon: User,
    color: "from-green-500 to-green-600",
    redirect: "/dashboard",
  },
];

export default function DevLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleQuickLogin = async (account: (typeof DEV_ACCOUNTS)[0]) => {
    setLoading(account.login);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: account.login, password: account.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`Failed: ${data.error ?? "Unknown error"}`);
      } else {
        router.push(account.redirect);
        router.refresh();
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#F27023] to-[#e85d04] rounded-[12px] flex items-center justify-center font-bold text-white text-xl shadow-[0_4px_15px_rgba(242,112,35,0.3)]">
              E
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#333]">Dev Quick Login</h1>
              <p className="text-[12px] text-[#6c757d]">Development mode - click to auto-login</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-[12px] mb-4 border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Account Cards */}
        <div className="space-y-3">
          {DEV_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            const isLoading = loading === account.login;
            return (
              <Card
                key={account.login}
                className="cursor-pointer hover:-translate-y-[2px] transition-all duration-300 border-[#e8ecef]"
                onClick={() => !loading && handleQuickLogin(account)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${account.color} rounded-[12px] flex items-center justify-center shrink-0 shadow-md`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#333] text-[15px]">{account.label}</h3>
                        {account.label === "Admin" && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                            SUPER_ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#6c757d] mt-0.5">{account.description}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#999] font-mono">
                        <span>Login: {account.login}</span>
                        <span>Pass: {account.password}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#ccc] shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-[12px] text-[#999]">
            This page is for development only. Remove before production deployment.
          </p>
          <a
            href="/login"
            className="text-[13px] text-[#F27023] hover:underline mt-2 inline-block font-medium"
          >
            Go to regular login page
          </a>
        </div>
      </div>
    </div>
  );
}
