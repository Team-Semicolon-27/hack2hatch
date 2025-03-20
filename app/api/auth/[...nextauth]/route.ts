
// abhi ke liye this page might cause linting errors will fix
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/lib/models/User";
import connectDB from "@/lib/db";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();
          if (!credentials) throw new Error("Missing credentials");
          const user = await User.findOne({ email: credentials.email });

          if (!user) throw new Error("User not found");

          if (!user.isVerified) throw new Error("Please verify your email first");

          const isValidPassword = await bcrypt.compare(credentials!.password, user.password);
          if (!isValidPassword) throw new Error("Invalid credentials");

          return {
            id: user._id.toString(),
            email: user.email,
            isVerified: user.isVerified,
          };
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : "Something went wrong");
        }
      },
    }),
  ],
  callbacks:{
    async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.isVerified = user.isVerified;
        }
        return token;
      },

      async session({ session, token }) {
        if (token) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.isVerified = token.isVerified;
        }
        return session;
      },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
