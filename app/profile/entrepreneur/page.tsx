"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "next/navigation"

interface User {
  username: string
  name: string
  profileImage: string
}

interface Notion {
  title: string
  logo: string
  description: string
}

interface Profile {
  username: string
  name: string
  email: string
  profileImage: string
  interestedTopics: string[]
  notionsOwnerOf: Notion[]
  notionsPartOf: Notion[]
  followings: User[]
  followers: User[]
  mentorFollowings: User[]
  mentorFollowers: User[]
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
]

export default function EntrepreneurProfile() {
  const { userId } = useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [interestedTopics, setInterestedTopics] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/entrepreneur/profile`)
        if (res.status === 200) {
          setProfile(res.data)
          setInterestedTopics(res.data.interestedTopics || [])
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const toggleTopic = (topic: string) => {
    setInterestedTopics((prevTopics) =>
      prevTopics.includes(topic) ? prevTopics.filter((t) => t !== topic) : [...prevTopics, topic],
    )
  }

  const handleUpdateTopics = async () => {
    try {
      setSaving(true)
      const res = await axios.put(`/api/interested-topics`, {
        interestedTopics,
      })

      if (res.status === 200) {
        alert("Interested topics updated successfully!")
      }
    } catch (error) {
      console.error("Error updating topics:", error)
      alert("Failed to update topics.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-100">
                  <img
                    src={profile.profileImage || "/placeholder.svg?height=96&width=96"}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                <p className="text-orange-500 font-medium">@{profile.username}</p>
                <p className="text-gray-500 mt-1">{profile.email}</p>

                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-600">
                    {profile.followers?.length || 0} Followers
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-600">
                    {profile.followings?.length || 0} Following
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-600">
                    {profile.notionsOwnerOf?.length || 0} Notions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interested Topics */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="p-6">
            <div className="pb-2">
              <h2 className="text-xl font-bold text-gray-800">Interested Topics</h2>
              <p className="text-gray-500 text-sm">Select topics that interest you</p>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {PREDEFINED_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    interestedTopics.includes(topic)
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <button
              className={`mt-4 px-4 py-2 rounded-md font-medium text-white transition-colors ${
                saving ? "bg-orange-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
              }`}
              onClick={handleUpdateTopics}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Saving...
                </span>
              ) : (
                "Update Topics"
              )}
            </button>
          </div>
        </div>

        {/* Notions Owned */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="pb-2">
              <h2 className="text-xl font-bold text-gray-800">Notions Owned</h2>
              <p className="text-gray-500 text-sm">Projects and ideas you've created</p>
            </div>

            {profile.notionsOwnerOf && profile.notionsOwnerOf.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {profile.notionsOwnerOf.map((notion, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-orange-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={notion.logo || "/placeholder.svg?height=48&width=48"}
                          alt={notion.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=48&width=48"
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{notion.title}</h3>
                      </div>
                    </div>
                    <div className="h-px bg-gray-200 my-3"></div>
                    <p className="text-gray-600 text-sm line-clamp-2">{notion.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 mt-4">
                <p className="text-gray-500">No notions created yet</p>
                <button className="mt-4 px-4 py-2 rounded-md font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors">
                  Create Your First Notion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

