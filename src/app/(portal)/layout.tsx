import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { AuthProvider } from "@/components/layout/session-provider";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f8f9fa]">
        <Sidebar />
        <div className="ml-[260px] transition-all duration-300">
          <TopBar
            userName={user?.name}
            investorCode={user?.investorCode}
          />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
