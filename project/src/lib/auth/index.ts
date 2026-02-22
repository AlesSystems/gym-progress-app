import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        magicToken: { label: "Magic Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Magic token flow
        if (credentials.magicToken) {
          const verToken = await db.verificationToken.findUnique({
            where: { token: credentials.magicToken },
          });

          if (!verToken || verToken.expiresAt < new Date()) return null;

          await db.verificationToken.delete({ where: { id: verToken.id } });

          const user = await db.user.findUnique({
            where: { email: verToken.email },
          });

          if (!user) return null;

          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return { id: user.id, email: user.email, name: user.name };
        }

        // Email/password flow
        if (!credentials.email || !credentials.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};

