"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {useRouter} from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";

interface Blog {
  _id: string
  title: string
  content: string
  author: {
    _id: mongoose.Types.ObjectId
    name: string
    username: string
    profileImage: string
  }
  notion: {
    title: string
    logo: string
  }
  likesCount: number
  attachments: string[]
  links: string[]
  tags: string[]
}

export default function BlogsPage() {
  const [blogE, setBlogE] = useState<Blog[]>([])
  const [blogM, setBlogM] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await axios.get("/api/blogs") // Ensure this matches your API route
        if (res.status === 200) {
          setBlogE(res.data.blogE || [])
          setBlogM(res.data.blogM || [])
        }
      } catch (err) {
        setError("error")
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBlogs()
  }, [])
  
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-orange-300 mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  
  if (error)
    return (
      <div className="text-center p-8 bg-gray-100 rounded-lg border border-gray-200">
        <p className="text-red-500 font-medium">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-orange-400 pb-2">Blogs</h1>
      
      {/* Entrepreneur Blogs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="bg-orange-500 w-2 h-6 mr-2 rounded"></span>
          Entrepreneur Blogs
        </h2>
        {blogE.length === 0 ? (
          <p className="text-gray-500 bg-gray-100 p-4 rounded-lg text-center">No entrepreneur blogs found</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {blogE.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>
      
      {/* Mentor Blogs */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="bg-orange-500 w-2 h-6 mr-2 rounded"></span>
          Mentor Blogs
        </h2>
        {blogM.length === 0 ? (
          <p className="text-gray-500 bg-gray-100 p-4 rounded-lg text-center">No mentor blogs found</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {blogM.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// Blog Card Component
function BlogCard({ blog }: { blog: Blog }) {
  const router = useRouter()
  
  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="relative">
            <img
              src={blog.author.profileImage || "/placeholder.svg?height=48&width=48"}
              alt={blog.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=48&width=48"
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1">
              <img
                src={blog.notion.logo || "/placeholder.svg?height=16&width=16"}
                alt={blog.notion.title}
                className="w-4 h-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=16&width=16"
                }}
              />
            </div>
          </div>
          <Link href={`../profile/${blog.author._id.toString()}`} className="ml-3">
            <p className="font-bold text-gray-800">{blog.author.name}</p>
            <p className="text-gray-500 text-sm">@{blog.author.username}</p>
          </Link>
        </div>
        
        <h3 onClick={() => router.push(`/blogs/${blog._id.toString()}`)} className="text-lg font-semibold text-gray-800 mb-2 h-14 overflow-hidden">
          {truncateText(blog.title, 60)}
        </h3>
        <p className="text-gray-600 mb-3 h-20 overflow-hidden">{truncateText(blog.content, 120)}</p>
        
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {blog.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center">
                #{tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center text-orange-500">
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
            <span className="text-sm font-medium">{blog.likesCount} Likes</span>
          </div>
          
          {blog.attachments?.length > 0 && (
            <div className="flex items-center text-gray-500 hover:text-orange-500 transition-colors">
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="text-sm">{blog.attachments.length} Files</span>
            </div>
          )}
        </div>
        
        {blog.attachments?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              Attachments
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
              {blog.attachments.slice(0, 2).map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-orange-500 flex items-center overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span className="overflow-hidden text-ellipsis">{url.split("/").pop() || url}</span>
                </a>
              ))}
              {blog.attachments.length > 2 && (
                <p className="text-xs text-gray-500 italic">+{blog.attachments.length - 2} more attachments</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-5 py-3">
        <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">Read More</button>
      </div>
    </div>
  )
}

