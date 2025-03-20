'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import mongoose from "mongoose";

interface Notion {
  _id: mongoose.Schema.Types.ObjectId,
  owner: {
    _id: mongoose.Schema.Types.ObjectId,
    name: string,
    username: string,
    profileImage: string
  },
  title: string,
  logo: string
}

const NotionsPage = () => {
  const [notions, setNotions] = useState<Notion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function fetchNotions() {
      try {
        const res = await axios.get('/api/entrepreneur/notions');
        if (res.status === 200) {
          setNotions(res.data);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching notions:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    fetchNotions();
  }, [router]);
  
  if (loading) {
    return <div className="text-center text-orange-500 text-xl">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-400">Notions</h1>
          <Link href="/my-notions/add" className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg shadow-lg">Add Notion</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notions.map((notion) => (
            <div key={notion._id.toString()} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
              <img src={notion.logo} alt={notion.title} className="w-20 h-20 object-cover rounded-full mb-4 border-2 border-orange-500" />
              <h2 className="text-xl font-semibold text-orange-300">{notion.title}</h2>
              <div className="flex items-center mt-3 space-x-3">
                <img src={notion.owner.profileImage} alt={notion.owner.name} className="w-10 h-10 rounded-full border-2 border-gray-400" />
                <div>
                  <p className="text-sm text-gray-300">{notion.owner.name}</p>
                  <p className="text-xs text-gray-500">@{notion.owner.username}</p>
                </div>
              </div>
              <button
                className="mt-4 text-sm text-white bg-orange-500 hover:bg-orange-600 py-1 px-3 rounded-lg"
                onClick={() => router.push(`/notions/${notion._id.toString()}`)}
              >
                View Notion
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotionsPage;