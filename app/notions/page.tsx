"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import mongoose from "mongoose";

interface User {
  name: string;
  username: string;
  profileImage: string;
}

interface Notion {
  _id: mongoose.Types.ObjectId;
  title: string;
  logo: string;
  owner: User;
}

export default function NotionsListPage() {
  const [notions, setNotions] = useState<Notion[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredNotions, setFilteredNotions] = useState<Notion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchNotions = async () => {
      try {
        const res = await axios.get("/api/notions");
        if (res.status === 200) {
          setNotions(res.data);
          setFilteredNotions(res.data);
        }
      } catch (error) {
        console.error("Error fetching notions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotions();
  }, []);
  
  useEffect(() => {
    const filtered = notions.filter((notion) =>
      notion.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredNotions(filtered);
  }, [search, notions]);
  
  if (loading) return <p className="text-white">Loading...</p>;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white py-10 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-orange-500 mb-4">Notions</h1>
      <input
        type="text"
        placeholder="Search Notions..."
        className="w-80 p-2 mb-6 border border-gray-700 rounded-lg text-black"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredNotions.length > 0 ? (
          filteredNotions.map((notion) => (
            <div
              key={notion._id.toString()}
              className="bg-gray-950 rounded-lg shadow-lg p-4 cursor-pointer hover:bg-gray-900"
              onClick={() => router.push(`/notions/${notion._id}`)}
            >
              <img
                src={notion.logo}
                alt={notion.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h2 className="text-xl font-bold text-orange-400">{notion.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <img
                  src={notion.owner.profileImage}
                  alt="Owner"
                  className="w-10 h-10 rounded-full"
                />
                <p>{notion.owner.name} (@{notion.owner.username})</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No notions found.</p>
        )}
      </div>
    </div>
  );
}