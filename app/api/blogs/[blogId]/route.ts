import { NextResponse } from "next/server";
import { BlogEModel, NotionModel, BlogMModel } from "@/model/model";
import connectDB from "@/lib/db";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ blogId: string }> }) {
    try {
        await connectDB();
        const { blogId } = await params;
        
        let blog = await BlogEModel
            .findById(blogId)
            .populate('author', 'name email')
            .populate('likes.user', 'name email')
            .exec();
            
        if (!blog) {
            blog = await BlogMModel
                .findById(blogId)
                .populate('author', 'name email')
                .populate('likes.user', 'name email')
                .exec();
        }
        
        if (!blog) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }
        
        return NextResponse.json(blog, { status: 200 });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json({
            error: 'Failed to fetch blog post',
        }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ blogId: string }> }) {
    try {
        await connectDB();
        const { blogId } = await params;
        
        const session = await getServerSession(authOptions);
        const user: User = session?.user as User;
        
        if (!session || !user) {
            return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
        }
        
        let blog = await BlogEModel.findOne({ _id: blogId, author: user.id });
        let BlogModel = BlogEModel;
        
        if (!blog) {
            blog = await BlogMModel.findOne({ _id: blogId, author: user.id });
            BlogModel = BlogMModel;
        }
        
        if (!blog) {
            return NextResponse.json({ error: 'Unauthorized. User cannot delete another user\'s blog post or blog not found.' }, { status: 401 });
        }
        
        const notion = await NotionModel.findOne({ _id: blog.notionId });
        if (notion) {
            await NotionModel.deleteOne({ _id: blog.notionId });
        }
        
        const deletedBlog = await BlogModel.findOneAndDelete({ _id: blogId, author: user.id });
        
        return NextResponse.json({ 
            success: true, 
            message: 'Blog deleted successfully', 
            data: deletedBlog 
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json({ 
            error: 'Failed to delete blog post', 
        }, { status: 500 });
    }
}