import connectDB from "@/lib/db";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import mongoose from "mongoose";
import { EntrepreneurModel, MentorModel} from "@/model/model";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    
    if (!session || !user) {
      return NextResponse.json({ error: 'Unauthorized. User must be logged in.' }, { status: 401 });
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    const { id } = await params;
    const objectId = new mongoose.Types.ObjectId(id);
    let type = "entrepreneur";
    
    let profile = await EntrepreneurModel.aggregate([
      {
        $match: {
          _id: objectId
        }
      },
      {
        $addFields: {
          isFollowed: {
            $or: [
              { $in : [userId, "$followers"]},
              { $in: [userId, "$mentorFollowers"]}
            ]
          }
        }
      },
      {
        $lookup: {
          from: "notions",
          localField: "notionsOwnerOf",
          foreignField: "_id",
          as: "notionsOwnerOf",
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
        $project: {
          username: 1,
          name: 1,
          profileImage: 1,
          notionsOwnerOf: 1,
          notionsPartOf: 1,
          followings: 1,
          followers: 1,
          mentorFollowings: 1,
          mentorFollowers: 1,
          isFollowed: 1,
        }
      }
    ])
    
    if (!profile.length) {
      profile = await MentorModel.aggregate([
        {
          $match: {
            _id: objectId
          }
        },
        {
          $addFields: {
            isFollowed: {
              $or: [
                { $in : [userId, "$followers"]},
                { $in: [userId, "$mentorFollowers"]}
              ]
            }
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
          $project: {
            username: 1,
            name: 1,
            profileImage: 1,
            notionsPartOf: 1,
            followings: 1,
            followers: 1,
            mentorFollowings: 1,
            mentorFollowers: 1,
            isFollowed: 1,
          }
        }
      ])
      
      type = "mentor"
    }
    
    if (!profile.length) {
      return NextResponse.json({ error: 'Usert not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user: profile[0], type}, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({
      error: 'Failed to fetch blog post',
    }, { status: 500 });
  }
}
