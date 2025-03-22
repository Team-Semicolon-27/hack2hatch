import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {NextResponse} from "next/server";
import mongoose from "mongoose";
import {MentorModel} from "@/model/model";

export async function GET() {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    const profile = await MentorModel.aggregate([
      {
        $match: {
          _id: userId
        }
      },
      {
        $lookup: {
          from: "notions",
          localField: "notionsPartOf",
          foreignField: "_id",
          as: "notionsPartOf",
          pipeline: [
            {
              $project: {
                title: 1,
                logo: 1,
                description: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "entrepreneurs",
          localField: "followers",
          foreignField: "_id",
          as: "followers",
          pipeline: [
            {
              $project: {
                username: 1,
                name: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "entrepreneurs",
          localField: "followings",
          foreignField: "_id",
          as: "followings",
          pipeline: [
            {
              $project: {
                username: 1,
                name: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "mentors",
          localField: "mentorFollowers",
          foreignField: "_id",
          as: "mentorFollowers",
          pipeline: [
            {
              $project: {
                username: 1,
                name: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "mentors",
          localField: "mentorFollowings",
          foreignField: "_id",
          as: "mentorFollowings",
          pipeline: [
            {
              $project: {
                username: 1,
                name: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "blogms",
          foreignField: "_id",
          localField: "blogs",
          as: "blogs",
          pipeline: [
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
                      logo: 1,
                    }
                  }
                ]
              }
            },
            {
              $unwind: "$notion"
            },
            {
              $project: {
                notion: 1,
                title: 1,
                content: 1,
                tags: 1
              }
            }
          ]
        }
      },
      {
        $project: {
          username: 1,
          name: 1,
          email: 1,
          interestedTopics: 1,
          profileImage: 1,
          notionsPartOf: 1,
          followings: 1,
          followers: 1,
          mentorFollowings: 1,
          mentorFollowers: 1,
          blogs: 1
        }
      }
    ])
    
    if (!profile || profile.length === 0) return NextResponse.json({ error: "no profile found" }, {status: 404});
    
    return NextResponse.json(
      profile[0],
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
