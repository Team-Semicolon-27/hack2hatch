import mongoose from "mongoose";
import {NextResponse} from "next/server";
import { NotionModel } from "@/model/model";
import connectDB from "@/lib/db"
import { aiSemanticSearch } from "@/lib/aiSemanticSearch";

export async function POST(req: Request) {
    try {
      await connectDB();
      const { query } = await req.json();
      const allText = await mongoose.models.aiBlogger.find({
        "textToPassToAi.text": { $regex: query, $options: 'i' }
    });
    
    if(allText.length === 0) { 
        return NextResponse.json({ error: 'No text found' }, { status: 404 });
    }
  
  const combinedText = allText.map((doc) => doc.textToPassToAi.text).join(' ');
        
        const idOfNotion = await aiSemanticSearch(combinedText, query);
        if(idOfNotion === '0') {
            return NextResponse.json({ error: 'No text found' }, { status: 404 });
        }
        const notion = await NotionModel.findById(idOfNotion);
        return NextResponse.json({ notion }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }   
}