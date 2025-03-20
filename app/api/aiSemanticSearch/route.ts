import mongoose, { mongo } from "mongoose";
import {NextResponse} from "next/server";
import { BlogM, BlogMModel, NotionModel, aiBloggerModel } from "../../../model/model";
import { EntrepreneurModel } from "../../../model/model";
import connectDB from "@/lib/db"
import { getServerSession, User } from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route"
import { aiSemanticSearch } from "@/lib/aiSemanticSearch";

export async function POST(req: Request) {
    try {
      await connectDB();
      const { query } = await req.json();
    // Query should search in the text field, not the object itself
    const allText = await mongoose.models.aiBlogger.find({
        "textToPassToAi.text": { $regex: query, $options: 'i' }
    });
    
    if(allText.length === 0) { 
        return NextResponse.json({ error: 'No text found' }, { status: 404 });
    }
  
  // Extract just the text field from each document
  const combinedText = allText.map((doc) => doc.textToPassToAi.text).join(' ');
        
        const idOfNotion = await aiSemanticSearch(combinedText, query);
        if(idOfNotion === '0') {
            return NextResponse.json({ error: 'No text found' }, { status: 404 });
        }
        const notion = await NotionModel.findById(idOfNotion);
        return NextResponse.json({ notion }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }   
}