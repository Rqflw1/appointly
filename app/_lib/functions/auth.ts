import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SignInSchema } from "../validation/auth";
import { prisma } from "@/app/_lib/constants/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findFirst({
          where: { id: String(token.id) },
          select: { role: true }
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (typeof token.id === "string") session.user.id = token.id;
      if (token.role) session.user.role = token.role as any;
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      authorize: async (credentials) => {
        const zResCreds = SignInSchema.safeParse(credentials);
        if (!zResCreds.success) return null;

        const user = await prisma.user.findFirst({
          where: { email: zResCreds.data.email }
        });
        if (!user) return null;

        const isMatch = await bcrypt.compare(
          zResCreds.data.password,
          user.password
        );
        if (!isMatch) return null;

        return { id: `${user.id}`, email: user.email, role: user.role } as any;
      },
      credentials: {
        email: {},
        password: {}
      }
    })
  ]
});
