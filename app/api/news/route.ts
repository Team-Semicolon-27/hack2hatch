import connectDB from "@/lib/db";
import { EntrepreneurModel, NewsModel } from "@/model/model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
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
      "@elonmusk", "@BillGates", "@sundarpichai", "@JeffBezos",
      "Warren Buffett", "Mark Zuckerberg", "Satya Nadella", "Tim Cook",
      "@WarrenBuffett", "@finkd", "@satyanadella", "@tim_cook",
      "Naval Ravikant", "Peter Thiel", "Marc Andreessen", "Sam Altman",
      "@naval", "@peterthiel", "@pmarca", "@sama",
      "Richard Branson", "Reid Hoffman", "Steve Wozniak", "Jack Dorsey",
      "@richardbranson", "@reidhoffman", "@stevewoz", "@jack",
      "Patrick Collison", "John Collison", "Brian Chesky", "Drew Houston",
      "@patrickc", "@collision", "@bchesky", "@drewhouston",
      "Sheryl Sandberg", "Susan Wojcicki", "Melanie Perkins", "Whitney Wolfe Herd",
      "@sherylsandberg", "@SusanWojcicki", "@MelanieCanva", "@WhitWolfeHerd",
      "Jensen Huang", "Andrew Ng", "Demis Hassabis", "Emmett Shear",
      "@nvidia", "@AndrewYNg", "@demishassabis", "@eshear"
    ];
    
    const query = personalities.map(term => `"${term}"`).join(" OR ");
    const searchUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=25&tweet.fields=created_at,text,entities,public_metrics,author_id&expansions=author_id&user.fields=name,username`;

    const response = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
    });

    if (response.status === 429) {
      const resetTime = response.headers.get("x-rate-limit-reset");
      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime, 10) * 1000);
        console.warn(`Rate limit exceeded. Try again at: ${resetDate.toLocaleString()}`);
      }
      return await NewsModel.find({ platform: "Twitter" }).sort({ timestamp: -1 }).limit(25);
    }

    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const data = await response.json();
    if (!data?.data || !data.includes?.users) throw new Error("Failed to fetch tweets");

    const usersMap = new Map<string, { id: string; name: string }>(
      (data.includes?.users || []).map((user: { id: string; name: string }) => [user.id, user])
    );
    
    //@ts-expect-error aaa
    const tweets = data.data.map((tweet) => {
      const user = usersMap.get(tweet.author_id);
      return {
        platform: "Twitter",
        title: "Tweet",
        type: "text",
        content: tweet.text,
        url: `https://twitter.com/i/web/status/${tweet.id}`,
        timestamp: new Date(tweet.created_at),
        likes: tweet.public_metrics.like_count || 0,
        comments: tweet.public_metrics.reply_count || 0,
        author: user?.name || "Unknown",
      };
    });
    
    console.log("Fetched Tweets:", JSON.stringify(tweets, null, 2));

    await NewsModel.insertMany(tweets);
    return tweets;
  } catch (error) {
    console.error("Twitter API Error:", error);
    return [];
  }
};

type Post = {
  platform: string;
  title: string;
  type: string;
  content: string;
  url: string;
  timestamp: Date;
  likes: number;
  comments: number;
  author: string;
  subreddit?: string; // Only for Reddit posts
};

const fetchRedditPosts = async (): Promise<Post[]> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }
    const userProfile = await EntrepreneurModel.findOne({ email: session.user.email });

    if (!userProfile) {
      return [];
    }

    if (!userProfile.interestedTopics || userProfile.interestedTopics.length === 0) {
      console.warn("User has no interested topics.");
      return [];
    }
    
    const subreddits = userProfile.interestedTopics
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
    const subredditPosts: Post[] = [];

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

      // @ts-expect-error abc
      const posts = data.data.children.map((post): Post => ({
        platform: "Reddit",
        title: post.data.title,
        type: "text",
        content: post.data.selftext || post.data.url,
        url: post.data.url,
        timestamp: new Date(post.data.created_utc * 1000),
        likes: post.data.ups || 0,
        comments: post.data.num_comments || 0,
        author: post.data.author || "Unknown",
        subreddit: post.data.subreddit,
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


export async function GET() {
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
      fetchRedditPosts(),
    ]);

    return NextResponse.json([...twitterPosts, ...redditPosts].slice(0, 50));
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}