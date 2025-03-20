import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { EntrepreneurModel } from "@/model/model";
import connectDB from "@/lib/db";

// Function to generate a 6-digit verification code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Function to send a verification email
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
  try {
    await connectDB();
    const { username, name, email, password, profileImage } = await req.json();

    // ✅ Ensure all required fields are present
    if (!username || !name || !email || !password || !profileImage) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await EntrepreneurModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Entrepreneur already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();

    const entrepreneur = new EntrepreneurModel({
      username,
      name,
      email,
      password: hashedPassword,
      profileImage,
      verificationCode,
    });

    await entrepreneur.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ message: "Entrepreneur registered successfully. Verification email sent." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
