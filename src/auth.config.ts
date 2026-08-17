import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the auth config — used by middleware, which can't
// bundle Prisma or bcrypt. The full config (with the Credentials provider
// and Prisma adapter) lives in src/auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
