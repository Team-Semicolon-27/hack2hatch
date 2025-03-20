import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/lib/models/User";
import connectDB from "@/lib/db";
import nodemailer from "nodemailer";


const generateCode =() => Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationEmail = async (email: string, code: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === "true", // Use `false` for port 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"Your App Name" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your email",
        text: `Your verification code is ${code}`,
        html: `<p>Your verification code is <strong>${code}</strong></p>`,
    });
};


export async function POST(req: Request) {
    try{
        await connectDB();
         const{email,password}=await req.json();
         if(!email||!password) return NextResponse.json({ error : "Email and password are required" }, { status: 400 });

         const existingUser = await User.findOne({ email });
         if (existingUser) return NextResponse.json({ error: "User already exists" }, { status: 400 });

         const hashedPassword = await bcrypt.hash(password, 10);
            const verificationCode = generateCode();

        const user = new User({
            email,
            password: hashedPassword,
            verificationCode
        })
        await user.save();

        await sendVerificationEmail(email, verificationCode);
        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    }
    catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}