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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  async function handleSearch() {
    if (!searchQuery.trim()) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch(`/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        if (data.notion) {
          router.push(`/notions/${data.notion._id}`);
        } else {
          setError("No results found");
        }
      } else {
        setError(data.error || "Error searching");
      }
    } catch (err) {
      console.error(err);
      setError("Error searching");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  if (status === "loading") {
    return (
      <div className="h-16 flex items-center justify-center">
        <div className="animate-pulse h-8 w-32 bg-[#E5E5E5] rounded"></div>
      </div>
    );
  }
  
  if (!session) {
    return <NavbarGuest />;
    return <NavbarGuest />;
  }
  
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white shadow-md py-2" 
          : "bg-white/90 backdrop-blur-sm py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-[#FCA311]"
            >
              ConnectIn
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/blogs" 
              className="px-3 py-2 rounded-md text-gray-700 hover:bg-[#E5E5E5] transition-colors"
            >
              Blogs
            </Link>
            <Link 
              href="/notions" 
              className="px-3 py-2 rounded-md text-gray-700 hover:bg-[#E5E5E5] transition-colors"
            >
              Notions
            </Link>
            <Link 
              href="/my-notions" 
              className="px-3 py-2 rounded-md text-gray-700 hover:bg-[#E5E5E5] transition-colors"
            >
              My Notions
            </Link>
          </div>
          
          {/* Desktop Search and Profile */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Expandable Search */}
            <div className="relative">
              <div 
                className={`flex items-center overflow-hidden transition-all duration-300 ${
                  showSearchBar 
                    ? "w-64 border border-[#E5E5E5] rounded-full bg-[#E5E5E5]/30" 
                    : "w-10"
                }`}
              >
                {showSearchBar ? (
                  <>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-transparent text-gray-700 outline-none px-4 py-2 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-[#FCA311]"
                    >
                      {loading ? (
                        <div className="h-4 w-4 border-2 border-[#FCA311] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Search size={18} />
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowSearchBar(true)}
                    className="p-2 text-gray-600 hover:text-[#FCA311] rounded-full"
                  >
                    <Search size={18} />
                  </button>
                )}
              </div>
              {showSearchBar && (
                <button
                  onClick={() => {
                    setShowSearchBar(false);
                    setSearchQuery("");
                    setError(null);
                  }}
                  className="fixed inset-0 w-full h-full bg-transparent cursor-default z-10"
                  tabIndex={-1}
                />
              )}
              {error && showSearchBar && (
                <p className="absolute top-12 right-0 text-red-500 bg-white p-2 rounded shadow-md text-sm z-20">
                  {error}
                </p>
              )}
            </div>
            
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-[#FCA311] relative rounded-full hover:bg-[#E5E5E5]">
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
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="p-2 text-gray-600 hover:text-[#FCA311] rounded-full"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#FCA311] rounded-full"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile search */}
      {showSearchBar && (
        <div className="md:hidden px-4 py-3 bg-white border-t border-[#E5E5E5]">
          <div className="relative">
            <div className="flex items-center bg-[#E5E5E5]/50 rounded-full overflow-hidden">
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-gray-700 outline-none px-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-[#FCA311]"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-[#FCA311] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search size={18} />
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-500 mt-2 text-sm">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-[#E5E5E5]">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link 
              href="/blogs" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-[#E5E5E5]"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </Link>
            <Link 
              href="/notions" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-[#E5E5E5]"
              onClick={() => setIsMenuOpen(false)}
            >
              Notions
            </Link>
            <Link 
              href="/my-notions" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-[#E5E5E5]"
              onClick={() => setIsMenuOpen(false)}
            >
              My Notions
            </Link>
            
            <div className="pt-2 mt-2 border-t border-[#E5E5E5]">
              <Link 
                href="/profile/entrepreneur" 
                className="flex items-center gap-2 bg-[#FCA311] text-white px-4 py-2 rounded-md hover:bg-[#e08c00] transition-colors w-full justify-center mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} />
                <span>My Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}