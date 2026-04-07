import { createClient } from "./supabase/server";

export type AppSession = {
  user: {
    id: string;
    role: string;
    status: string;
    investorId?: string;
    investorCode?: string;
    name?: string;
    email?: string;
  };
} | null;

/**
 * Returns the current session from Supabase Auth.
 * Drop-in replacement for getServerSession(authOptions).
 * User metadata (role, status, investorId, investorCode) is stored in
 * Supabase user_metadata at login time.
 */
export async function getSession(): Promise<AppSession> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    user: {
      id: (meta.prismaUserId as string) ?? user.id,
      role: (meta.role as string) ?? "INVESTOR",
      status: (meta.status as string) ?? "ACTIVE",
      investorId: meta.investorId as string | undefined,
      investorCode: meta.investorCode as string | undefined,
      name: meta.name as string | undefined,
      email: user.email,
    },
  };
}
