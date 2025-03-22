import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { NotionModel } from "../../../model/model";
import connectDB from "@/lib/db";

// Simple in-memory cache to store latest notion IDs
// In a production environment, you would use Redis or a similar solution
const latestNotionIds: string[] = [];
const MAX_CACHED_NOTIONS = 5; // Store only the 5 most recent notions

export async function POST(req: Request) {
  try {
    await connectDB();
    const { query } = await req.json();
    console.log('Search query:', query);
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // If we have cached notion IDs, use the most recent one
    if (latestNotionIds.length > 0) {
      const latestNotionId = latestNotionIds[0];
      
      // Validate that the ID is a proper ObjectId before querying
      if (!mongoose.isValidObjectId(latestNotionId)) {
        console.error('Invalid ObjectId:', latestNotionId);
        return NextResponse.json({
          error: 'Invalid notion ID in cache'
        }, { status: 500 });
      }
      
      const notion = await NotionModel.findById(latestNotionId);
      
      if (notion) {
        return NextResponse.json({
          success: true,
          notion,
          method: 'latest_cached_notion'
        }, { status: 200 });
      }
    }
    
    // Fallback: if cache is empty or ID not found, get the most recently created notion
    const latestNotion = await NotionModel.findOne().sort({ createdAt: -1 });
    
    if (!latestNotion) {
      return NextResponse.json({
        error: 'No notions found in the database'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      notion: latestNotion,
      method: 'latest_from_db'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Temporary Search Placeholder Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Helper function to add a notion ID to the cache
// Call this from your notion creation endpoint
export function addNotionToCache(notionId: string) {
  latestNotionIds.unshift(notionId); // Add to the beginning
  
  // Keep only the maximum allowed number of IDs
  if (latestNotionIds.length > MAX_CACHED_NOTIONS) {
    latestNotionIds.pop(); // Remove the oldest
  }
}