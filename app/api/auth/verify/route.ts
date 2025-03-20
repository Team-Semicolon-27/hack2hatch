import { NextResponse } from "next/server";
import User from "@/lib/models/User"
import connectDB from "@/lib/db";

export async function POST(req: Request){
    try{ 
        await connectDB();
        const{email,code}= await req.json();
        if (!email || !code) return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
        const user = await User.findOne({email});
        if (!user || user.VerificationCode !== code) {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
          }

          user.isVerified = true;
          user.VerificationCode = "";
          await user.save();

          return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}