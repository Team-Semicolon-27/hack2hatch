"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    username: string;
    profileImage: string;
  };
  notion: {
    title: string;
    logo: string;
  };
  likesCount: number;
  attachments: string[];
  links: string[];
  tags: string[];
}

export default function BlogsPage() {
  const [blogE, setBlogE] = useState<Blog[]>([]);
  const [blogM, setBlogM] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await axios.get("/api/blogs"); // Ensure this matches your API route
        if (res.status === 200) {
          setBlogE(res.data.blogE || []);
          setBlogM(res.data.blogM || []);
        }
      } catch (err) {
        setError("error");
        console.log(err)
      } finally {
        setLoading(false);
      }
    }
    
    fetchBlogs();
  }, []);
  
  if (loading) return <div className="text-center text-lg">Loading blogs...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Blogs</h1>
      
      {/* Entrepreneur Blogs */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Entrepreneur Blogs</h2>
        {blogE.length === 0 ? <p>No blogs found</p> : blogE.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
      </section>
      
      {/* Mentor Blogs */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Mentor Blogs</h2>
        {blogM.length === 0 ? <p>No blogs found</p> : blogM.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
      </section>
    </div>
  );
}

// Blog Card Component
function BlogCard({ blog }: { blog: Blog }) {
  return (
    <div className="border p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center mb-2">
        <img src={blog.author.profileImage} alt={blog.author.name} className="w-10 h-10 rounded-full mr-3" />
        <div>
          <p className="font-bold">{blog.author.name}</p>
          <p className="text-gray-500">@{blog.author.username}</p>
        </div>
      </div>
      <h3 className="text-lg font-semibold">{blog.title}</h3>
      <p className="text-sm text-gray-700">{blog.content.slice(0, 100)}...</p>
      <div className="flex items-center mt-2">
        <img src={blog.notion.logo} alt={blog.notion.title} className="w-6 h-6 mr-2" />
        <p className="text-sm text-gray-600">{blog.notion.title}</p>
      </div>
      <p className="text-sm text-blue-500 mt-2">{blog.likesCount} Likes</p>
      
      {blog.attachments?.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold">Attachments:</p>
          <ul className="list-disc pl-4">
            {blog.attachments.map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" className="text-blue-500 underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
