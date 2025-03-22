"use client"

import React, {useState, useEffect, Suspense} from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type mongoose from "mongoose"

interface Notion {
  _id: mongoose.Schema.Types.ObjectId
  owner: {
    _id: mongoose.Schema.Types.ObjectId
    name: string
    username: string
    profileImage: string
  }
  title: string
  logo: string
  description: string
}

export default function NotionPage() {
  return (
    <Suspense fallback={null}>
      <SearchNotionsPage />
    </Suspense>
  )
}

const SearchNotionsPage = () => {
  const [notions, setNotions] = useState<Notion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize search query from URL parameters
  useEffect(() => {
    const queryParam = searchParams.get('q')
    if (queryParam) {
      setSearchQuery(queryParam)
      performSearch(queryParam)
    }
  }, [searchParams])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    } else {
      setNotions([])
    }
  }

  // Function to perform the search
  const performSearch = async (query: string) => {
    if (!query.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await axios.post('/api/notion-search', {
        query: query.trim()
      });
  
      if (res.status === 200) {
        setNotions(res.data.results)
      } else {
        setError("Failed to load search results. Please try again.")
      }
    } catch (error) {
      console.error("Error searching notions:", error)
      setError("An error occurred while searching. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col mb-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-orange-500">Search</span> Notions
            </h1>
            <p className="text-gray-600 mt-2">
              Find notions by title, description, or content.
            </p>
          </div>
          
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-4 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Search for notions and press Enter..."
                aria-label="Search for notions"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setNotions([])
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-200 h-48 w-full"></div>
                <div className="p-5">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex items-center">
                    <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                    <div className="ml-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto">
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Search Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => performSearch(searchQuery)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : notions.length > 0 ? (
          <div>
            <p className="text-gray-600 mb-6">Found {notions.length} results for "{searchQuery}"</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {notions.map((notion) => (
                <div
                  key={notion._id.toString()}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => router.push(`/notions/${notion._id.toString()}`)}
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
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notion.description}</p>

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
          </div>
        ) : searchQuery.trim() ? (
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any notions matching "{searchQuery}". Try different keywords.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-orange-300 mx-auto mb-4"
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Search for notions</h2>
            <p className="text-gray-600 mb-6">
              Type in the search box above and press Enter to search.
            </p>
            <Link
              href="/my-notions"
              className="text-orange-500 hover:text-orange-600 font-medium transition-colors inline-flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              View My Notions
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}