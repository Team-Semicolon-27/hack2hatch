"use client"

import type React from "react"
import { useState, useEffect, type JSX } from "react"
import { useParams, useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"
import type mongoose from "mongoose"
import axios from "axios"
import Link from "next/link"

// Types based on your models
interface User {
  _id: mongoose.Types.ObjectId
  name: string
  username: string
  profileImage?: string
}

interface CommentType {
  _id: mongoose.Types.ObjectId
  author: User
  content: string
  likes: mongoose.Types.ObjectId[]
  createdAt: string
}

interface Blog {
  _id: mongoose.Types.ObjectId
  author: User
  title: string
  content: string
  attachments: string[]
  likes: mongoose.Types.ObjectId[]
  comments: CommentType[]
  mentorComments: CommentType[]
  links: string[]
  tags: string[]
  blogAI: string
  createdAt: string
  updatedAt: string
}

export default function SingleBlogPost(){
  const session = useSession()
  const [userId, setUserId] = useState<string | undefined>(session?.data?.user?.id)
  const params = useParams()
  const blogId = params.blogId as string
  const router = useRouter()
  
  const [blogType, setType] = useState("")
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentContent, setCommentContent] = useState("")
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/blogs/${blogId}`)
        if (response.status === 200) {
          setUserId(response.data.userId)
          setBlog(response.data.blog)
          setType(response.data.type)
          setIsLikedByCurrentUser(
            response.data.blog.likes.some(
              (like: mongoose.Types.ObjectId) => like.toString() === response.data.userId.toString(),
            ),
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    
    if (blogId) {
      fetchBlogPost()
    }
  }, [blogId])
  
  const handleLike = async () => {
    if (!userId || !blog) return
    
    try {
      const endpoint =
        blogType === "entrepreneur" ? `/api/blogs/entrepreneur/like/${blogId}` : `/api/blogs/mentors/like/${blogId}`
      
      if (!isLikedByCurrentUser) {
        const res = await axios.patch(endpoint)
        if (res.status === 200) {
          setBlog({
            ...blog,
            likes: [...blog.likes, userId as any],
          })
          setIsLikedByCurrentUser(true)
        }
      } else {
        const res = await axios.delete(endpoint)
        if (res.status === 200) {
          setBlog({
            ...blog,
            likes: blog.likes.filter((like) => like.toString() !== userId),
          })
          setIsLikedByCurrentUser(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to like post")
    }
  }
  
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim() || !blog) return
    
    setSubmittingComment(true)
    
    try {
      const endpoint =
        blogType === "entrepreneur"
          ? `/api/blogs/entrepreneur/comment/${blogId}`
          : `/api/blogs/mentors/comment/${blogId}`
      
      const res = await axios.post(endpoint, { content: commentContent })
      
      if (res.status === 200) {
        const newComment = res.data.newComment
        
        if (res.data.type === "entrepreneur") {
          setBlog({
            ...blog,
            comments: [...blog.comments, newComment],
          })
        } else {
          setBlog({
            ...blog,
            mentorComments: [...blog.mentorComments, newComment],
          })
        }
        setCommentContent("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }
  
  const handleLikeComment = async (commentId: string, isRegularComment: boolean, liked: boolean) => {
    if (!userId || !blog) return
    
    try {
      const endpoint = isRegularComment
        ? `/api/blogs/entrepreneur/comment/${commentId}`
        : `/api/blogs/entrepreneur/mentorComment/${commentId}`
      
      if (!liked) {
        // Like the comment
        const res = await axios.patch(endpoint)
        if (res.status === 200) {
          // Update state correctly
          if (isRegularComment) {
            setBlog({
              ...blog,
              comments: blog.comments.map((comment) =>
                comment._id.toString() === commentId
                  ? { ...comment, likes: [...comment.likes, userId as any] }
                  : comment,
              ),
            })
          } else {
            setBlog({
              ...blog,
              mentorComments: blog.mentorComments.map((comment) =>
                comment._id.toString() === commentId
                  ? { ...comment, likes: [...comment.likes, userId as any] }
                  : comment,
              ),
            })
          }
        }
      } else {
        // Unlike the comment
        const res = await axios.delete(endpoint)
        if (res.status === 200) {
          // Update state correctly
          if (isRegularComment) {
            setBlog({
              ...blog,
              comments: blog.comments.map((comment) =>
                comment._id.toString() === commentId
                  ? { ...comment, likes: comment.likes.filter((like) => like.toString() !== userId) }
                  : comment,
              ),
            })
          } else {
            setBlog({
              ...blog,
              mentorComments: blog.mentorComments.map((comment) =>
                comment._id.toString() === commentId
                  ? { ...comment, likes: comment.likes.filter((like) => like.toString() !== userId) }
                  : comment,
              ),
            })
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to like comment")
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading post...</p>
        </div>
      </div>
    )
  }
  
  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Blog Post Not Found</h2>
          <p className="text-gray-600 mb-6">
            The blog post you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => router.push("/blogs")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go Back to Blogs
          </button>
        </div>
      </div>
    )
  }
  
  const getFileName = (url: string): string => {
    const parts = url.split("/")
    return parts[parts.length - 1]
  }
  
  // Helper function to determine file type icon
  const getFileTypeIcon = (fileName: string): JSX.Element => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    
    switch (extension) {
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        )
      case "doc":
      case "docx":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        )
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-green-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        )
    }
  }
  
  const AttachmentCarousel = ({ attachments }: { attachments: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    
    const goToNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex === attachments.length - 1 ? 0 : prevIndex + 1))
    }
    
    const goToPrev = () => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? attachments.length - 1 : prevIndex - 1))
    }
    
    if (attachments.length === 0) return null
    
    const fileName = getFileName(attachments[currentIndex])
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName)
    
    return (
      <div className="my-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div className="relative h-80 md:h-96 flex items-center justify-center bg-gray-100">
              {isImage ? (
                <img
                  src={attachments[currentIndex] || "/placeholder.svg"}
                  alt={fileName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  {getFileTypeIcon(fileName)}
                  <span className="text-orange-600 font-medium mt-2 text-center">{fileName}</span>
                  <a
                    href={attachments[currentIndex]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation buttons */}
          {attachments.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}
          
          {/* Pagination indicator */}
          {attachments.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
              {attachments.map((_, idx) => (
                <span
                  key={idx}
                  className={`block w-2 h-2 rounded-full ${idx === currentIndex ? "bg-orange-500" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Render comment component to avoid repetition
  const CommentItem = ({
                         comment,
                         isRegularComment,
                       }: {
    comment: CommentType
    isRegularComment: boolean
  }) => {
    const isLiked = comment.likes.some((like) => userId && like.toString() === userId.toString())
    
    return (
      <div className="flex pt-4 border-t border-gray-200">
        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap">
            <Link
              href={`../../profile/${comment.author._id.toString()}`}
              className="font-bold text-gray-900 mr-2 hover:text-orange-500 transition-colors"
            >
              {comment.author.name}
            </Link>
            <p className="text-gray-500 text-sm">
              @{comment.author.username || comment.author.name.toLowerCase().replace(/\s+/g, "")}
            </p>
            <span className="mx-1 text-gray-500">·</span>
            <p className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          <p className="text-gray-900 mt-1">{comment.content}</p>
          
          <div className="flex mt-2 -ml-2">
            <button
              onClick={() => handleLikeComment(comment._id.toString(), isRegularComment, isLiked)}
              className={`p-2 rounded-full flex items-center ${
                isLiked ? "text-orange-600" : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {comment.likes.length > 0 && <span className="ml-1 text-xs">{comment.likes.length}</span>}
            </button>
            
            <button className="p-2 text-gray-500 rounded-full hover:bg-blue-50 hover:text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                />
              </svg>
            </button>
            
            <button className="p-2 text-gray-500 rounded-full hover:bg-green-50 hover:text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 0m-3.935 0l-9.566-5.314m9.566-4.064a2.25 2.25 0 10-3.935 0"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">Blog Post</h2>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>
      </div>
      
      {/* Error message if any */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-md">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-orange-700 hover:text-orange-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - author info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-20">
              {/* Author info */}
              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-3">
                    {blog.author.name.charAt(0).toUpperCase()}
                  </div>
                  <Link href={`../../profile/${blog.author._id.toString()}`} className="group">
                    <p className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                      {blog.author.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      @{blog.author.username || blog.author.name.toLowerCase().replace(/\s+/g, "")}
                    </p>
                  </Link>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-500 text-sm">
                    Posted on{" "}
                    {new Date(blog.createdAt).toLocaleDateString([], {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-500 text-sm">
                    at {new Date(blog.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{blog.likes.length}</p>
                    <p className="text-xs text-gray-500">Likes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{blog.comments.length + blog.mentorComments.length}</p>
                    <p className="text-xs text-gray-500">Comments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                {/* Blog title with badge showing post type */}
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-2xl font-bold text-gray-800">{blog.title}</h1>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                    {blogType === "entrepreneur" ? "Entrepreneur" : "Mentor"}
                  </span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-orange-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Attachments Carousel - larger for better visibility */}
                {blog.attachments.length > 0 && (
                  <div className="my-6">
                    <AttachmentCarousel attachments={blog.attachments} />
                  </div>
                )}
                
                {/* Blog content */}
                <div className="prose max-w-none my-6 text-gray-800">
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                </div>
                
                {/* Links section */}
                {blog.links.length > 0 && (
                  <div className="my-6 space-y-3">
                    <h3 className="font-semibold text-gray-800">Related Links</h3>
                    {blog.links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-orange-600 truncate font-medium">{link}</p>
                            <p className="text-xs text-gray-500 mt-1">External link</p>
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                
                {/* Action buttons - sticky to the top of the content */}
                <div className="sticky top-[73px] z-10 bg-white border-b border-gray-200 py-3 -mx-6 px-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                          isLikedByCurrentUser
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                        } transition-colors`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill={isLikedByCurrentUser ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                        {isLikedByCurrentUser ? "Liked" : "Like"}
                      </button>
                      
                      <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                          />
                        </svg>
                        Comment
                      </button>
                    </div>
                    
                    <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 0m-3.935 0l-9.566-5.314m9.566-4.064a2.25 2.25 0 10-3.935 0"
                        />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
                
                {/* Comments section */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl mb-4">
                    Comments ({blog.comments.length + blog.mentorComments.length})
                  </h3>
                  
                  {/* Add comment form */}
                  <div className="flex mb-6">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      {session?.data?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <form onSubmit={handleComment} className="relative">
                        <textarea
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Add your comment..."
                          className="w-full border border-gray-200 rounded-lg p-3 pr-20 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition"
                          rows={2}
                          required
                        />
                        <button
                          type="submit"
                          className="absolute bottom-2 right-2 px-4 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-200 text-sm font-bold disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1"
                          disabled={!commentContent.trim() || submittingComment}
                        >
                          {submittingComment ? (
                            <>
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
                              <span>Posting...</span>
                            </>
                          ) : (
                            "Post"
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                  
                  {/* Comments list */}
                  {blog.comments.length === 0 && blog.mentorComments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
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
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Mentor comments first */}
                      {blog.mentorComments.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Mentor Comments</h4>
                          {blog.mentorComments.map((comment) => (
                            <CommentItem key={comment._id.toString()} comment={comment} isRegularComment={false} />
                          ))}
                        </div>
                      )}
                      
                      {/* Regular comments */}
                      {blog.comments.length > 0 && (
                        <div>
                          {blog.mentorComments.length > 0 && (
                            <h4 className="text-sm font-medium text-gray-500 mb-2">User Comments</h4>
                          )}
                          {blog.comments.map((comment) => (
                            <CommentItem key={comment._id.toString()} comment={comment} isRegularComment={true} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}