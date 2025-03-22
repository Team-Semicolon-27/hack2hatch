import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {NextResponse} from "next/server";
import mongoose from "mongoose";
import {Entrepreneur, EntrepreneurModel, Mentor, MentorModel} from "@/model/model";

export async function GET() {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    if (user.userType === "entrepreneur") {
      const entrepreneur: Entrepreneur|null = await EntrepreneurModel.findById(userId)
      
      if (!entrepreneur) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
      }
      
      return NextResponse.json(entrepreneur.notificationCount, { status: 200 });
    } else {
      const mentor: Mentor|null = await MentorModel.findById(userId)
      
      if (!mentor) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
      }
      
      return NextResponse.json(mentor.notificationCount, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}