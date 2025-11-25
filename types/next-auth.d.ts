import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    role?: string;
    user?: {
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    email?: string | null;
  }
}
