import mongoose, { mongo } from "mongoose";
import {NextResponse} from "next/server";
import { Blog, BlogModel } from "../../../../model/model";
import { EntrepreneurModel } from "../../../../model/model";
import connectDB from "@/lib/db"
import { getServerSession, User } from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
    try {
      await connectDB();
      const { title, content, attachments, links, tags, notionId } = await req.json();
      
      const session = await getServerSession(authOptions);
      const user: User = session?.user as User;
      
      if (!session || !user) {
        return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
      }
      
      const blog = await BlogModel.create({
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
        }]
      });

      if(!blog) {
        return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
      }
      
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

export async function PATCH(req: Request) {
    try {
      await connectDB();
      const { id, title, content, attachments, links, tags } = await req.json();
      
      const session = await getServerSession(authOptions);
      const user: User = session?.user as User;
      
      if (!session || !user) {
        return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
      }

      const blog = await BlogModel.findOneAndUpdate({ _id: id, author: user.id }, {
        title,
        content,
        attachments,
        links,
        tags,
      }, { new: true });

      if(!blog) {
        return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Blog updated successfully', 
        data: blog 
      }, { status: 200 });
    } catch (error) {
      console.error('Error updating blog:', error);
      return NextResponse.json({ 
        error: 'Failed to update blog post', 
        details: (error as any).message 
      }, { status: 500 });
    }
  }

export async function DELETE(req: Request) {
    try {
      await connectDB();
      const { id } = await req.json();
      
      const session = await getServerSession(authOptions);
      const user: User = session?.user as User;
      
      if (!session || !user) {
        return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
      }

      const blog = await BlogModel.findOneAndDelete({ _id: id, author: user.id });

      if(!blog) {
        return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
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
        details: (error as any).message 
      }, { status: 500 });
    }
  }

export async function GET(req: Request) {
    try {
      await connectDB();
      const { id } = await req.json();
      
      const blog = await BlogModel 
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
        details: (error as any).message 
      }, { status: 500 });
    }
  }