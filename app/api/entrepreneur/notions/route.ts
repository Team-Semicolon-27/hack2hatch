import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/db";
import {NotionModel} from "@/model/model";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    const notions = await NotionModel.aggregate([
      {
        $match: {
          $or: [
            { owner: userId },
            { members: userId },
            { mentors: userId },
            { teamMembers: userId }
          ]
        }
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
        $project: {
          owner: 1,
          title: 1,
          logo: 1,
        }
      }
    ])
    
    
    return NextResponse.json(
      notions,
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user ) {
      return NextResponse.json({ error: "no user found" }, { status: 401});
    }
    
    if (user.userType !== "entrepreneur") {
      return NextResponse.json({ error: "user is not entrepreneur"}, { status: 401 })
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    
    const { title, logo, description } = await req.json();
    
    if (!title || !logo || !description) {
      return NextResponse.json({ error: "Missing data" }, { status: 403 });
    }
    
    const notion = await NotionModel.create({
      owner: userId,
      title,
      logo,
      description,
    })
    
    if (!notion) {
      return NextResponse.json({ error: "failed to create notions" }, { status: 500 });
    }
    
    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}