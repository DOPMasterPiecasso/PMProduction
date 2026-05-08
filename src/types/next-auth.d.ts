import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      avatarInitial: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    avatarInitial: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    avatarInitial: string;
  }
}
