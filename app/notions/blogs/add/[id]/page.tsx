"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

export default function AddBlogPage() {
  const router = useRouter();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments([...attachments, ...Array.from(event.target.files)]);
    }
  };
  
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };
  
  const addLinkField = () => {
    setLinks([...links, ""]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    attachments.forEach(file => formData.append("attachments", file));
    links.forEach(link => formData.append("links", link));
    
    try {
      await axios.post(`/api/notions/${id}/blogs`, formData);
      router.push(`/notions/${id}`);
    } catch (error) {
      console.error("Error adding blog:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-gray-950 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-extrabold text-orange-500 mb-4">Add Blog</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-800 text-white rounded-lg"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-800 text-white rounded-lg"
            required
          />
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 mb-4 bg-gray-800 text-white rounded-lg"
          />
          {links.map((link, index) => (
            <input
              key={index}
              type="text"
              placeholder="Add a link"
              value={link}
              onChange={(e) => handleLinkChange(index, e.target.value)}
              className="w-full p-2 mb-2 bg-gray-800 text-white rounded-lg"
            />
          ))}
          <button
            type="button"
            onClick={addLinkField}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg mb-4"
          >
            + Add Link
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold w-full"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Blog"}
          </button>
        </form>
      </div>
    </div>
  );
}