"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import mongoose from "mongoose";

interface User {
  _id: mongoose.Types.ObjectId
  name: string
  username: string
  profileImage: string
}

interface Blog {
  _id: mongoose.Types.ObjectId
  title: string
  author: User
  content: string
  tags: string[]
  attachments: string[]
  likes: number
  comments: number
  links: string[]
}

interface Notion {
  _id: mongoose.Types.ObjectId
  title: string
  logo: string
  description: string
  owner: User
  blogsE: Blog[]
  blogsM: Blog[]
  isOwner: boolean
  isMentor: boolean
  isMember: boolean
  isTeamMember: boolean
}

export default function NotionDetailsPage() {
  const router = useRouter()
  const {id} = useParams()
  const [notion, setNotion] = useState<Notion | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"all" | "entrepreneur" | "mentor">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  
  useEffect(() => {
    const fetchNotion = async () => {
      try {
        const res = await axios.get(`/api/entrepreneur/notions/${id}`)
        setNotion(res.data)
      } catch (error) {
        console.error("Error fetching notion:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotion()
  }, [id])
  
  const handleJoin = async () => {
    try {
      setActionLoading(true)
      const res = await axios.patch(`/api/entrepreneur/notions/join/${id}`)
      if (res.status === 200) {
        router.refresh()
        // Update local state to reflect changes immediately
        setNotion((prev) => (prev ? {...prev, isMember: true} : null))
      }
    } catch (error) {
      console.error("Error performing action:", error)
    } finally {
      setActionLoading(false)
    }
  }
  
  const handleLeave = async () => {
    try {
      setActionLoading(true)
      const res = await axios.patch(`/api/entrepreneur/notions/leave/${id}`)
      if (res.status === 200) {
        router.refresh()
        // Update local state to reflect changes immediately
        setNotion((prev) => (prev ? {...prev, isMember: false, isMentor: false, isTeamMember: false} : null))
      }
    } catch (error) {
      console.error("Error performing action:", error)
    } finally {
      setActionLoading(false)
    }
  }
  
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this notion? This action cannot be undone.")) {
      return
    }
    
    try {
      setActionLoading(true)
      const res = await axios.delete(`/api/entrepreneur/notions/${id}`)
      if (res.status === 200) {
        router.push("/my-notions")
      }
    } catch (error) {
      console.error("Error performing action:", error)
    } finally {
      setActionLoading(false)
    }
  }
  
  // Filter blogs based on active tab and search query
  const filteredBlogs = (() => {
    if (!notion) return []
    
    let blogs: Blog[] = []
    if (activeTab === "all") blogs = [...notion.blogsE, ...notion.blogsM]
    else if (activeTab === "entrepreneur") blogs = notion.blogsE
    else if (activeTab === "mentor") blogs = notion.blogsM
    
    if (searchQuery.trim() === "") return blogs
    
    return blogs.filter(blog =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
  })()
  
  // Get blog type (entrepreneur or mentor)
  const getBlogType = (blog: Blog): string => {
    if (!notion) return ""
    return notion.blogsE.some(b => b._id === blog._id) ? "entrepreneur" : "mentor"
  }
  
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-orange-300 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  
  if (!notion)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-orange-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Notion Not Found</h1>
          <p className="text-gray-600 mb-6">
            The notion you&#39;re looking for doesn&#39;t exist or you don&#39;t have permission to view it.
          </p>
          <button
            onClick={() => router.push("/my-notions")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back
          </button>
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header section */}
          <div className="relative bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <img
                  src={notion.logo || "/placeholder.svg?height=100&width=100"}
                  alt={notion.title}
                  className="w-24 h-24 object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=100&width=100"
                  }}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{notion.title}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  {notion.isOwner && (
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Owner</span>
                  )}
                  {notion.isMentor && (
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Mentor</span>
                  )}
                  {notion.isTeamMember && (
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Team Member</span>
                  )}
                  {notion.isMember && !notion.isMentor && !notion.isTeamMember && !notion.isOwner && (
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Member</span>
                  )}
                </div>
                <p className="text-white/90">{notion.description}</p>
              </div>
            </div>
          </div>
          
          {/* Owner section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Owner
            </h2>
            <div className="flex items-center gap-3">
              <img
                src={notion.owner.profileImage || "/placeholder.svg?height=48&width=48"}
                alt={notion.owner.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=48&width=48"
                }}
              />
              <div>
                <p className="font-medium text-gray-800">{notion.owner.name}</p>
                <p className="text-sm text-gray-500">@{notion.owner.username}</p>
              </div>
            </div>
          </div>
          
          {/* Blogs section */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 8l-7 5-7-5M5 19h14a2 2 0 002-2v-5"
                    />
                  </svg>
                  Blogs ({notion.blogsE.length + notion.blogsM.length})
                </h2>
                <div className="flex items-center space-x-2">
                  {notion.isOwner || notion.isTeamMember ? (
                    <Link
                      href={`/notions/blogs/add-entrepreneur/${id}`}
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                      </svg>
                      Add Blog
                    </Link>
                  ) : notion.isMentor ? (
                    <Link
                      href={`/notions/blogs/add-mentor-blog/${id}`}
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                      </svg>
                      Add Blog
                    </Link>
                  ) : null}
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="mb-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "all"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } rounded-l-lg transition-colors`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("entrepreneur")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "entrepreneur"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    Entrepreneur ({notion.blogsE.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("mentor")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "mentor"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } rounded-r-lg transition-colors`}
                  >
                    Mentor ({notion.blogsM.length})
                  </button>
                </div>
              </div>
              
              {/* Blogs list */}
              {filteredBlogs.length > 0 ? (
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid gap-3">
                    {filteredBlogs.map((blog) => (
                      <div
                        key={blog._id.toString()}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border-l-4 border-l-orange-500"
                      >
                        <div  className="flex justify-between items-start mb-2">
                          <Link href={`/blogs/${blog._id.toString()}`} className="font-medium text-gray-800">{blog.title}</Link>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            getBlogType(blog) === "entrepreneur"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {getBlogType(blog) === "entrepreneur" ? "Entrepreneur" : "Mentor"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={blog.author.profileImage || "/placeholder.svg?height=24&width=24"}
                            alt={blog.author.name}
                            className="w-6 h-6 rounded-full mr-2"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=24&width=24"
                            }}
                          />
                          <p className="text-sm text-gray-500">By {blog.author.name}</p>
                        </div>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {blog.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            {blog.likes} likes
                          </span>
                          <span className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                              />
                            </svg>
                            {blog.comments} comments
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <p className="text-gray-500">
                    {searchQuery.trim() !== ""
                      ? "No blogs found matching your search criteria."
                      : activeTab === "all"
                        ? "No blogs available yet."
                        : activeTab === "entrepreneur"
                          ? "No entrepreneur blogs available yet."
                          : "No mentor blogs available yet."}
                  </p>
                  {(notion.isOwner || notion.isTeamMember) && activeTab !== "mentor" && (
                    <Link
                      href={`/notions/blogs/add-entrepreneur/${id}`}
                      className="mt-3 inline-block text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Add an entrepreneur blog
                    </Link>
                  )}
                  {notion.isMentor && activeTab !== "entrepreneur" && (
                    <Link
                      href={`/notions/blogs/add-mentor-blog/${id}`}
                      className="mt-3 inline-block text-orange-500 hover:text-orange-600 font-medium ml-4"
                    >
                      Add a mentor blog
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="bg-gray-50 p-6 flex flex-wrap gap-3 justify-center md:justify-start">
            {notion.isOwner ? (
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Notion
                  </>
                )}
              </button>
            ) : notion.isMentor || notion.isMember || notion.isTeamMember ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Leave Notion
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Join Notion
                  </>
                )}
              </button>
            )}
            
            <Link
              href="/my-notions"
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              My Notions
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}