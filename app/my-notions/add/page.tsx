"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CldUploadButton } from "next-cloudinary";

export default function AddNotionPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleUpload = (result: any) => {
    if (result.event === "success") {
      setLogo(result.info.secure_url);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !logo) {
      alert("Title, description, and logo are required!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`/api/entrepreneur/notions`, {
        title,
        description,
        logo,
      });
      
      if (res.status === 200) {
        router.push("/my-notions");
      } else {
        alert("Failed to create notion. Please try again.");
      }
    } catch (error) {
      console.error("Error creating notion:", error);
      alert("An error occurred while creating the notion.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-950 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-extrabold text-orange-500 mb-6 text-center">Add New Notion</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Logo</label>
            <CldUploadButton
              uploadPreset={
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
              }
              onSuccess={handleUpload}
            />
            {logo && (
              <div className="mt-4">
                <img
                  src={logo}
                  alt="Notion Logo"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-700"
                />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-6 rounded-lg font-semibold shadow-lg text-white transition-all duration-300 ${
              loading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
