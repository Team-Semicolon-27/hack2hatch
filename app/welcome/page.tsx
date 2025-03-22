"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import EntrepreneurSignup from "@/components/entrepreneur-signup";
import MentorSignup from "@/components/mentor-signup";

export default function WelcomePage() {
  const [isMentor, setIsMentor] = useState(false);

  return (
    <div className="grid h-screen lg:grid-cols-5 bg-gray-50">
      {/* Left Side - ConnectIn Summary with Animation (60%) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-col items-center justify-center bg-gray-100 p-16 text-gray-700 lg:col-span-3"
      >
        <h2 className="text-4xl font-extrabold text-orange-600 mb-8 tracking-wide">ConnectIn 🚀</h2>
        <p className="text-xl font-medium text-gray-800 mb-6 text-center max-w-lg">
          A place where <span className="text-orange-500">ideas</span> meet <span className="text-orange-500">experience</span>. Connect with the right mentors, share insights, and grow your network!
        </p>
        <ul className="text-lg space-y-4 max-w-lg">
          <motion.li whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            ✅ <strong>Entrepreneurs & Mentors:</strong> Build meaningful connections.
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            ✅ <strong>Notions:</strong> Share ideas, seek mentorship, collaborate.
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            ✅ <strong>Blogs & News:</strong> Stay updated with industry trends from X (Twitter) & Reddit.
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            ✅ <strong>AI Blogger:</strong> Generate high-quality insights instantly.
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            ✅ <strong>Future Scope:</strong> Integrated video calls, AI assistants & chatbots.
          </motion.li>
        </ul>
        <p className="mt-8 text-lg font-semibold text-center text-gray-600">
          🚀 Join <span className="text-orange-500 font-bold">ConnectIn</span> to grow, learn, and succeed!
        </p>
      </motion.div>

      {/* Right Side - Signup Form (40%) */}
      <div className="flex flex-col justify-center items-center p-6 md:p-10 h-full w-full lg:col-span-2">
        <div className="w-full max-w-sm flex flex-col">

          {/* Tab Navigation */}
          <div className="flex justify-center space-x-4 border-b pb-2">
            <button
              onClick={() => setIsMentor(false)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                !isMentor ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500"
              }`}
            >
              Entrepreneur
            </button>
            <button
              onClick={() => setIsMentor(true)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                isMentor ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500"
              }`}
            >
              Mentor
            </button>
          </div>

          {/* Dynamic Form Section */}
          <div className="mt-4">
            {isMentor ? <MentorSignup /> : <EntrepreneurSignup />}
          </div>
        </div>
      </div>
    </div>
  );
}