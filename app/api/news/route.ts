import connectDB from "@/lib/db";
import { EntrepreneurModel, NewsModel } from "@/model/model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { Buffer } from "buffer";

const TWITTER_BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

if (!TWITTER_BEARER_TOKEN || !REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
  throw new Error("Missing API credentials in environment variables.");
}

const topicToSubredditMap: Record<string, string> = {
    "AI & Machine Learning": "MachineLearning",
    "Blockchain": "cryptocurrency",
    "Cybersecurity": "cybersecurity",
    "Web Development": "webdev",
    "Startups & Business": "startups",
    "Marketing & Growth": "marketing",
    "Finance & Investing": "investing",
    "Health & Wellness": "health",
    "SaaS & Cloud Computing": "cloudcomputing",
  };
  

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

    await NewsModel.insertMany(tweets);
    return tweets;
  } catch (error) {
    console.error("Twitter API Error:", error);
    return [];
  }
};

const fetchRedditPosts = async (userId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }
    const userProfile = await EntrepreneurModel.findOne({ email: session.user.email });
    
    if(!userProfile){
        return 
    }
     
    if (!userProfile.interestedTopics || userProfile.interestedTopics.length === 0) {
      console.warn("User has no interested topics.");
      return [];
    }

    const subreddits = userProfile.interestedTopics
        //@ts-ignore
      .map(topic => topicToSubredditMap[topic])
      .filter(Boolean);

    if (subreddits.length === 0) {
      console.warn("No matching subreddits found.");
      return [];
    }

    const authResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64")}`,
        "User-Agent": "Next.js AI Aggregator",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!authResponse.ok) {
      console.warn(`Reddit Auth Failed: ${await authResponse.text()}`);
      return [];
    }

    const authData = await authResponse.json();
    if (!authData.access_token) {
      console.warn("Failed to obtain Reddit access token.");
      return [];
    }

    const accessToken = authData.access_token;
    const subredditPosts = [];

    for (const subreddit of subreddits) {
      const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=5`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "Next.js AI Aggregator",
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (!data?.data?.children) continue;

      const posts = data.data.children.map((post: any) => ({
        platform: "Reddit",
        title: post.data.title,
        type: "text",
        content: post.data.selftext || post.data.url,
        url: post.data.url,
        timestamp: new Date(post.data.created_utc * 1000),
      }));

      subredditPosts.push(...posts);
    }

    await NewsModel.insertMany(subredditPosts);
    return subredditPosts;
  } catch (error) {
    console.error("Reddit API Error:", error);
    return [];
  }
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }
    const userProfile = session.user;
    const userId = userProfile.id;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const [twitterPosts, redditPosts] = await Promise.all([
      fetchTwitterPosts(),
      fetchRedditPosts(userId),
    ]);

    return NextResponse.json([...twitterPosts, ...redditPosts]);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
