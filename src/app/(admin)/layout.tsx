import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuthProvider } from "@/components/layout/session-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;
  const adminRoles = ["ADMIN", "MANAGER", "COMPLIANCE", "SUPPORT", "SUPER_ADMIN"];

  if (!adminRoles.includes(role)) {
    redirect("/dashboard");
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* Admin Nav - dark with orange accents */}
        <nav className="bg-[rgba(0,0,0,0.95)] backdrop-blur-[10px] text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#F27023] to-[#e85d04] rounded-[8px] flex items-center justify-center font-bold text-white text-sm shadow-[0_4px_15px_rgba(242,112,35,0.3)]">
              E
            </div>
            <span className="font-semibold text-[14px]">Ekush WML <span className="text-[#F27023]">Admin</span></span>
          </div>
          <div className="flex items-center gap-6 text-[13px] font-medium">
            <a href="/admin/dashboard" className="text-white/60 hover:text-[#F27023] transition-colors">Dashboard</a>
            <a href="/admin/investors" className="text-white/60 hover:text-[#F27023] transition-colors">Investors</a>
            <a href="/admin/approvals" className="text-white/60 hover:text-[#F27023] transition-colors">Approvals</a>
            <a href="/admin/nav-entry" className="text-white/60 hover:text-[#F27023] transition-colors">NAV Entry</a>
            <a href="/admin/tickets" className="text-white/60 hover:text-[#F27023] transition-colors">Tickets</a>
            <a href="/admin/content" className="text-white/60 hover:text-[#F27023] transition-colors">Content</a>
            <a href="/admin/audit-log" className="text-white/60 hover:text-[#F27023] transition-colors">Audit Log</a>
            <a href="/dashboard" className="text-[#F27023] hover:text-[#ffcfb2] transition-colors">Portal</a>
          </div>
        </nav>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
