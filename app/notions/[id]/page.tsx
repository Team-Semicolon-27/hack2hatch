"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

interface User {
  name: string;
  username: string;
  profileImage: string;
}

interface Blog {
  _id: string;
  title: string;
  author: User;
}

interface Notion {
  _id: string;
  title: string;
  logo: string;
  description: string;
  owner: User;
  blogsE: Blog[];
  blogsM: Blog[];
  isOwner: boolean;
  isMentor: boolean;
  isMember: boolean;
  isTeamMember: boolean;
}

export default function NotionDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [notion, setNotion] = useState<Notion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchNotion = async () => {
      try {
        const res = await axios.get(`/api/entrepreneur/notions/${id}`);
        setNotion(res.data);
      } catch (error) {
        console.error("Error fetching notion:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotion();
  }, [id]);
  
  const handleAction = async (action: string) => {
    try {
      const res = await axios.post(`/api/notions/${id}/${action}`);
      if (res.status === 200) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };
  
  if (loading) return <p className="text-white">Loading...</p>;
  if (!notion) return <p className="text-white">Notion not found</p>;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-10">
      <div className="w-full max-w-3xl bg-gray-950 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-extrabold text-orange-500 mb-4">{notion.title}</h1>
        <img src={notion.logo} alt="Notion Logo" className="w-32 h-32 rounded-lg mx-auto mb-4" />
        <p className="text-gray-300 mb-4">{notion.description}</p>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-orange-400">Owner</h2>
          <div className="flex items-center gap-3 mt-2">
            <img src={notion.owner.profileImage} alt="Owner" className="w-12 h-12 rounded-full" />
            <p>{notion.owner.name} (@{notion.owner.username})</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-orange-400">Entrepreneur Blogs</h2>
          {notion.blogsE.length > 0 ? (
            notion.blogsE.map((blog) => (
              <div key={blog._id} className="border-b border-gray-700 py-2">
                <p className="text-lg font-semibold">{blog.title}</p>
                <p className="text-sm text-gray-400">By {blog.author.name}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No blogs available.</p>
          )}
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-orange-400">Mentor Blogs</h2>
          {notion.blogsM.length > 0 ? (
            notion.blogsM.map((blog) => (
              <div key={blog._id} className="border-b border-gray-700 py-2">
                <p className="text-lg font-semibold">{blog.title}</p>
                <p className="text-sm text-gray-400">By {blog.author.name}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No blogs available.</p>
          )}
        </div>
        
        <div className="mt-6 flex gap-4">
          {notion.isOwner ? (
            <button onClick={() => handleAction("delete")} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold">
              Delete Notion
            </button>
          ) : notion.isMentor || notion.isMember || notion.isTeamMember ? (
            <button onClick={() => handleAction("leave")} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold">
              Leave Notion
            </button>
          ) : (
            <button onClick={() => handleAction("join")} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold">
              Join Notion
            </button>
          )}
        </div>
        
        <div className="mt-6">
          <a href={`/notions/${id}/add-blog`} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold inline-block">
            Add Blog
          </a>
        </div>
      </div>
    </div>
  );
}
