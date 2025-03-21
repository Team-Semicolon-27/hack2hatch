import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { EntrepreneurModel, MentorModel } from "@/model/model";

export async function PUT(req: Request) {
  try {
    await connectDB(); // Ensure MongoDB is connected

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interestedTopics } = await req.json();
    if (!Array.isArray(interestedTopics)) {
      return NextResponse.json(
        { error: "Invalid input. interestedTopics must be an array." },
        { status: 400 }
      );
    }

    // Find the user in both collections
    const entrepreneur = await EntrepreneurModel.findOne({ email: session.user.email });
    const mentor = await MentorModel.findOne({ email: session.user.email });

    let updatedUser = null;

    if (entrepreneur) {
      updatedUser = await EntrepreneurModel.findOneAndUpdate(
        { email: session.user.email },
        { interestedTopics },
        { new: true }
      );
    } else if (mentor) {
      updatedUser = await MentorModel.findOneAndUpdate(
        { email: session.user.email },
        { interestedTopics },
        { new: true }
      );
    } else {
      return NextResponse.json(
        { error: "User not found in either model." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Topics updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating interested topics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
