import { NextResponse } from "next/server";
import { MentorModel, EntrepreneurModel } from "@/model/model"; 
import connectDB from "@/lib/db";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, code } = await req.json();
        if (!email || !code) return NextResponse.json({ error: "Email and code are required" }, { status: 400 });

        const user = await MentorModel.findOne({ email }) || await EntrepreneurModel.findOne({ email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

        if (String(user.verificationCode).trim() !== String(code).trim()) {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        if (user.isVerified) {
            return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
        }

        user.isVerified = true;
        user.verificationCode = "dummy";
        await user.save();

        return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
