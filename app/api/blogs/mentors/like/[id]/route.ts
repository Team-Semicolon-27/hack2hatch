import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";
import {BlogEModel, BlogMModel} from "@/model/model";

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
    
    if (user.userType === "entrepreneur") {
      const blog = await BlogMModel.updateOne(
        { _id: objectId },
        { $addToSet: { likes: { user: userId, userType: "Entrepreneur" } } } ,
      );
      
      if (!blog) {
        return NextResponse.json({ error: "blog not found" }, { status: 404 });
      }
      
      if (!blog.modifiedCount) {
        return NextResponse.json({ error: "already not liked" }, { status: 403 });
      }
      
      return NextResponse.json({ status: 200 });
    } else {
      const blog = await BlogMModel.updateOne(
        { _id: objectId },
        { $addToSet: { likes: { user: userId, userType: "Mentor" } } } ,
      );
      
      if (!blog) {
        return NextResponse.json({ error: "blog not found" }, { status: 404 });
      }
      
      if (!blog.modifiedCount) {
        return NextResponse.json({ error: "already not liked" }, { status: 403 });
      }
      
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
      const blog = await BlogMModel.updateOne(
        { _id: objectId },
        { $pull: { likes: { user: userId, userType: "Entrepreneur" } } } ,
      );
      
      if (!blog) {
        return NextResponse.json({ error: "blog not found" }, { status: 404 });
      }
      
      if (!blog.modifiedCount) {
        return NextResponse.json({ error: "already not liked" }, { status: 403 });
      }
      
      return NextResponse.json({ status: 200 });
    } else {
      const blog = await BlogMModel.updateOne(
        { _id: objectId },
        { $pull: { likes: { user: userId, userType: "Mentor" } } } ,
      );
      
      if (!blog) {
        return NextResponse.json({ error: "blog not found" }, { status: 404 });
      }
      
      if (!blog.modifiedCount) {
        return NextResponse.json({ error: "already not liked" }, { status: 403 });
      }
      
      return NextResponse.json({ status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}