"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, User, Search, Bell } from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Fetch notification count initially and set up polling
  useEffect(() => {
    // Skip if no session
    if (!session) return;
    
    // Function to fetch notification count
    const fetchNotificationCount = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/notifications/count');
        if (response.status === 200) {
          setNotificationCount(response.data);
          
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch initially
    fetchNotificationCount();
    
    // Set up interval for polling (e.g., every 30 seconds)
    const intervalId = setInterval(fetchNotificationCount, 2000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [session]);
  
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
              <Link href={"/notifications"} className="p-2 text-gray-600 hover:text-[#FCA311] relative rounded-full hover:bg-gray-200">
                <Bell size={20} />
                
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
              
              {/* Profile */}
              { session.user.userType === "entrepreneur" ?
                <Link
                  href="/profile/entrepreneur"
                  className="flex items-center gap-2 bg-[#FCA311] text-white px-4 py-2 rounded-full hover:bg-[#e08c00] transition-colors shadow-sm"
                >
                  <User size={18} />
                  <span className="font-medium">Profile</span>
                </Link> :
                <Link
                  href="/profile/mentor"
                  className="flex items-center gap-2 bg-[#FCA311] text-white px-4 py-2 rounded-full hover:bg-[#e08c00] transition-colors shadow-sm"
                >
                  <User size={18} />
                  <span className="font-medium">Profile</span>
                </Link>
              }
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={handleSearchRedirect} className="p-2 text-gray-600 hover:text-[#FCA311]">
                <Search size={20} />
              </button>
              
              {/* Mobile Notifications */}
              <Link href={"/notifications"} className="p-2 text-gray-600 hover:text-[#FCA311] relative">
                <Bell size={20} />
                
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
              
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:text-[#FCA311]">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed z-40 inset-0 top-[70px] bg-white">
          <div className="flex flex-col p-4">
            <NavLink href="/blogs">Blogs</NavLink>
            <NavLink href="/notions">Notions</NavLink>
            <NavLink href="/my-notions">My Notions</NavLink>
            <NavLink href="/profile/entrepreneur">Profile</NavLink>
          </div>
        </div>
      )}
      
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