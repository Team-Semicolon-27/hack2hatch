import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import {EntrepreneurModel, MentorModel} from "@/model/model";
import bcrypt from "bcryptjs";

export const authOptions = {
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
          
          let user = await EntrepreneurModel.findOne({ email: credentials.email });
          let userType = "entrepreneur";
          
          if (!user) {
            user = await MentorModel.findOne({ email: credentials.email });
            userType = "mentor";
          }
          
          if (!user) throw new Error("User not found");
          
          if (!user.isVerified) throw new Error("Please verify your email first");
          
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) throw new Error("Invalid credentials");
          
          return {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
            profileImage: user.profileImage,
            userType,
            isVerified: user.isVerified,
            interestedTopics:user.interestedTopics,
          };
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : "Something went wrong");
        }
      },
    }),
  ],
  callbacks: {
    //@ts-expect-error abc
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.name = user.name;
        token.profileImage = user.profileImage;
        token.userType = user.userType;
        token.isVerified = user.isVerified;
        token.interestedTopics=user.interestedTopics
      }
      return token;
    },
    
    //@ts-expect-error abc
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.profileImage = token.profileImage;
        session.user.userType = token.userType;
        session.user.isVerified = token.isVerified;
        session.user.interestedTopics=token.interestedTopics;
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