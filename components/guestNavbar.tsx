import Link from "next/link";

export default function NavbarGuest() {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Project Name */}
        <h1 className="text-2xl font-bold text-[#FCA311]">ConnectIn</h1>

        {/* Authentication Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="../app/auth/signup/entrepreneur"
            className="bg-[#FCA311] text-white px-4 py-2 rounded-full hover:bg-[#e08c00] transition-colors shadow"
          >
            Sign Up as Entrepreneur
          </Link>
          <Link
            href="../app/login"
            className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow"
          >
            Sign In as Entrepreneur
          </Link>
          <Link
            href="/signup/mentor"
            className="bg-[#4CAF50] text-white px-4 py-2 rounded-full hover:bg-[#388E3C] transition-colors shadow"
          >
            Sign Up as Mentor
          </Link>
          <Link
            href="/signin/mentor"
            className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow"
          >
            Sign In as Mentor
          </Link>
        </div>
      </div>
    </nav>
  );
}
