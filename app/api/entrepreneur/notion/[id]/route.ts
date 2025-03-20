import {NextRequest, NextResponse} from "next/server";
import {NotionModel} from "@/model/model";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    
    
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
          //owner
        }
      },
      {
        // later
        $addFields: {
          isOwner: {
            $cond: {
              if: {}
            }
          },
          isMentor: {
          
          },
          isMember: {
          
          },
          isTeamMember: {
          
          }
        }
      },
      {
        $lookup: {
          from: "blogs",
          localField: "blogs",
          foreignField: "_id",
          as: "blogs",
          pipeline: [
            {
              $lookup: {
                from: ""
              }
            }
          ]
        }
      }
    ])
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}