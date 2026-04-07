import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Investor Code or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Please provide login credentials");
        }

        const login = credentials.login.trim();

        try {
          // Single query with OR — replaces 3 sequential queries
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: login },
                { phone: login },
                { investor: { investorCode: login.toUpperCase() } },
              ],
            },
            include: { investor: true },
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error("Account is temporarily locked. Please try again later.");
          }

          // Verify password
          const isValid = await compare(credentials.password, user.passwordHash);

          if (!isValid) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: { increment: 1 },
                ...(user.failedLoginCount >= 4
                  ? { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) }
                  : {}),
              },
            });
            throw new Error("Invalid credentials");
          }

          if (user.status === "SUSPENDED" || user.status === "CLOSED") {
            throw new Error("Account is not active. Please contact support.");
          }

          // Reset failed login count
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: (user as any).investor?.name ?? "User",
            role: user.role,
            status: user.status,
            investorId: (user as any).investor?.id,
            investorCode: (user as any).investor?.investorCode,
          };
        } catch (e: any) {
          if (e.message === "Invalid credentials" || e.message.includes("locked") || e.message.includes("not active")) {
            throw e;
          }
          console.error("Auth error:", e.message);
          throw new Error("Authentication failed. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.investorId = (user as any).investorId;
        token.investorCode = (user as any).investorCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
        (session.user as any).investorId = token.investorId;
        (session.user as any).investorCode = token.investorCode;
      }
      return session;
    },
  },
};
