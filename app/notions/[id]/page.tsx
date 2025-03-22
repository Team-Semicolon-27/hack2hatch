"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import type mongoose from "mongoose"

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
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const [notion, setNotion] = useState<Notion | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"all" | "entrepreneur" | "mentor">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const isMentor = session?.user?.userType === "mentor"
  
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
        if (isMentor) {
          setNotion((prev) => (prev ? { ...prev, isMentor: true } : null))
        } else {
          setNotion((prev) => (prev ? { ...prev, isMember: true } : null))
        }
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
        setNotion((prev) => (prev ? { ...prev, isMember: false, isMentor: false, isTeamMember: false } : null))
      }
    } catch (error) {
      console.error("Error performing action:", error)
    } finally {
      setActionLoading(false)
    }
  }
  
  const handleAddTeamMember = () => {
    if (!id) {
      console.error("Notion ID is missing")
      return
    }
    
    router.replace(`/notion/${id}/add-team-members`)
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
    
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.tags && blog.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
    )
  })()
  
  // Get blog type (entrepreneur or mentor)
  const getBlogType = (blog: Blog): string => {
    if (!notion) return ""
    return notion.blogsE.some((b) => b._id.toString() === blog._id.toString()) ? "entrepreneur" : "mentor"
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
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar with back button and action buttons */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          {/* Action buttons moved to top */}
          <div className="flex flex-wrap gap-2">
            {notion.isOwner ? (
              <>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                >
                  {actionLoading ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  ) : (
                    <>Delete</>
                  )}
                </button>
                <button
                  onClick={handleAddTeamMember}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  Add Team
                </button>
                <div className="hidden sm:flex gap-2">
                  <button
                    onClick={() => router.push(`/chat/mentor/${id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Chat Mentors
                  </button>
                  <button
                    onClick={() => router.push(`/chat/teamMember/${id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Chat Team
                  </button>
                </div>
              </>
            ) : notion.isMentor || notion.isMember || notion.isTeamMember ? (
              <>
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                >
                  {actionLoading ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  ) : (
                    <>Leave</>
                  )}
                </button>
                {notion.isTeamMember && !notion.isOwner && (
                  <button
                    onClick={() => router.push(`/chat/teamMember/${id}`)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Chat Owner
                  </button>
                )}
                {notion.isMentor && !notion.isOwner && (
                  <button
                    onClick={() => router.push(`/chat/mentor/${id}`)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Chat Owner
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading ? (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                ) : (
                  <>Join</>
                )}
              </button>
            )}
            
            {!isMentor && (
              <Link
                href="/my-notions"
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                My Notions
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar with notion info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-20">
              {/* Header with logo and title */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white p-2 rounded-lg shadow-md mb-3">
                    <img
                      src={notion.logo || "/placeholder.svg?height=100&width=100"}
                      alt={notion.title}
                      className="w-20 h-20 object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=100&width=100"
                      }}
                    />
                  </div>
                  <h1 className="text-xl font-bold mb-2">{notion.title}</h1>
                  <div className="flex flex-wrap justify-center gap-2 mb-2">
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
                </div>
              </div>
              
              {/* Description */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
                <p className="text-gray-700 text-sm whitespace-pre-line">
                  {notion.description || "No description provided."}
                </p>
              </div>
              
              {/* Owner info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Owner</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={notion.owner.profileImage || "/placeholder.svg?height=48&width=48"}
                    alt={notion.owner.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=48&width=48"
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{notion.owner.name}</p>
                    <p className="text-xs text-gray-500">@{notion.owner.username}</p>
                  </div>
                </div>
              </div>
              
              {/* Mobile-only action buttons */}
              <div className="lg:hidden p-4 bg-gray-50 flex flex-wrap gap-2 justify-center border-t border-gray-100">
                {notion.isOwner && (
                  <>
                    <button
                      onClick={() => router.push(`/chat/mentor/${id}`)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Chat Mentors
                    </button>
                    <button
                      onClick={() => router.push(`/chat/teamMember/${id}`)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Chat Team
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Main content area with blogs */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Blogs header with search and filters */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
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
                  <div>
                    {notion.isOwner || notion.isTeamMember ? (
                      <Link
                        href={`/notions/blogs/add-entrepreneur/${id}`}
                        className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Blog
                      </Link>
                    ) : notion.isMentor ? (
                      <Link
                        href={`/notions/blogs/add-mentor-blog/${id}`}
                        className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Blog
                      </Link>
                    ) : null}
                  </div>
                </div>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
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
                        activeTab === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              </div>
              
              {/* Blogs grid */}
              <div className="p-6">
                {filteredBlogs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBlogs.map((blog) => (
                      <Link
                        href={`/blogs/${blog._id.toString()}`}
                        key={blog._id.toString()}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
                      >
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-gray-800 line-clamp-2">{blog.title}</h3>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                                getBlogType(blog) === "entrepreneur"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {getBlogType(blog) === "entrepreneur" ? "E" : "M"}
                            </span>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <img
                              src={blog.author.profileImage || "/placeholder.svg?height=24&width=24"}
                              alt={blog.author.name}
                              className="w-6 h-6 rounded-full mr-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=24&width=24"
                              }}
                            />
                            <p className="text-sm text-gray-500">{blog.author.name}</p>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{blog.content}</p>
                          
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {blog.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {blog.tags.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                  +{blog.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center">
                          <div className="flex items-center text-xs text-gray-500 space-x-3">
                            <span className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 mr-1 text-orange-500"
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
                              {blog.likes}
                            </span>
                            <span className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 mr-1 text-gray-500"
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
                              {blog.comments}
                            </span>
                          </div>
                          <span className="text-xs text-orange-500 font-medium">Read more</span>
                        </div>
                      </Link>
                    ))}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
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
          </div>
        </div>
      </div>
    </div>
  )
}

