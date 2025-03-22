import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {NextResponse} from "next/server";
import mongoose from "mongoose";
import {EntrepreneurModel, MentorModel} from "@/model/model";

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
      const notifications = await EntrepreneurModel.aggregate([
        {
          $match: {
            _id: userId
          },
        },
        {
          $lookup: {
            from: "notifications",
            localField: "notifications",
            foreignField: "_id",
            as: "notifications",
          }
        },
        {
          $project: {
            notifications: 1
          }
        }
      ])
      
      if (notifications.length === 0) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
      }
      
      await EntrepreneurModel.updateOne(
        {
          _id: userId
        },
        {
          $set: { notificationCount: 0 }
        }
      )
      
      return NextResponse.json(notifications[0].notifications, { status: 200 });
    } else {
      const notifications = await MentorModel.aggregate([
        {
          $match: {
            _id: userId
          },
        },
        {
          $lookup: {
            from: "notifications",
            localField: "notifications",
            foreignField: "_id",
            as: "notifications",
          }
        },
        {
          $project: {
            notifications: 1
          }
        }
      ])
      
      if (notifications.length === 0) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
      }
      
      await MentorModel.updateOne(
        {
          _id: userId
        },
        {
          $set: { notificationCount: 0 }
        }
      )
      
      return NextResponse.json(notifications[0].notifications, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}