import {NextResponse} from "next/server";
import { BlogEModel, NotionModel } from "@/model/model";
import connectDB from "@/lib/db"
import { getServerSession, User } from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route"
import { aiWrapper } from "@/lib/aiwrapper";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
      await connectDB();
      
      const session = await getServerSession(authOptions);
      const user: User = session?.user as User;
      
      if (!session || !user) {
        return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
      }
      
      const userId = new mongoose.Types.ObjectId(user.id);
      
      const { title, content, attachments, links, tags, notionId } = await req.json();
      
      const notion = await NotionModel.findById(notionId);
      if(!notion) {
        return NextResponse.json({ error: 'Notion not found' }, { status: 404 });
      }
      
      
      const aiDesc = await aiWrapper(title, content);

      const blog = await BlogEModel.create({
        author: userId,
        title,
        content,
        attachments,
        links,
        tags,
        notionId,
        blogAI: aiDesc
      });

      if(!blog) {
        return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
      }
      
      await notion.updateOne({ $push: { blogsE: blog._id } });
      
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

//       const blog = await BlogEModel.findOneAndUpdate({ _id: id, author: user.id }, {
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