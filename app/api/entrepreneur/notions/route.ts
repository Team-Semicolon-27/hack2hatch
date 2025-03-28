import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/db";
import {EntrepreneurModel, NotionModel, aiBloggerModel} from "@/model/model";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";
import { aiWrapper } from "@/lib/aiwrapper";

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
    
    if (!session || !user) {
      return NextResponse.json({ error: "no user found" }, { status: 401 });
    }
    
    if (user.userType !== "entrepreneur") {
      return NextResponse.json({ error: "user is not profile" }, { status: 401 });
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);
    const { title, logo, description } = await req.json();
    
    if (!title || !logo || !description) {
      return NextResponse.json({ error: "Missing data" }, { status: 403 });
    }
    
    const aiWrapperResponse = await aiWrapper(title, description);
    const notion = await NotionModel.create({
      owner: userId,
      title,
      logo,
      description,
      aiDescription: aiWrapperResponse
    });
    
    if (!notion) {
      return NextResponse.json({ error: "failed to create notions" }, { status: 500 });
    }
    
    // Keep using the original Map structure since that's what exists in the database
    const aiSemanticSearcherId = new mongoose.Types.ObjectId("67de4b5426f6ffcc31bea548");
    const notionKey = `notion_${Date.now()}`;
    
    // This uses the original Map structure format
    const updateResult = await aiBloggerModel.findOneAndUpdate(
      { _id: aiSemanticSearcherId },
      { 
        $set: {
          [`textToPassToAi.${notionKey}`]: {
            idOfNotion: notion._id,
            text: `${title} ${description}`
          }
        }
      },
      { 
        upsert: true,
        new: true
      }
    );
    
    if (!updateResult) {
      console.error('Failed to update aiBlogger');
      return NextResponse.json({ error: "Failed to update search index" }, { status: 500 });
    }
    
    // Update the entrepreneur's notions
    await EntrepreneurModel.updateOne(
      { _id: userId },
      {
        $addToSet: {
          notionsOwnerOf: notion._id
        }
      }
    );
    
    return NextResponse.json({ 
      success: true,
      notion: notion,
      searchIndex: updateResult
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in POST /api/entrepreneur/notions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}