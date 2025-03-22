// post for creating comment
import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";
import {BlogMModel, CommentModel, MentorCommentModel} from "@/model/model";

export async function POST(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json({ error: "no content" }, { status: 403 });
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    //blogE id
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "id not found" }, { status: 403 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "id not valid" }, { status: 403 });
    }
    
    const objectId = new mongoose.Types.ObjectId(id);
    
    if (user.userType === "entrepreneur") {
      const comment = await CommentModel.create({
        author: userId,
        content
      })
      
      if (!comment) {
        return NextResponse.json({ error: "comment not created" }, { status: 500 });
      }
      
      const blog = await BlogMModel.findByIdAndUpdate(objectId, {
        $addToSet: { comments: comment._id }
      })
      
      if (!blog) {
        return NextResponse.json({ error: "comment not added to blog" }, { status: 500});
      }
      
      const newComment = await CommentModel.findById(comment._id).populate("author", "name username").exec();
      
      return NextResponse.json({newComment, type: "entrepreneur"}, { status: 200 })
    } else {
      const mentorComment = await MentorCommentModel.create({
        author: userId,
        content
      })
      
      if (!mentorComment) {
        return NextResponse.json({ error: "comment not created" }, { status: 500 });
      }
      
      const blog = await BlogMModel.findByIdAndUpdate(objectId, {
        $addToSet: { mentorComments: mentorComment._id }
      })
      
      if (!blog) {
        return NextResponse.json({ error: "comment not added to blog" }, { status: 500});
      }
      
      const newComment = await CommentModel.findById(mentorComment._id).populate("author", "name username").exec();
      
      return NextResponse.json({newComment, type: "mentor"}, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}


// patch for adding like to it
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    //comment id
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "id not found" }, { status: 403 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "id not valid" }, { status: 403 });
    }
    
    const objectId = new mongoose.Types.ObjectId(id);
    
    const comment = await CommentModel.updateOne({
        _id: objectId
      },
      {
        $addToSet: { likes: userId }
    })
    
    if (!comment) {
      return NextResponse.json({ error: "comment not found" }, { status: 500 });
    }
    
    return NextResponse.json({ status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}


// delete for removing like from it
export async function DELETE(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    //comment id
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "id not found" }, { status: 403 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "id not valid" }, { status: 403 });
    }
    
    const objectId = new mongoose.Types.ObjectId(id);
    
    const comment = await CommentModel.updateOne({
        _id: objectId
      },
      {
        $pull: { likes: userId }
      })
    
    if (!comment) {
      return NextResponse.json({ error: "comment not created" }, { status: 500 });
    }
    
    return NextResponse.json({ status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}
