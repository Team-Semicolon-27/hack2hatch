import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      name: string;
      profileImage: string;
      userType: "entrepreneur" | "mentor";
      isVerified: boolean;
      interestedTopics :string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string;
    name: string;
    profileImage: string;
    userType: "entrepreneur" | "mentor";
    isVerified: boolean;
    interestedTopics :string[];
  }
}
