import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email?: string;
      role: string;
      status: string;
      investorId?: string;
      investorCode?: string;
    };
  }

  interface User {
    role: string;
    status: string;
    investorId?: string;
    investorCode?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    status: string;
    investorId?: string;
    investorCode?: string;
  }
}
