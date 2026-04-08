import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { CredentialSchema } from "../validation/general";
import { prisma } from "@/app/_lib/constants/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (typeof token.id === "string") session.user.id = token.id;
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      authorize: async (credentials, req) => {
        const zResCreds = CredentialSchema.safeParse(credentials);
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
        return { id: `${user.id}`, email: user.email };
      },
      credentials: {
        email: {},
        password: {}
      }
    })
  ]
});
