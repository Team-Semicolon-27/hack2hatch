"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface User {
  username: string;
  name: string;
  profileImage: string;
}

interface Notion {
  title: string;
  logo: string;
  description: string;
}

interface Profile {
  username: string;
  name: string;
  email: string;
  profileImage: string;
  notionsOwnerOf: Notion[];
  notionsPartOf: Notion[];
  followings: User[];
  followers: User[];
  mentorFollowings: User[];
  mentorFollowers: User[];
}

export default function EntrepreneurProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/entrepreneur/profile`);
        if (res.status === 200) {
          setProfile(res.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId]);
  
  if (loading) return <p className="text-white">Loading...</p>;
  if (!profile) return <p className="text-white">Profile not found</p>;
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-4">
          <img src={profile.profileImage} alt="Profile" className="w-16 h-16 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-400">@{profile.username}</p>
            <p className="text-gray-500">{profile.email}</p>
          </div>
        </div>
        
        <section className="mt-6">
          <h2 className="text-xl font-bold">Notions Owned</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {profile.notionsOwnerOf.length > 0 ? (
              profile.notionsOwnerOf.map((notion, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <img src={notion.logo} alt="Logo" className="w-12 h-12 rounded-full" />
                  <h3 className="text-lg font-semibold mt-2">{notion.title}</h3>
                  <p className="text-gray-400 text-sm">{notion.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No notions owned.</p>
            )}
          </div>
        </section>
        
        <section className="mt-6">
          <h2 className="text-xl font-bold">Notions Part Of</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {profile.notionsPartOf.length > 0 ? (
              profile.notionsPartOf.map((notion, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <img src={notion.logo} alt="Logo" className="w-12 h-12 rounded-full" />
                  <h3 className="text-lg font-semibold mt-2">{notion.title}</h3>
                  <p className="text-gray-400 text-sm">{notion.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Not part of any notions.</p>
            )}
          </div>
        </section>
        
        <section className="mt-6">
          <h2 className="text-xl font-bold">Followers</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            {profile.followers.length > 0 ? (
              profile.followers.map((user, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
                  <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full" />
                  <p>@{user.username}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No followers.</p>
            )}
          </div>
        </section>
        
        <section className="mt-6">
          <h2 className="text-xl font-bold">Following</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            {profile.followings.length > 0 ? (
              profile.followings.map((user, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
                  <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full" />
                  <p>@{user.username}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Not following anyone.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
