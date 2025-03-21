"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import type mongoose from "mongoose"

interface User {
  name: string
  username: string
  profileImage: string
}

interface Notion {
  _id: mongoose.Types.ObjectId
  title: string
  logo: string
  owner: User
}

export default function NotionsListPage() {
  const [notions, setNotions] = useState<Notion[]>([])
  const [search, setSearch] = useState<string>("")
  const [filteredNotions, setFilteredNotions] = useState<Notion[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    const fetchNotions = async () => {
      try {
        const res = await axios.get("/api/notions")
        if (res.status === 200) {
          setNotions(res.data)
          setFilteredNotions(res.data)
        }
      } catch (error) {
        console.error("Error fetching notions:", error)
        setError("Failed to load notions. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotions()
  }, [])
  
  useEffect(() => {
    const filtered = notions.filter((notion) => notion.title.toLowerCase().includes(search.toLowerCase()))
    setFilteredNotions(filtered)
  }, [search, notions])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center mt-40">
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48 w-48"></div>
            ))}
          </div>
          <div className="animate-pulse bg-orange-200 h-6 w-40 rounded mt-6"></div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <span className="text-orange-500">Explore</span> Notions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover and join communities of entrepreneurs and mentors sharing knowledge and experiences.
          </p>
        </div>
        
        <div className="relative max-w-md mx-auto mb-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
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
          <input
            type="text"
            placeholder="Search Notions..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {filteredNotions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotions.map((notion) => (
              <div
                key={notion._id.toString()}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => router.push(`/notions/${notion._id}`)}
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={notion.logo || "/placeholder.svg?height=200&width=400"}
                    alt={notion.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=400"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 w-full">
                      <p className="text-white text-sm font-medium">Click to view details</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">{notion.title}</h2>
                  
                  <div className="flex items-center">
                    <img
                      src={notion.owner.profileImage || "/placeholder.svg?height=40&width=40"}
                      alt={notion.owner.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=40&width=40"
                      }}
                    />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-800">{notion.owner.name}</p>
                      <p className="text-xs text-gray-500">@{notion.owner.username}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <button className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors">
                    View Notion →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300 mx-auto mb-4"
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">No notions found</h2>
            <p className="text-gray-600 mb-6">
              {search ? `No results found for "${search}"` : "There are no notions available at the moment."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <button
            onClick={() => router.push("/create-notion")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Notion
          </button>
        </div>
      </div>
    </div>
  )
}

