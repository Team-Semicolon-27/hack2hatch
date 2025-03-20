import { NextResponse } from "next/server";

const TWITTER_BEARER_TOKEN = process.env.X_BEARER_TOKEN!;
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;
const REDDIT_USERNAME = process.env.REDDIT_USERNAME!;
const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD!;
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN!;
const LINKEDIN_ORG_ID = process.env.LINKEDIN_ORG_ID!;

// Fetch Twitter posts
const fetchTwitterPosts = async () => {
  try {
    const response = await fetch("https://api.twitter.com/2/tweets/search/recent?query=(AI OR MachineLearning OR DeepLearning) -is:retweet lang:en&max_results=5", {
      headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
    });

    const data = await response.json();
    return data.data?.map((tweet: any) => ({
      platform: "Twitter",
      content: tweet.text,
      url: `https://twitter.com/i/web/status/${tweet.id}`,
    })) || [];
  } catch (error) {
    console.error("Twitter API Error:", error);
    return [];
  }
};

// Fetch Reddit posts
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
        grant_type: "password",
        username: REDDIT_USERNAME,
        password: REDDIT_PASSWORD,
      }),
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    const response = await fetch("https://oauth.reddit.com/r/MachineLearning/hot?limit=5", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Next.js AI Aggregator",
      },
    });

    const data = await response.json();
    return data.data.children?.map((post: any) => ({
      platform: "Reddit",
      content: post.data.title,
      url: post.data.url,
    })) || [];
  } catch (error) {
    console.error("Reddit API Error:", error);
    return [];
  }
};

// Fetch LinkedIn posts
// const fetchLinkedInPosts = async () => {
//   try {
//     const response = await fetch(
//       `https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:${LINKEDIN_ORG_ID}&count=5`,
//       {
//         headers: { Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}` },
//       }
//     );

//     const data = await response.json();
//     return data.elements?.map((post: any) => ({
//       platform: "LinkedIn",
//       content: post.text.body,
//       url: `https://www.linkedin.com/feed/update/${post.id}`,
//     })) || [];
//   } catch (error) {
//     console.error("LinkedIn API Error:", error);
//     return [];
//   }
// };

// API Handler
export async function GET() {
  try {
    const [twitterPosts, redditPosts] = await Promise.all([
      fetchTwitterPosts(),
      fetchRedditPosts(),
    //   fetchLinkedInPosts(),
    ]);

    const posts = [...twitterPosts, ...redditPosts];

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("API Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 });
  }
}
