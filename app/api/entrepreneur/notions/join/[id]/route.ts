import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {EntrepreneurModel, MentorModel, NotionModel} from "@/model/model";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user ) {
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
    
    if (user.userType === "entrepreneur") {
      await NotionModel.updateOne({
        _id: objectId
      }, {
        $addToSet: {members: userId},
      })
      
      await EntrepreneurModel.updateOne(
        {
          _id: userId,
        },
        {
          $addToSet: {notionsPartOf: objectId},
        }
      )
      
      return NextResponse.json({ status: 200 });
    } else {
      await NotionModel.updateOne({
        _id: objectId
      }, {
        $addToSet: {mentors: userId},
      })
      
      await MentorModel.updateOne(
        {
          _id: userId,
        },
        {
          $addToSet: {notionsPartOf: objectId},
        }
      )
      return NextResponse.json({ status: 200 });
    }
  } catch (error) {
    return NextResponse.json({error: error}, {status: 500});
  }
}