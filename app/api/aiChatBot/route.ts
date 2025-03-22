import { createRAG, RAGConfig } from 'rag-module/dist';
import connectDB from '@/lib/db';
import { NewsModel } from '@/model/model';
import {NextResponse} from "next/server";

if (!process.env.GOOGLE_API_KEY || 
    !process.env.QDRANT_URL || 
    !process.env.QDRANT_API_KEY || 
    !process.env.GROQ_API_KEY) {
    throw new Error('Required environment variables are not set');
}

const config: RAGConfig = {
    googleApiKey: process.env.GOOGLE_API_KEY,
    qdrantUrl: process.env.QDRANT_URL,
    qdrantApiKey: process.env.QDRANT_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    collectionName: 'news', 
    fallbackResponse: 'Sorry, I could not find relevant information.'
};

const rag = createRAG(config);

export async function POST(req: Request) {
    try {

        await connectDB();
        const { query } = await req.json();

        const allDocs = await NewsModel.find({});
        console.log('Total docs found:', allDocs.length);

        const docsToProcess = allDocs.filter(doc => !doc.isVectored);
        let allText = docsToProcess.map(doc => `${doc.title || ''} ${doc.content || ''}`).join(' ');

        await NewsModel.updateMany(
            { _id: { $in: docsToProcess.map(doc => doc._id) } },
            { $set: { isVectored: true } }
        );

        if(!allText) {
            allText = 'No text found';
        }

        const result = await rag.processQuery(
            allText,
            query
        );

        console.log('Response:', result.response);
        return NextResponse.json({ response: result.response }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}