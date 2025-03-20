import connectDB from "@/lib/db";
import { NewsModel } from "@/model/model";
import { NextResponse } from "next/server";

const TWITTER_BEARER_TOKEN = process.env.X_BEARER_TOKEN!;
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;

// Fetch posts from Twitter with DB fallback
const fetchTwitterPosts = async () => {
    try {
        await connectDB();
      const personalities = [
        "Elon Musk", "Bill Gates", "Sundar Pichai", "Jeff Bezos",
        "Barack Obama", "Taylor Swift", "Cristiano Ronaldo", "Oprah Winfrey",
        "@elonmusk", "@BillGates", "@sundarpichai", "@JeffBezos",
        "@BarackObama", "@taylorswift13", "@Cristiano", "@Oprah"
      ];
  
      const query = personalities.map(term => `"${term}"`).join(" OR ");
      const searchUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,text,entities`;
  
      const response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
      });
  
      if (response.status === 429) {
        console.warn("Rate limit exceeded. Fetching from MongoDB...");
        return await NewsModel.find({ platform: "Twitter" }).sort({ timestamp: -1 }).limit(10);
      }
  
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  
      const data = await response.json();
      if (!data?.data) throw new Error("Failed to fetch tweets");
  
      const tweets = data.data.map((tweet: any) => ({
        platform: "Twitter",
        title: "Tweet",
        type: "text",
        content: tweet.text,
        url: `https://twitter.com/i/web/status/${tweet.id}`,
        timestamp: new Date(tweet.created_at),
      }));
  
      // Store in MongoDB for fallback
      await NewsModel.insertMany(tweets);
  
      return tweets;
    } catch (error) {
      console.error("Twitter API Error:", error);
      return [];
    }
  };
  // **Fetch Reddit Posts with Fallback**
  const fetchRedditPosts = async () => {
    try {
        const authResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64")}`,
                "User-Agent": "Next.js AI Aggregator",
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
            }),
        });

        if (!authResponse.ok) {
            const errorText = await authResponse.text();
            throw new Error(`Reddit Auth Failed: ${errorText}`);
        }

        const authData = await authResponse.json();
        if (!authData.access_token) {
            throw new Error(`Reddit Authentication Failed: ${JSON.stringify(authData)}`);
        }

        const accessToken = authData.access_token;
        const response = await fetch("https://oauth.reddit.com/r/MachineLearning/hot?limit=5", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "Next.js AI Aggregator",
            },
        });

        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

        const data = await response.json();
        if (!data?.data?.children) throw new Error("Failed to fetch Reddit posts");

    const posts = data.data.children.map((post: any) => ({
      platform: "Reddit",
      title: post.data.title,
      type: "text",
      content: post.data.selftext || post.data.url,
      url: post.data.url,
      timestamp: new Date(post.data.created_utc * 1000),
    }));

    // Store in MongoDB for fallback
    await NewsModel.insertMany(posts);

    return posts;

    } catch (error) {
        console.error("Reddit API Error:", error);
        return [];
    }
};

  
  // **API Route Handler**
  export async function GET() {
    try {
      const [twitterPosts, redditPosts] = await Promise.all([
        fetchTwitterPosts(),
        fetchRedditPosts(),
      ]);
  
      return NextResponse.json([...twitterPosts, ...redditPosts]);
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
