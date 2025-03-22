import {NextRequest, NextResponse} from "next/server";
import {EntrepreneurModel, NotionModel} from "@/model/model";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "id not found" }, { status: 403 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "id not valid" }, { status: 403 });
    }
    
    const objectId = new mongoose.Types.ObjectId(id);
    
    
    const notion = await NotionModel.aggregate([
      {
        $match: {
          _id: objectId,
        }
      },
      {
        $addFields: {
          isOwner: { $eq: ["$owner", userId] },
          isMentor: { $in: [userId, "$mentors"] },
          isMember: { $in: [userId, "$members"] },
          isTeamMember: { $in: [userId, "$teamMembers"] },
        },
      },
      {
        $lookup: {
          from: "entrepreneurs",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
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
        $unwind: '$owner',
      },
      {
        $lookup: {
          from: "bloges",
          localField: "blogsE",
          foreignField: "_id",
          as: "blogsE",
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
                      username: 1,
                      profileImage: 1
                    }
                  }
                ]
              }
            },
            {
              $unwind: '$author',
            },
            {
              $project: {
                author: 1,
                title: 1,
                content: 1,
                tags: 1,
                attachments: 1,
                likes: { $size: "$likes"},
                comments: { $size: "$comments" },
                links: 1,
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "blogms",
          localField: "blogsM",
          foreignField: "_id",
          as: "blogsM",
          pipeline: [
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
              $unwind: '$author',
            },
            {
              $project: {
                author: 1,
                title: 1,
                content: 1,
                tags: 1,
                attachments: 1,
                likes: { $size: "$likes"},
                comments: { $size: "$comments" },
                links: 1,
              }
            }
          ]
        }
      },
      {
        $project: {
          owner: 1,
          title: 1,
          logo: 1,
          description: 1,
          blogsE: 1,
          blogsM: 1,
          isOwner: 1,
          isMentor: 1,
          isMember: 1,
          isTeamMember: 1,
        }
      }
    ])
    
    if (!notion || notion.length === 0) {
      return NextResponse.json(
        { error: "notions not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(notion[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "id not found" }, { status: 403 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "id not valid" }, { status: 403 });
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    const objectId = new mongoose.Types.ObjectId(id);
    
    const notion = await NotionModel.deleteOne(
      {
        // owner: userId
        _id: objectId,
      }
    )
    
    if (!notion) {
      return NextResponse.json({ error: "notions not found" }, { status: 404});
    }
    
    await EntrepreneurModel.updateOne(
      {
        _id: userId
      },
      {
        $pull: {
          notionsOwnerOf: objectId
        }
      }
    )
    
    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}
