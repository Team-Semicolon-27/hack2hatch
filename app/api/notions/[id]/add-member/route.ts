import connectDB from "@/lib/db";
import { NotionModel } from "@/model/model";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectDB

  const { id: notionId } = params;
  const { userId } = await req.json();

  if (!notionId || !userId) {
    return NextResponse.json({ error: "Missing notionId or userId" }, { status: 400 });
  }

  try {
    const notion = await NotionModel.findById(notionId);

    if (!notion) {
      return NextResponse.json({ error: "Notion not found" }, { status: 404 });
    }

    if (notion.teamMembers.includes(userId)) {
      return NextResponse.json({ message: "User already in team" }, { status: 400 });
    }

    notion.teamMembers.push(userId);
    await notion.save();

    return NextResponse.json({ message: "Team member added successfully!" }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
