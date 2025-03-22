"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarGuest from "@/components/guestNavbar";
import { useSession } from "next-auth/react";
import { Menu, X, User, Search, Bell } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchRedirect = () => {
    router.push("/search-notion");
  };

  if (status === "loading") {
    return (
      <div className="h-16 flex items-center justify-center">
        <div className="animate-pulse h-8 w-32 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (!session) {
    return;
  }

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-white/90 backdrop-blur-md py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-[#FCA311]">
              ConnectIn
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink href="/blogs">Blogs</NavLink>
              <NavLink href="/notions">Notions</NavLink>
              <NavLink href="/my-notions">My Notions</NavLink>
            </div>

            {/* Desktop Search and Profile */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Search Button */}
              <button onClick={handleSearchRedirect} className="p-2 text-gray-600 hover:text-[#FCA311] relative rounded-full hover:bg-gray-200">
                <Search size={18} />
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-[#FCA311] relative rounded-full hover:bg-gray-200">
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <Link
                href="/profile/entrepreneur"
                className="flex items-center gap-2 bg-[#FCA311] text-white px-4 py-2 rounded-full hover:bg-[#e08c00] transition-colors shadow-sm"
              >
                <User size={18} />
                <span className="font-medium">Profile</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={handleSearchRedirect} className="p-2 text-gray-600 hover:text-[#FCA311]">
                <Search size={20} />
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:text-[#FCA311]">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content padding to prevent overlap */}
      <div className="pt-[70px]"></div>
    </>
  );
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors">
    {children}
  </Link>
);