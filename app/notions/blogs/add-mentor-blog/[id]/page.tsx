"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import toast from "react-hot-toast"
// Dynamically import TipTap editor
const TinyMce = dynamic(() => import("../../../../../components/ckeditor"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-orange-50 animate-pulse rounded"></div>,
})

export default function CreateBlog() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // State variables
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [attachments, setAttachments] = useState<string[]>([])
  const [tag, setTag] = useState("")
  const [link, setLink] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notionId, setNotionId] = useState("")

  // Extract notionId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("notionId")
    if (id) setNotionId(id)
  }, [])

  // Handle session status
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Handle tag addition
  const handleTagAdd = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTag("")
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Handle link addition
  const handleLinkAdd = () => {
    if (link && !links.includes(link)) {
      setLinks([...links, link])
      setLink("")
    }
  }

  const handleLinkRemove = (linkToRemove: string) => {
    setLinks(links.filter((l) => l !== linkToRemove))
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    const formData = new FormData()

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i])
    }

    try {
      const response = await fetch("/api/blogs/mentors", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("File upload failed")
      }

      const data = await response.json()
      setAttachments([...attachments, ...data.fileUrls])
      toast.success("Files uploaded successfully")
    } catch (error) {
      console.error("Error uploading files:", error)
      toast.error("Failed to upload files")
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleAttachmentRemove = (attachmentToRemove: string) => {
    setAttachments(attachments.filter((a) => a !== attachmentToRemove))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !content) {
      toast.error("Title and content are required")
      return
    }

    if (!notionId) {
      toast.error("Notion ID is required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          attachments,
          links,
          tags,
          notionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create blog post")
      }

      router.push(`/blogs/${data.data._id}`)
    } catch (error) {
      console.error("Error creating blog post:", error)
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Create New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-orange-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            placeholder="Enter blog title"
            required
          />
        </div>

        {/* Tags section */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-orange-700 mb-1">
            Tags
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="tags"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="flex-1 px-4 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((t, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
              >
                {t}
                <button
                  type="button"
                  onClick={() => handleTagRemove(t)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-500 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Links section */}
        <div>
          <label htmlFor="links" className="block text-sm font-medium text-orange-700 mb-1">
            Links
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="url"
              id="links"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 px-4 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              placeholder="Add a link"
            />
            <button
              type="button"
              onClick={handleLinkAdd}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none"
            >
              Add
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {links.map((l, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-md">
                <a
                  href={l}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline truncate"
                >
                  {l}
                </a>
                <button
                  type="button"
                  onClick={() => handleLinkRemove(l)}
                  className="ml-2 text-orange-400 hover:text-orange-500 focus:outline-none"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* File upload section */}
        <div>
          <label htmlFor="attachments" className="block text-sm font-medium text-orange-700 mb-1">
            Attachments
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-orange-200 border-dashed rounded-md bg-white">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-orange-300"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-orange-500">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-orange-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {attachments.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-orange-50">
                  {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <img src={url || "/placeholder.svg"} alt={`Attachment ${index}`} className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-orange-500">{url.split("/").pop()}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAttachmentRemove(url)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content editor */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-orange-700 mb-1">
            Content
          </label>
          <div className="border border-orange-200 rounded-md overflow-hidden">
            <TinyMce 
              value={content} 
              onChange={setContent}
            />
          </div>
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none disabled:bg-orange-300 transition-colors duration-200 font-medium"
            disabled={loading || !title || !content}
            onClick={handleSubmit}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </span>
            ) : (
              "Create Blog Post"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

