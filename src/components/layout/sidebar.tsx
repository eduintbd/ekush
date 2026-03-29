"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  ArrowLeftRight,
  FileText,
  User,
  HelpCircle,
  FolderOpen,
  BookOpen,
  Bell,
  ChevronLeft,
  ChevronRight,
  Target,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/portfolio/goals", label: "Goals", icon: Target },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/sip", label: "SIP Plans", icon: RefreshCw },
  { href: "/statements", label: "Statements", icon: FileText },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/support", label: "Support", icon: HelpCircle },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[rgba(0,0,0,0.95)] backdrop-blur-[10px] text-white transition-all duration-300 flex flex-col",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-gradient-to-r from-[#F27023] to-[#e85d04] rounded-[10px] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-[0_4px_15px_rgba(242,112,35,0.3)]">
          E
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-[14px] text-white">Ekush WML</h1>
            <p className="text-[10px] text-white/40 tracking-wider uppercase">Investor Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/portfolio/goals" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-[#F27023]/20 to-[#F27023]/10 text-[#F27023] border border-[#F27023]/20"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-[#F27023]")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-3 border-t border-white/10 text-white/30 hover:text-[#F27023] transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
