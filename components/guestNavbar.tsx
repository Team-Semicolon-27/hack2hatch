import Link from "next/link";

export default function NavbarGuest() {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Project Name */}
        <h1 className="text-2xl font-bold text-orange-500">Project Name</h1>
        
        {/* Authentication Buttons */}
        <div className="flex gap-4">
          <Link href="/signup/entrepreneur" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
            Sign Up as Entrepreneur
          </Link>
          <Link href="/signin/entrepreneur" className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg">
            Sign In as Entrepreneur
          </Link>
          <Link href="/signup/mentor" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
            Sign Up as Mentor
          </Link>
          <Link href="/signin/mentor" className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg">
            Sign In as Mentor
          </Link>
        </div>
      </div>
    </nav>
  );
}
