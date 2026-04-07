import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes - check for admin roles
    if (path.startsWith("/admin")) {
      const adminRoles = ["ADMIN", "MANAGER", "COMPLIANCE", "SUPPORT", "SUPER_ADMIN"];
      if (!token?.role || !adminRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // KYC onboarding redirect disabled for development
    // Uncomment below for production:
    // if (token?.status === "PENDING" && !path.startsWith("/onboarding") && !path.startsWith("/api")) {
    //   return NextResponse.redirect(new URL("/onboarding", req.url));
    // }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/transactions/:path*",
    "/statements/:path*",
    "/profile/:path*",
    "/support/:path*",
    "/documents/:path*",
    "/learn/:path*",
    "/notifications/:path*",
    "/sip/:path*",
    "/admin/:path*",
  ],
};
