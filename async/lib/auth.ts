import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * NextAuth config — same pattern as Bluprynt:
 * credentials provider + bcrypt + JWT sessions.
 *
 * The session carries the user's DB id so API routes can
 * scope every query to the logged-in user.
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, creds.email.toLowerCase()));

        if (!user) return null;

        const valid = await bcrypt.compare(creds.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  callbacks: {
    // Put the DB user id into the token on login...
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // ...and expose it on the session object for server code
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
