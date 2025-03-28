import {NextResponse} from "next/server";
import {BlogMModel, MentorModel, NotionModel} from "@/model/model";
import connectDB from "@/lib/db"
import { getServerSession, User } from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options"
import { aiWrapper } from "@/lib/aiwrapper";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
      await connectDB();
      const { title, content, attachments, links, tags, notionId } = await req.json();
      
      const session = await getServerSession(authOptions);
      const user: User = session?.user as User;
      
      if (!session || !user) {
        return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
      }
      
      const userId = new mongoose.Types.ObjectId(user.id);

      const aiDesc = await aiWrapper(title, content);
      
      const blog = await BlogMModel.create({
        author: user.id,
        title,
        content,
        attachments,
        links,
        tags,
        notionId,
        likes: [{
          user: user.id,
          userType: "Entrepreneur" 
        }],
        blogAI: aiDesc
      });

      if(!blog) {
        return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
      }
      const notion = await NotionModel.findById(notionId);
      if(!notion) {
        return NextResponse.json({ error: 'Notion not found' }, { status: 404 });
      }

      await MentorModel.updateOne({ _id: userId}, { $addToSet: { blogs: blog._id } });
      await notion.updateOne({ $push: { blogsM: blog._id } });
      
      
      return NextResponse.json(blog, { status: 200 });
    } catch (error) {
      console.error('Error creating blog:', error);
      return NextResponse.json({ 
        error: 'Failed to create blog post', 
      }, { status: 500 });
    }
  }

// export async function PATCH(req: Request) {
//     try {
//       await connectDB();
//       const { id, title, content, attachments, links, tags } = await req.json();
      
//       const session = await getServerSession(authOptions);
//       const user: User = session?.user as User;
      
//       if (!session || !user) {
//         return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
//       }

//       const blog = await BlogMModel.findOneAndUpdate({ _id: id, author: user.id }, {
//         title,
//         content,
//         attachments,
//         links,
//         tags,
//       }, { new: true });

//       if(!blog) {
//         return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
//       }
      
//       return NextResponse.json({ 
//         success: true, 
//         message: 'Blog updated successfully', 
//         data: blog 
//       }, { status: 200 });
//     } catch (error) {
//       console.error('Error updating blog:', error);
//       return NextResponse.json({ 
//         error: 'Failed to update blog post', 
//         details: (error as any).message 
//       }, { status: 500 });
//     }
//   }

export async function DELETE(req: Request) {
    try {
      await connectDB();
      const { id } = await req.json();
      
      const session = await getServerSession(authOptions);
      const user: User = session?.user as User;
      
      if (!session || !user) {
        return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
      }

      const blog = await BlogMModel.findOneAndDelete({ _id: id, author: user.id });

      if(!blog) {
        return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
      }

      const b = await BlogMModel.findOne({ _id: id, author: user.id });
      if(!b) {
        return NextResponse.json({ error: 'Unauthorized. User cannot delete another user\'s blog post.' }, { status: 401 });
      }
      const notion = await NotionModel.findOne({ _id: b.notionId });

      if(notion) {
        await NotionModel.deleteOne({ _id: b.notionId });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Blog deleted successfully', 
        data: blog 
      }, { status: 200 });
    } catch (error) {
      console.error('Error deleting blog:', error);
      return NextResponse.json({ 
        error: 'Failed to delete blog post', 
      }, { status: 500 });
    }
  }

export async function GET(req: Request) {
    try {
      await connectDB();
      const { id } = await req.json();
      
      const blog = await BlogMModel 
        .findById(id)
        .populate('author', 'name email')
        .populate('likes.user', 'name email')
        .limit(10)
        .exec();

      if(!blog) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Blog post found', 
        data: blog 
      }, { status: 200 });
    } catch (error) {
      console.error('Error fetching blog:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch blog post', 
      }, { status: 500 });
    }
  }