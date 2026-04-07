"use client";

import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  userName?: string;
  investorCode?: string;
  userImage?: string;
}

export function TopBar({ userName, investorCode, userImage }: TopBarProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-white px-6 py-3">
      <div className="flex items-center justify-end">
        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-[50px] h-[50px] rounded-full bg-page-bg border-2 border-transparent hover:border-ekush-orange transition-colors overflow-hidden flex items-center justify-center"
          >
            {userImage ? (
              <img src={userImage} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-text-body" />
            )}
          </button>

          {/* Dropdown */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-[60px] z-50 w-[215px] bg-navy rounded-[5px] p-6 shadow-lg">
                {/* Triangle */}
                <div className="absolute -top-[10px] right-4 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[12px] border-l-transparent border-r-transparent border-b-navy" />
                <div className="text-center mb-4">
                  <div className="w-[60px] h-[60px] rounded-full bg-white/20 mx-auto mb-2 flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white text-[14px] font-medium">{userName || "Investor"}</p>
                  {investorCode && (
                    <p className="text-white/60 text-[12px]">ID: {investorCode}</p>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-white/80 hover:text-white rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
