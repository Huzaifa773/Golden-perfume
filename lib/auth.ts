// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        if (user.isActive === false) {
          throw new Error("Account disabled");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) throw new Error("Invalid email or password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || "CUSTOMER",
          isAdmin: user.role === "ADMIN",
          image: user.image || "",
          phone: user.phone || "",
          createdAt: user.createdAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
        token.phone = user.phone;
        token.createdAt = user.createdAt;
      }

      // User delete hone par token invalid karein
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, isActive: true, role: true },
        });

        if (!dbUser || dbUser.isActive === false) {
          return {} as any;
        }

        if (dbUser.role !== token.role) {
          token.role = dbUser.role;
          token.isAdmin = dbUser.role === "ADMIN";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        return { ...session, user: undefined } as any;
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isAdmin = token.isAdmin;
        session.user.phone = token.phone;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "luxury-perfume-secret-key-2026-secure-token",
};