"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepSigned, setKeepSigned] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { login, password, redirect: false });
      if (result?.error) setError(result.error);
      else { router.push("/dashboard"); router.refresh(); }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fa]">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[rgba(0,0,0,0.9)] relative items-center justify-center overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#F27023] rounded-full opacity-10 blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#F27023] rounded-full opacity-5 blur-[120px]" />
        </div>

        <div className="relative z-10 text-center px-12 max-w-lg">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-r from-[#F27023] to-[#e85d04] rounded-[16px] flex items-center justify-center font-bold text-white text-3xl mx-auto mb-8 shadow-[0_8px_30px_rgba(242,112,35,0.4)]">
            E
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ekush Wealth Management
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed">
            Access your investment portfolio, track returns in real-time, and manage your mutual fund holdings — all from one secure portal.
          </p>

          {/* Fund Preview */}
          <div className="mt-10 space-y-3">
            {[
              { code: "EFUF", nav: "14.635", ret: "+108.33%" },
              { code: "EGF", nav: "12.448", ret: "+37.29%" },
              { code: "ESRF", nav: "14.240", ret: "+42.40%" },
            ].map((f) => (
              <div key={f.code} className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-[10px] px-4 py-3 border border-white/10">
                <span className="text-white/80 text-sm font-medium">{f.code}</span>
                <span className="text-white/60 text-sm">NAV {f.nav}</span>
                <span className="text-green-400 text-sm font-semibold">{f.ret}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#F27023] to-[#e85d04] rounded-[12px] flex items-center justify-center font-bold text-white text-2xl shadow-[0_4px_15px_rgba(242,112,35,0.3)]">
                E
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-[#333]">Ekush WML</h1>
                <p className="text-[11px] text-[#6c757d] tracking-wider uppercase">Investor Portal</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#e8ecef] p-8">
            <h2 className="text-[22px] font-bold text-[#333] mb-1">Sign in to your account</h2>
            <p className="text-[14px] text-[#6c757d] mb-6">
              Enter your investor code or email to access your portal
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-[13px] p-3.5 rounded-[10px] mb-5 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Investor Code / Email / Phone"
                placeholder="e.g., A00002 or your email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepSigned}
                    onChange={(e) => setKeepSigned(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e8ecef] text-[#F27023] focus:ring-[#F27023]/20"
                  />
                  <span className="text-[13px] text-[#6c757d]">Keep me Signed in</span>
                </label>
                <a href="#" className="text-[13px] text-[#F27023] hover:underline font-medium">
                  Forgot Password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-[50px] text-[15px]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-[13px] text-[#6c757d]">
                New user?{" "}
                <a href="/onboarding" className="text-[#F27023] hover:underline font-semibold">
                  Register
                </a>
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#999] mt-6">
            Licensed by BSEC | &copy; 2021-{new Date().getFullYear()} Ekush Wealth Management Ltd
          </p>
        </div>
      </div>
    </div>
  );
}
