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
  interestedTopics: string[];
  notionsOwnerOf: Notion[];
  notionsPartOf: Notion[];
  followings: User[];
  followers: User[];
  mentorFollowings: User[];
  mentorFollowers: User[];
}

const PREDEFINED_TOPICS = [
  "AI & Machine Learning",
  "Blockchain",
  "Cybersecurity",
  "Web Development",
  "Startups & Business",
  "Marketing & Growth",
  "Finance & Investing",
  "Health & Wellness",
  "SaaS & Cloud Computing",
];

export default function EntrepreneurProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestedTopics, setInterestedTopics] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/entrepreneur/profile`);
        if (res.status === 200) {
          setProfile(res.data);
          setInterestedTopics(res.data.interestedTopics || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const toggleTopic = (topic: string) => {
    setInterestedTopics((prevTopics) =>
      prevTopics.includes(topic)
        ? prevTopics.filter((t) => t !== topic)
        : [...prevTopics, topic]
    );
  };

  const handleUpdateTopics = async () => {
    try {
      setSaving(true);
      const res = await axios.put(`/api/interested-topics`, {
        interestedTopics,
      });

      if (res.status === 200) {
        alert("Interested topics updated successfully!");
      }
    } catch (error) {
      console.error("Error updating topics:", error);
      alert("Failed to update topics.");
    } finally {
      setSaving(false);
    }
  };

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

        {/* Interested Topics Selection */}
        <section className="mt-6">
          <h2 className="text-xl font-bold">Interested Topics</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {PREDEFINED_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-3 py-1 rounded-lg ${
                  interestedTopics.includes(topic) ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
          <button
            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            onClick={handleUpdateTopics}
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Topics"}
          </button>
        </section>

        {/* Notions Owned */}
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
      </div>
    </div>
  );
}
