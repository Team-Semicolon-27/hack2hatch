"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarGuest from "@/components/guestNavbar";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const session = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/search?query=${searchQuery}`);
      
      const data = await res.json();
      if (data.type === "profile") {
        router.push(`/profile/${data.username}`);
      } else if (data.type === "blog") {
        router.push(`/blogs/${data.blogId}`);
      } else if (data.type === "notion") {
        router.push(`/notions/${data.notionId}`);
      } else {
        setError("No results found");
      }
    } catch (err) {
      console.log(err)
      setError("error");
    } finally {
      setLoading(false);
    }
  }
  
  if (!session) {
    return <NavbarGuest />;
  }
  
  return (
    <nav className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-lg">
      {/* Left: Project Name */}
      <div className="text-2xl font-bold text-orange-500">
        <Link href="/">Project Name</Link>
      </div>
      
      {/* Center: Navigation Links */}
      <div className="flex space-x-6">
        <Link href="/blogs" className="hover:text-orange-400 transition">Blogs</Link>
        <Link href="/notions" className="hover:text-orange-400 transition">Notions</Link>
        <Link href="/my-notions" className="hover:text-orange-400 transition">My Notions</Link>
      </div>
      
      {/* Right: Search Bar & Profile */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="flex items-center bg-gray-800 p-2 rounded-lg">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-white outline-none px-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-orange-500 px-3 py-1 rounded-lg ml-2 hover:bg-orange-600 transition"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
        
        {/* Profile */}
        <Link href="/profile/entrepreneur" className="hover:text-orange-400 transition">Profile</Link>
      </div>
      
      {/* Error Message */}
      {error && <p className="absolute top-16 right-4 text-red-500">{error}</p>}
    </nav>
  );
}
