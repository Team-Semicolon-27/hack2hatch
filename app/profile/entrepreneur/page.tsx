"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "next/navigation"
import mongoose from "mongoose";
import Link from "next/link";

interface User {
  username: string
  name: string
  profileImage: string
}

interface Notion {
  _id: mongoose.Types.ObjectId;
  title: string
  logo: string
  description: string
}

interface Blog {
  _id: mongoose.Types.ObjectId;
  title: string
  content: string
  tags: string[]
  notion: {
    _id: mongoose.Types.ObjectId;
    title: string
    logo: string
  }
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
  blogs: Blog[]
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
  const [activeTab, setActiveTab] = useState<'notions'|'blogs'|'network'>('notions')
  
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
      <div className="max-w-6xl mx-auto">
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-600">
                    {profile.blogs?.length || 0} Blogs
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-600">
                    {profile.mentorFollowers?.length || 0} Mentees
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
        
        {/* Tabs for Notions, Blogs, Network */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('notions')}
                className={`px-4 py-3 text-sm font-medium transition-colors flex-1 ${
                  activeTab === 'notions'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Notions & Projects
              </button>
              <button
                onClick={() => setActiveTab('blogs')}
                className={`px-4 py-3 text-sm font-medium transition-colors flex-1 ${
                  activeTab === 'blogs'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Blogs
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`px-4 py-3 text-sm font-medium transition-colors flex-1 ${
                  activeTab === 'network'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Network
              </button>
            </nav>
          </div>
          
          {/* Notions Owned */}
          {activeTab === 'notions' && (
            <div className="p-6">
              <div className="pb-2">
                <h2 className="text-xl font-bold text-gray-800">Notions Owned</h2>
                <p className="text-gray-500 text-sm">Projects and ideas you've created</p>
              </div>
              
              {profile.notionsOwnerOf && profile.notionsOwnerOf.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {profile.notionsOwnerOf.map((notion) => (
                    <div
                      key={notion._id.toString()}
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
              
              {profile.notionsPartOf && profile.notionsPartOf.length > 0 && (
                <div className="mt-8">
                  <div className="pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Contributing To</h2>
                    <p className="text-gray-500 text-sm">Projects you're participating in</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {profile.notionsPartOf.map((notion) => (
                      <div
                        key={notion._id.toString()}
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
                </div>
              )}
            </div>
          )}
          
          {/* Blogs */}
          {activeTab === 'blogs' && (
            <div className="p-6">
              <div className="pb-2">
                <h2 className="text-xl font-bold text-gray-800">Your Blog Posts</h2>
                <p className="text-gray-500 text-sm">Articles you've written</p>
              </div>
              
              {profile.blogs && profile.blogs.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {profile.blogs.map((blog) => (
                    <div
                      key={blog._id.toString()}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-orange-200 transition-all"
                    >
                      <h3 className="font-semibold text-gray-800 text-lg">{blog.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Related to: <span className="text-orange-500">{blog.notion.title}</span>
                      </p>
                      <div className="h-px bg-gray-200 my-3"></div>
                      <p className="text-gray-600 line-clamp-3">{blog.content.substring(0, 150)}...</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {blog.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link href={`/blogs/${blog._id}`} className="inline-block mt-3 text-orange-500 hover:text-orange-600 text-sm font-medium">
                        Read More
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mt-4">
                  <p className="text-gray-500">No blog posts yet</p>
                  <button className="mt-4 px-4 py-2 rounded-md font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors">
                    Write Your First Blog
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Network */}
          {activeTab === 'network' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Followers */}
                <div>
                  <div className="pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Followers</h2>
                    <p className="text-gray-500 text-sm">People following your work</p>
                  </div>
                  
                  {profile.followers && profile.followers.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      {profile.followers.map((user, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 mt-2">No followers yet</p>
                  )}
                </div>
                
                {/* Following */}
                <div>
                  <div className="pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Following</h2>
                    <p className="text-gray-500 text-sm">People whose work you follow</p>
                  </div>
                  
                  {profile.followings && profile.followings.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      {profile.followings.map((user, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 mt-2">Not following anyone yet</p>
                  )}
                </div>
                
                {/* Mentors */}
                <div>
                  <div className="pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Mentors</h2>
                    <p className="text-gray-500 text-sm">People mentoring you</p>
                  </div>
                  
                  {profile.mentorFollowings && profile.mentorFollowings.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      {profile.mentorFollowings.map((user, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 mt-2">No mentors yet</p>
                  )}
                </div>
                
                {/* Mentees */}
                <div>
                  <div className="pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Mentees</h2>
                    <p className="text-gray-500 text-sm">People you're mentoring</p>
                  </div>
                  
                  {profile.mentorFollowers && profile.mentorFollowers.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      {profile.mentorFollowers.map((user, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 mt-2">No mentees yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}