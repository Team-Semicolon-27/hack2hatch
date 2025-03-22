'use client';

import React, {useState, useEffect, JSX} from 'react';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {useSession} from "next-auth/react";
import mongoose from "mongoose";
import axios from "axios";

// Types based on your models
interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

interface Like {
  user: User;
  userType: 'Entrepreneur' | 'Mentor';
}

interface CommentType {
  _id: mongoose.Types.ObjectId;
  author: User;
  content: string;
  likes: Like[];
  createdAt: string;
}

interface Blog {
  _id: mongoose.Types.ObjectId;
  author: User;
  title: string;
  content: string;
  attachments: string[];
  likes: Like[];
  comments: CommentType[];
  links: string[];
  tags: string[];
  blogAI: string;
  createdAt: string;
  updatedAt: string;
}

const SingleBlogPost = () => {
  const session = useSession();
  const userId = session?.data?.user?.id;
  const userType = session?.data?.user?.userType;
  const params = useParams();
  const blogId = params.blogId as string;
  
  const [blogType, setType] = useState("")
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
  
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/blogs/${blogId}`);
        if (response.status === 200) {
          setBlog(response.data.blog);
          setType(response.data.type);
          setIsLikedByCurrentUser(response.data.blog.likes.some((like: Like) => like.user._id.toString() === userId));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (blogId) {
      fetchBlogPost();
    }
  }, [blogId]);
  
  if (!blog) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">Blog post not found</div>;
  }
  
  const handleLike = async () => {
    try {
      if (blogType === "entrepreneur") {
        if (!isLikedByCurrentUser) {
          const res = await axios.patch(`/api/blogs/entrepreneur/like/${blogId}`)
          if (res.status === 200) {
            if (userType === "entrepreneur") {
              // @ts-expect-error abc
              setBlog((prev) => (prev ? {...prev, likes: [...prev.likes, {user: userId, userType: "Entrepreneur" }] } : null));
            } else {
              // @ts-expect-error abc
              setBlog((prev) => (prev ? {...prev, likes: [...prev.likes, {user: userId, userType: "Mentor" }] } : null));
            }
            setIsLikedByCurrentUser(true);
          }
        } else {
          const res = await axios.delete(`/api/blogs/entrepreneur/like/${blogId}`)
          if (res.status === 200) {
            if (userType === "entrepreneur") {
              // @ts-expect-error abc
              setBlog((prev) => (prev ? {...prev, likes: prev.likes.filter((like) => like.user !== userId && userType !== "Entrepreneur") } : null));
            } else {
              // @ts-expect-error abc
              setBlog((prev) => (prev ? {...prev, likes: prev.likes.filter((like) => like.user !== userId && userType !== "Mentor") } : null));
            }
            setIsLikedByCurrentUser(false);
          }
        }
      } else {
      
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };
  
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // const updatedBlog = await response.json();
      // setBlog(updatedBlog);
      setCommentContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };
  
  const handleLikeComment = async (commentId: string) => {
    
    try {
      
      
      // const updatedBlog = await response.json();
      // setBlog(updatedBlog);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like comment');
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">Loading...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100 text-orange-600">{error}</div>;
  }
  
  const getFileName = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };
  
  // Helper function to determine file type icon
  const getFileTypeIcon = (fileName: string): JSX.Element => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
    }
  };
  
  const AttachmentCarousel = ({ attachments }: { attachments: string[]}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const goToNext = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === attachments.length - 1 ? 0 : prevIndex + 1
      );
    };
    
    const goToPrev = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? attachments.length - 1 : prevIndex - 1
      );
    };
    
    if (attachments.length === 0) return null;
    
    const fileName = getFileName(attachments[currentIndex]);
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
    
    return (
      <div className="my-4 border border-gray-200 rounded-lg overflow-hidden">
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div className="relative h-64 flex items-center justify-center bg-gray-100">
              {isImage ? (
                <img
                  src={attachments[currentIndex]}
                  alt={fileName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  {getFileTypeIcon(fileName)}
                  <span className="text-orange-600 font-medium mt-2 text-center">
                  {fileName}
                </span>
                  <a
                    href={attachments[currentIndex]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600"
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                  className={`block w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-orange-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white min-h-screen">
      {/* Error message if any */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Header with back button */}
        <div className="flex items-center py-3 sticky top-0 bg-white z-10 border-b border-gray-200">
          <button className="p-2 rounded-full hover:bg-gray-200 mr-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">Post</h2>
        </div>
        
        {/* Author info */}
        <div className="flex items-start pt-3 pb-2">
          <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-3 flex-shrink-0">
            {blog.author.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-bold text-gray-900 hover:underline">{blog.author.name}</p>
                <p className="text-gray-500 text-sm">@{blog.author.name.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
            </div>
            
            {/* Attachments Carousel - MOVED ABOVE CONTENT */}
            {blog.attachments.length > 0 && <AttachmentCarousel attachments={blog.attachments} />}
            
            {/* Post title */}
            <h1 className="text-xl font-bold mt-2 mb-1">{blog.title}</h1>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2 mb-3">
              {blog.tags.map((tag, index) => (
                <span key={index} className="text-orange-600 hover:underline cursor-pointer text-sm">
                #{tag}
              </span>
              ))}
            </div>
            
            {/* Blog content */}
            <div className="prose max-w-none my-3 text-gray-900">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
            
            {/* Timestamp */}
            <div className="text-gray-500 text-sm py-3 border-b border-gray-200">
              {new Date(blog.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {new Date(blog.createdAt).toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'})}
            </div>
            
            {/* Stats bar */}
            <div className="flex items-center justify-between py-3 text-sm text-gray-500 border-b border-gray-200">
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-gray-900">{blog.comments.length}</span> Comments
              </div>
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-gray-900">{blog.likes.length}</span> Likes
              </div>
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-gray-900">{blog.links.length + blog.attachments.length}</span> Shares
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <button className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
              </button>
              
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors ${
                  isLikedByCurrentUser
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={isLikedByCurrentUser ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
              
              <button className="p-2 rounded-full hover:bg-green-50 hover:text-green-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
              </button>
              
              <button className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </button>
            </div>
            
            {/* Links section */}
            {blog.links.length > 0 && (
              <div className="py-3 border-b border-gray-200">
                {blog.links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-orange-600 truncate">{link}</p>
                        <p className="text-xs text-gray-500 mt-1">External link</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            )}
            
            {/* Comments section */}
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-4">Comments</h3>
              
              {/* Add comment form */}
              <div className="flex mb-5">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                <div className="flex-1">
                  <form onSubmit={handleComment} className="relative">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Post your reply"
                    className="w-full border border-gray-200 rounded-2xl p-3 pr-20 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition"
                    rows={2}
                    required
                  />
                    <button
                      type="submit"
                      className="absolute bottom-2 right-2 px-4 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-200 text-sm font-bold disabled:opacity-70"
                      disabled={!commentContent.trim()}
                    >
                      Reply
                    </button>
                  </form>
                </div>
              </div>
              
              {/* Comments list */}
              {blog.comments.length === 0 ? (
                <div className="text-center py-8 border-t border-gray-200">
                  <p className="text-gray-500">No replies yet. Be the first to reply!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blog.comments.map((comment) => (
                    <div key={comment._id.toString()} className="flex pt-4 border-t border-gray-200">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                        {comment.author.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="font-bold text-gray-900 mr-2">{comment.author.name}</p>
                          <p className="text-gray-500 text-sm">@{comment.author.name.toLowerCase().replace(/\s+/g, '')}</p>
                          <span className="mx-1 text-gray-500">·</span>
                          <p className="text-gray-500 text-sm">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        
                        <p className="text-gray-900 mt-1">{comment.content}</p>
                        
                        <div className="flex mt-2 -ml-2">
                          <button className="p-2 text-gray-500 rounded-full hover:bg-blue-50 hover:text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleLikeComment(comment._id.toString())}
                            className={`p-2 rounded-full flex items-center ${
                              comment.likes.some(like => userId && like.user._id.toString() === userId)
                                ? 'text-orange-600'
                                : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill={comment.likes.some(like => userId && like.user._id.toString() === userId)
                                ? "currentColor"
                                : "none"
                              }
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                            {comment.likes.length > 0 && (
                              <span className="ml-1 text-xs">{comment.likes.length}</span>
                            )}
                          </button>
                          
                          <button className="p-2 text-gray-500 rounded-full hover:bg-green-50 hover:text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 0m-3.935 0l-9.566-5.314m9.566-4.064a2.25 2.25 0 10-3.935 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBlogPost;