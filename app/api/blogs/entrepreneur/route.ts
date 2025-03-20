import mongoose, { mongo } from "mongoose";
import {NextResponse} from "next/server";
import { BlogE, BlogEModel, NotionModel } from "../../../../model/model";
import { EntrepreneurModel } from "../../../../model/model";
import connectDB from "@/lib/db"
import { getServerSession, User } from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route"
import { aiWrapper } from "@/lib/aiwrapper";

export async function POST(req: Request) {
    try {
      await connectDB();
      const { title, content, attachments, links, tags, notionId } = await req.json();
      
      const session = await getServerSession(authOptions);
      const user: User = session?.user as User;
      
      if (!session || !user) {
        return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
      }

      const aiDesc = await aiWrapper(title, content);

      const blog = await BlogEModel.create({
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

      await notion.updateOne({ $push: { blogIds: blog.id } });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Blog created successfully', 
        data: blog 
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating blog:', error);
      return NextResponse.json({ 
        error: 'Failed to create blog post', 
        details: (error as any).message 
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