"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  userName?: string;
  investorCode?: string;
}

export function TopBar({ userName, investorCode }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-[10px] border-b border-[#e8ecef] px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[#333]">
            Welcome, {userName || "Investor"}
          </h2>
          {investorCode && (
            <p className="text-[11px] text-[#6c757d] tracking-wide">ID: {investorCode}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2.5 text-[#6c757d] hover:text-[#F27023] hover:bg-[#F27023]/5 rounded-[10px] transition-all duration-200"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F27023] rounded-full" />
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className="p-2.5 text-[#6c757d] hover:text-[#F27023] hover:bg-[#F27023]/5 rounded-[10px] transition-all duration-200"
          >
            <User className="w-[18px] h-[18px]" />
          </Link>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#6c757d] hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-all duration-200 ml-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
