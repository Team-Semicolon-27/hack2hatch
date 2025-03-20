import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/lib/models/User";
import connectDB from "@/lib/db";
import nodemailer