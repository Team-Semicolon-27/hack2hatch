"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Twitter,
  MessageSquare,
  ExternalLink,
  Heart,
  MessageCircle,
  Repeat,
  ArrowUpFromLine,
  ArrowDownFromLine,
  Share2,
  Bookmark,
} from "lucide-react"

type Post = {
  platform: string
  likes: number
  comment: number
  author: string
  title: string
  type: string
  content: string
  media?: string | null
  url: string
  subreddit?: string
}

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/news")

        const data = await response.json()
        console.log(data)
        if (Array.isArray(data)) {
          // Shuffle the posts array for random order
          const shuffledPosts = [...data].sort(() => Math.random() - 0.5)
          setPosts(shuffledPosts)
        } else {
          console.error("Unexpected API response format", data)
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts =
    activeFilter === "all" ? posts : posts.filter((post) => post.platform.toLowerCase() === activeFilter)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Social Feed</h1>

      <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="reddit">Reddit</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse space-y-4 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No posts found for this platform.</div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post, index) => {
            if (post.platform.toLowerCase() === "twitter") {
              return <TwitterCard key={index} post={post} />
            } else if (post.platform.toLowerCase() === "reddit") {
              return <RedditCard key={index} post={post} />
            } else {
              return <DefaultCard key={index} post={post} />
            }
          })}
        </div>
      )}
    </div>
  )
}

function TwitterCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md">
      <CardContent className="p-0">
        <div className="bg-[#1DA1F2] h-1 w-full"></div>
        <div className="p-4">
          {/* Twitter header */}
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
              <AvatarFallback className="bg-[#1DA1F2] text-white">{post.author}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm">{post.author}</span>
                <span className="text-muted-foreground text-sm">@{post.author}</span>
              </div>
              <p className="text-sm text-muted-foreground">2h ago</p>
            </div>
            <Twitter className="h-5 w-5 text-[#1DA1F2] ml-auto" />
          </div>

          {/* Tweet content */}
          <div className="mt-2">
            <p className="text-[15px] leading-normal">{post.content || post.title}</p>

            {post.media && (post.type === "image" || post.type === "video") && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                {post.type === "image" ? (
                  <img src={post.media || "/placeholder.svg"} alt={post.title} className="w-full h-auto object-cover" />
                ) : (
                  <video controls className="w-full h-auto">
                    <source src={post.media} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
          </div>

          {/* Twitter actions */}
          <div className="flex justify-between mt-4 text-muted-foreground">
            <button className="flex items-center gap-1 text-xs hover:text-[#1DA1F2]">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comment}</span>
            </button>
            <button className="flex items-center gap-1 text-xs hover:text-green-500">
              <Repeat className="h-4 w-4" />
              <span>5</span>
            </button>
            <button className="flex items-center gap-1 text-xs hover:text-red-500">
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-xs hover:text-[#1DA1F2]">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 py-2 px-4 border-t">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs flex items-center gap-1 text-[#1DA1F2] hover:underline"
        >
          View on Twitter <ExternalLink className="h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  )
}

function RedditCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md">
      <CardContent className="p-0">
        <div className="bg-[#FF4500] h-1 w-full"></div>

        {/* Reddit header */}
        <div className="bg-gray-50 p-3 border-b flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/placeholder.svg?height=24&width=24" alt="Subreddit" />
            <AvatarFallback className="bg-[#FF4500] text-white text-xs">r/</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">r/{post.subreddit || "subreddit"}</span>
          <span className="text-xs text-muted-foreground">• Posted by u/{post.author} • 5h ago</span>
          <MessageSquare className="h-5 w-5 text-[#FF4500] ml-auto" />
        </div>

        {/* Reddit content */}
        <div className="flex">
          {/* Voting sidebar */}
          <div className="bg-gray-50 p-2 flex flex-col items-center border-r">
            <button className="text-gray-400 hover:text-[#FF4500]">
              <ArrowUpFromLine className="h-5 w-5" />
            </button>
            <span className="text-xs font-medium my-1">{post.likes}</span>
            <button className="text-gray-400 hover:text-blue-500">
              <ArrowDownFromLine className="h-5 w-5" />
            </button>
          </div>

          {/* Main content */}
          <div className="p-3 w-full">
            <h3 className="font-medium text-base">{post.title}</h3>

            {post.content && post.type === "text" && <p className="mt-2 text-sm">{post.content}</p>}

            {post.media && (post.type === "image" || post.type === "video") && (
              <div className="mt-3">
                {post.type === "image" ? (
                  <img
                    src={post.media || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-auto object-cover rounded"
                  />
                ) : (
                  <video controls className="w-full h-auto rounded">
                    <source src={post.media} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reddit actions */}
        <div className="border-t p-2 flex gap-4 text-xs text-muted-foreground">
          <button className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comment} Comments</span>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded">
            <Bookmark className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 py-2 px-4 border-t">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs flex items-center gap-1 text-[#FF4500] hover:underline"
        >
          View on Reddit <ExternalLink className="h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  )
}

function DefaultCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">{post.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{post.platform}</Badge>
              <span className="text-xs text-muted-foreground capitalize">{post.type}</span>
              <span className="text-xs text-muted-foreground">By {post.author}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {post.type === "text" && post.content && <p className="text-gray-800 dark:text-gray-200">{post.content}</p>}

        {post.media && (post.type === "image" || post.type === "video") && (
          <div className="mt-3 rounded-md overflow-hidden">
            {post.type === "image" ? (
              <img
                src={post.media || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-auto object-cover rounded-md"
              />
            ) : (
              <video controls className="w-full h-auto rounded-md">
                <source src={post.media} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm flex items-center gap-1">
            <Heart className="h-4 w-4 text-muted-foreground" />
            {post.likes}
          </span>
          <span className="text-sm flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            {post.comment}
          </span>
        </div>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm flex items-center gap-1 text-primary hover:underline"
        >
          View Original <ExternalLink className="h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  )
}

