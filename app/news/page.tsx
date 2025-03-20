"use client";

import { useEffect, useState } from "react";

type Post = {
  platform: string;
  title: string;
  type: string;
  content: string;
  media?: string | null;
  url: string;
};

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/news");
        const data = await response.json();
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("Unexpected API response format", data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Latest Posts</h1>

      <div className="space-y-6">
        {posts.map((post, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <h2 className="font-semibold">{post.title}</h2>
            <p className="text-sm text-gray-600 capitalize">{post.platform} - {post.type}</p>

            {post.type === "text" && post.content && (
              <p className="mt-2 text-gray-800">{post.content}</p>
            )}

            {post.media && (post.type === "image" || post.type === "video") && (
              <div className="mt-2">
                {post.type === "image" ? (
                  <img src={post.media} alt={post.title} className="rounded-lg max-w-full h-auto" />
                ) : (
                  <video controls className="rounded-lg max-w-full h-auto">
                    <source src={post.media} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}

            <a href={post.url} target="_blank" className="mt-2 block text-blue-500 underline">
              View Post
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
