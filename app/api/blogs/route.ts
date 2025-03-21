import {NextResponse} from "next/server";
import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {BlogEModel, BlogMModel} from "@/model/model";

export async function GET() {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const blogE = await BlogEModel.aggregate([
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
                username: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$author",
      },
      {
        $lookup: {
          from: "notions",
          localField: "notionId",
          foreignField: "_id",
          as: "notion",
          pipeline: [
            {
              $project: {
                title: 1,
                logo: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$notion",
      },
      {
        $addFields: {
          likesCount: {
            $size: "$likes",
          }
        }
      },
      {
        $project: {
          author: 1,
          notion: 1,
          title: 1,
          content: 1,
          attachments: 1,
          links: 1,
          tags: 1,
          likesCount: 1,
        }
      }
    ])
    
    const blogM = await BlogMModel.aggregate([
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
                username: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$author",
      },
      {
        $lookup: {
          from: "notions",
          localField: "notionId",
          foreignField: "_id",
          as: "notion",
          pipeline: [
            {
              $project: {
                title: 1,
                logo: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$notion",
      },
      {
        $addFields: {
          likesCount: {
            $size: "$likes",
          }
        }
      },
      {
        $project: {
          author: 1,
          notion: 1,
          title: 1,
          content: 1,
          attachments: 1,
          links: 1,
          tags: 1,
          likesCount: 1,
        }
      }
    ])
    
    return NextResponse.json({ blogM, blogE }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}