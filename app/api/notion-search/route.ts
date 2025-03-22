import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { NotionModel } from "@/model/model";

async function getAllNotions(limit = 100) {
  try {
    return await NotionModel.find().limit(limit).lean();
  } catch (error) {
    console.error("Error fetching all notions:", error);
    throw error;
  }
}

interface FuzzySearchResult {
  title: string;
  description: string;
  aiDescription: string;
}

async function advancedFuzzySearch(query: string, limit: number = 10): Promise<FuzzySearchResult[]> {
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regexPattern = new RegExp(escapedQuery, "i");

  try {
    return await NotionModel.find({
      $or: [
        { title: regexPattern },
        { description: regexPattern },
        { aiDescription: regexPattern }
      ]
    }).limit(limit).lean();
  } catch (error) {
    console.error("Error performing fuzzy search:", error);
    throw error;
  }
}

interface PostRequestBody {
  query?: string;
  limit?: number;
}

interface PostResponse {
  success: boolean;
  results: FuzzySearchResult[];
  count: number;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body: PostRequestBody = await req.json();
    const query = body.query || "";
    const limit = body.limit || 100;

    let results;
    if (query.length > 0) {
      results = await advancedFuzzySearch(query, limit);
    } else {
      results = await getAllNotions(limit);
    }

    return NextResponse.json({ success: true, results, count: results.length }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/notions/search:", error);
    return NextResponse.json(
      { success: false, results: [], count: 0, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
