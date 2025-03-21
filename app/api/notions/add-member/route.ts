import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { NotionModel, EntrepreneurModel } from "@/model/model";



        export async function POST(request: Request) {
            try {
                await connectDB();

                const { notionId, userId } = await request.json();

                if (!notionId || !userId) {
                    return NextResponse.json(
                        { error: "Notion ID and User ID are required" },
                        { status: 400 }
                    );
                }

                // Verify entrepreneur exists
                const entrepreneur = await EntrepreneurModel.findById(userId);
                if (!entrepreneur) {
                    return NextResponse.json(
                        { error: "Entrepreneur not found" },
                        { status: 404 }
                    );
                }

                const updatedNotion = await NotionModel.findByIdAndUpdate(
                    notionId,
                    { 
                        $addToSet: { 
                            teamMembers: userId,
                        }
                    },
                    { new: true }
                ).populate('teamMembers');

                await EntrepreneurModel.findByIdAndUpdate(
                    userId,
                    { $addToSet: { notionsPartOf: notionId } }
                );

                if (!updatedNotion) {
                    return NextResponse.json(
                        { error: "Notion not found" },
                        { status: 404 }
                    );
                }

                return NextResponse.json(
                    { message: "Team member added successfully", notion: updatedNotion },
                    { status: 200 }
                );

            } catch (error) {
                console.error("Error adding team member:", error);
                return NextResponse.json(
                    { error: "Failed to add team member" },
                    { status: 500 }
                );
            }
        }

