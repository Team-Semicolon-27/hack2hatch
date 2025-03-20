import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

async function testEmail() {
    try {
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: "your-email@example.com",
            subject: "Test Email",
            text: "This is a test email",
        });
        console.log("✅ Test Email Sent:", info.messageId);
    } catch (error) {
        console.error("❌ Error Sending Test Email:", error);
    }
}

testEmail();
