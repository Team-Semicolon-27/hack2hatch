"use client"

import { useState, useRef } from "react"
import { CldUploadButton } from "next-cloudinary"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function AddNotionPage() {
  // Form state
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    logo: ""
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  // Handle direct file selection (alternative to Cloudinary widget)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setFormState(prev => ({ ...prev, logo: previewUrl }))
    setLogoFile(file)
  }

  // Handle Cloudinary widget upload
  const handleCloudinaryUpload = (result: any) => {
    if (result.event === "success") {
      setFormState(prev => ({ ...prev, logo: result.info.secure_url }))
      setLogoFile(null)
    }
  }

  // Upload file to Cloudinary manually (if not using widget)
  const uploadToCloudinary = async (): Promise<string> => {
    if (!logoFile) return ""
    
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append("file", logoFile)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")
      
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
      
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData
      })
      
      const data = await response.json()
      
      if (data.secure_url) {
        return data.secure_url
      } else {
        throw new Error("Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { title, description, logo } = formState
    
    if (!title || !description || (!logo && !logoFile)) {
      alert("Title, description, and logo are required!")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Upload image if using file input method
      let logoUrl = logo
      if (logoFile) {
        logoUrl = await uploadToCloudinary()
      }
      
      // Create the notion
      const response = await axios.post("/api/entrepreneur/notions", {
        title,
        description,
        logo: logoUrl,
      })
      
      if (response.status === 200) {
        router.push("/my-notions")
      } else {
        alert("Failed to create notion. Please try again.")
      }
    } catch (error) {
      console.error("Error creating notion:", error)
      alert("An error occurred while creating the notion.")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset logo selection
  const handleRemoveLogo = () => {
    setFormState(prev => ({ ...prev, logo: "" }))
    setLogoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <span className="text-orange-500">Create</span> New Notion
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your knowledge and experiences with entrepreneurs and mentors in the community.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter notion title"
                value={formState.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Description field */}
            <div>
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter notion description"
                value={formState.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Logo upload */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Logo
              </label>
              <div className="flex gap-4 mb-4">
                {/* Cloudinary Upload Widget */}
                <CldUploadButton
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""}
                  onUpload={handleCloudinaryUpload}
                  options={{
                    maxFiles: 1,
                    resourceType: "image",
                    clientAllowedFormats: ["jpg", "jpeg", "png", "gif"],
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Cloudinary Upload
                </CldUploadButton>
                
                {/* Alternative file input method */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Select File
                  </button>
                </div>
              </div>
              
              {/* Image preview */}
              {formState.logo && (
                <div className="mt-4 relative h-48 w-full overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={formState.logo}
                    alt="Notion Logo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove logo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
              
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className={`bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center ${
                  (isLoading || isUploading) ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {(isLoading || isUploading) ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    {isUploading ? "Uploading..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
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
                    Create Notion
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need to view your existing notions?{" "}
            <button
              onClick={() => router.push("/my-notions")}
              className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              Go to My Notions
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}