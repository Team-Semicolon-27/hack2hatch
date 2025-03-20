"use client"

import Link from "next/link";
import NavbarGuest from "@/components/guestNavbar";
import {useSession} from "next-auth/react";

export default function Navbar() {
  const session = useSession();
  
  if (!session) {
    return <NavbarGuest />
  }
  return (
    <nav className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-lg">
      {/* Leftmost: Project Name */}
      <div className="text-2xl font-bold text-orange-500">
        <Link href="/">Project Name</Link>
      </div>
      
      {/* Center: Navigation Links */}
      <div className="flex space-x-6">
        <Link href="/blogs" className="hover:text-orange-400 transition">Blogs</Link>
        <Link href="/notions" className="hover:text-orange-400 transition">Notions</Link>
        <Link href="/my-notions" className="hover:text-orange-400 transition">My Notions</Link>
      </div>
      
      {/* Rightmost: Profile */}
      <div>
        <Link href="/profile" className="hover:text-orange-400 transition">Profile</Link>
      </div>
    </nav>
  );
}
