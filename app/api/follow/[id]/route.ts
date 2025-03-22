import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";
import {EntrepreneurModel, MentorModel, NotificationModel} from "@/model/model";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "id not found" }, { status: 403 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "id not valid" }, { status: 403 });
    }
    
    const objectId = new mongoose.Types.ObjectId(id);
    
    const notification = await NotificationModel.create({
      message: `${user.username} has started following you`,
      link: `profile/${userId}`
    })
    
    if (user.userType === "entrepreneur") {
      const otherUser = await EntrepreneurModel.updateOne(
        { _id: objectId },
        {
          $inc: { notificationCount: 1 },
          $addToSet: { followers: userId, notifications: notification._id }
        },
      );
      
      if (!otherUser) {
        return NextResponse.json({ error: "no user found" }, { status: 404});
      }
      
      await EntrepreneurModel.updateOne(
        { _id: userId },
        { $addToSet: { followings: objectId } },
      );
      
      return NextResponse.json({ status: 200 });
    } else {
      const otherUser = await EntrepreneurModel.updateOne(
        { _id: objectId },
        {
          $inc: { notificationCount: 1 },
          $addToSet: { mentorFollowers: userId, notifications: notification._id }
        },
      );
      
      if (!otherUser) {
        return NextResponse.json({ error: "no user found" }, { status: 404});
      }
      
      await MentorModel.updateOne(
        { _id: userId },
        { $addToSet: { followings: objectId } },
      );
      
      return NextResponse.json({ status: 200 });
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "id not found" }, { status: 403 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "id not valid" }, { status: 403 });
    }
    
    const objectId = new mongoose.Types.ObjectId(id);
    
    if (user.userType === "entrepreneur") {
      const otherUser = await EntrepreneurModel.updateOne(
        { _id: objectId },
        { $pull: { followers: userId } },
      );
      
      if (!otherUser) {
        return NextResponse.json({ error: "no user found" }, { status: 404});
      }
      
      await EntrepreneurModel.updateOne(
        { _id: userId },
        { $pull: { followings: objectId } },
      );
      
      return NextResponse.json({ status: 200 });
    } else {
      const otherUser = await EntrepreneurModel.updateOne(
        { _id: objectId },
        { $pull: { mentorFollowers: userId } },
      );
      
      if (!otherUser) {
        return NextResponse.json({ error: "no user found" }, { status: 404});
      }
      
      await MentorModel.updateOne(
        { _id: userId },
        { $pull: { followings: objectId } },
      );
      
      return NextResponse.json({ status: 200 });
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}

