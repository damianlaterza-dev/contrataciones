import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "google") {
        return false;
      }

      const googleId = account.providerAccountId;

      const dbUser = await prisma.users.findFirst({
        where: {
          google_id: googleId,
          deleted_at: null,
        },
      });
      // FOR DEVELOPMENT ONLY
      if (!dbUser) {
        if (process.env.NODE_ENV === "development") {
          return true;
        }
        return false; // 🚫 403
      }

      await prisma.users.update({
        where: { id: dbUser.id },
        data: {
          image_url: user.image,
          last_login_at: new Date(),
        },
      });

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        // First login, fetch user to get role_id
        const dbUser = await prisma.users.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.role_id = dbUser.role_id;
          token.google_id = dbUser.google_id || "";
          token.db_id = dbUser.id.toString(); // Store DB ID
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role_id = token.role_id as number;
        // Use token.sub as id if available (standard), or token.id if we set it manually.
        // Google provider usually sets "sub" in token.
        // However, we want the DB id (Int), not the Google ID string.
        // We need to pass dbUser.id to token.
        // But wait, token.sub is usually string.
        // Let's attach our db id to token as "db_id" or similar to avoid conflict if needed, or just "id".
        session.user.id = (token.db_id as string) || session.user.id;
      }
      return session;
    },
  },
});
