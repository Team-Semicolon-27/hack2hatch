import { NextResponse } from "next/server";
import { BlogEModel, NotionModel, BlogMModel } from "@/model/model";
import connectDB from "@/lib/db";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: Promise<{ blogId: string }> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    
    if (!session || !user) {
      return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    const { blogId } = await params;
    const objectId = new mongoose.Types.ObjectId(blogId);
    let type = "entrepreneur";
    
    let blog = await BlogEModel.aggregate([
      {
        $match: {
          _id: objectId
        }
      },
      {
        $lookup: {
          from: "entrepreneurs",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                name: 1,
                username: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$author"
      },
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
          pipeline: [
            {
              $lookup: {
                from: "entrepreneurs",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      username: 1
                    }
                  }
                ]
              }
            },
            {
              $unwind: "$author"
            },
            {
              $project:{
                author: 1,
                content: 1,
                likes: 1,
                createdAt: 1,
              }
            }
          ]
        }
      },
      {
        $project: {
          author: 1,
          title: 1,
          content: 1,
          attachments: 1,
          likes: 1,
          comments: 1,
          links: 1,
          tags: 1,
          blogAI: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      }
    ])
    
    if (!blog.length) {
      blog = await BlogMModel.aggregate([
        {
          $match: {
            _id: blogId
          }
        },
        {
          $lookup: {
            from: "mentors",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1
                }
              }
            ]
          }
        },
        {
          $unwind: "$author"
        },
        {
          $lookup: {
            from: "comments",
            localField: "comments",
            foreignField: "_id",
            as: "comments",
            pipeline: [
              {
                $lookup: {
                  from: "entrepreneurs",
                  localField: "author",
                  foreignField: "_id",
                  as: "author",
                  pipeline: [
                    {
                      $project: {
                        name: 1,
                        username: 1
                      }
                    }
                  ]
                }
              },
              {
                $unwind: "$author"
              },
              {
                $project:{
                  author: 1,
                  content: 1,
                  likes: 1,
                  createdAt: 1,
                }
              }
            ]
          }
        },
        {
          $project: {
            author: 1,
            title: 1,
            content: 1,
            attachments: 1,
            likes: 1,
            comments: 1,
            links: 1,
            tags: 1,
            blogAI: 1,
            createdAt: 1,
            updatedAt: 1,
          }
        }
      ])
      
      type = "mentor"
    }
    
    if (!blog.length) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    return NextResponse.json({ blog: blog[0], type, userId}, { status: 200 });
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
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    let blog = await BlogEModel.findOne({ _id: blogId, author: userId });
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