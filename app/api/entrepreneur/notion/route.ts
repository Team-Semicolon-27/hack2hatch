import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/db";
import {NotionModel} from "@/model/model";

export async function GET() {
  try {
    await connectDB();
    
    
    const notions = await NotionModel.aggregate([
      {
        $match: {
        
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
          logo: 1
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
    
    const { title, logo, description } = await req.json();
    
    if (!title || !logo || !description) {
      return NextResponse.json({ error: "Missing data" }, { status: 403 });
    }
    
    const notion = await NotionModel.create({
      //owner:
      title,
      logo,
      description,
    })
    
    if (!notion) {
      return NextResponse.json({ error: "failed to create notion" }, { status: 500 });
    }
    
    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}