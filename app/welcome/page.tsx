"use client"

import { useState } from "react"
import { Rocket, Users, Lightbulb, Newspaper, Bot, Video } from "lucide-react"
import { motion } from "framer-motion"
import EntrepreneurSignup from "@/components/entrepreneur-signup"
import MentorSignup from "@/components/mentor-signup"

export default function WelcomePage() {
  const [isMentor, setIsMentor] = useState(false)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * index,
        duration: 0.5,
      },
    }),
  }

  return (
    <div className="h-screen overflow-hidden grid lg:grid-cols-5 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - ConnectIn Summary with Animation (60%) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-col items-center justify-center bg-gray-100/80 p-6 lg:px-12 lg:py-8 text-gray-700 lg:col-span-3 relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.2),transparent_40%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.2),transparent_40%)]"></div>
        </div>

        <div className="relative z-10 max-w-2xl">
          {/* Logo and Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="bg-orange-500 text-white p-3 rounded-2xl shadow-lg">
              <Rocket className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold ml-4 text-gray-800">
              <span className="text-orange-600">Connect</span>In
            </h2>
          </motion.div>

          {/* Tagline - Now with separate lines for better centering */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-8"
          >
            <p className="text-xl md:text-2xl font-medium text-gray-800 max-w-lg mx-auto">
              A place where <span className="text-orange-500 font-semibold">ideas</span> meet{" "}
              <span className="text-orange-500 font-semibold">experience</span>.
            </p>
            <p className="text-xl md:text-2xl font-medium text-gray-800 max-w-lg mx-auto mt-2">
              <span className="text-orange-500 font-semibold">Connect with mentors!</span>
            </p>
          </motion.div>

          {/* Features List */}
          <ul className="text-lg space-y-4 max-w-lg mb-8">
            <motion.li
              custom={1}
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-gray-900 text-xl">Entrepreneurs & Mentors:</strong>
                <p className="text-gray-600 mt-1 text-lg">Build meaningful connections.</p>
              </div>
            </motion.li>

            <motion.li
              custom={2}
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-gray-900 text-xl">Notions:</strong>
                <p className="text-gray-600 mt-1 text-lg">Share ideas, seek mentorship.</p>
              </div>
            </motion.li>

            <motion.li
              custom={3}
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-gray-900 text-xl">Blogs & News:</strong>
                <p className="text-gray-600 mt-1 text-lg">Stay updated with trends.</p>
              </div>
            </motion.li>

            <motion.li
              custom={4}
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-gray-900 text-xl">AI Blogger:</strong>
                <p className="text-gray-600 mt-1 text-lg">Generate insights instantly.</p>
              </div>
            </motion.li>
          </ul>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-6 text-center"
          >
            <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              🚀 Join <span className="text-orange-500 font-bold">ConnectIn</span> today!
            </p>
            <div className="hidden lg:block h-1 w-32 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto rounded-full"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Signup Form (40%) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col justify-center items-center p-4 md:p-6 h-full w-full lg:col-span-2 relative"
      >
        {/* Mobile view logo */}
        <div className="flex items-center justify-center mb-4 lg:hidden">
          <div className="bg-orange-500 text-white p-2 rounded-xl shadow-md">
            <Rocket className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-extrabold ml-3 text-gray-800">
            <span className="text-orange-600">Connect</span>In
          </h2>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            {isMentor ? "Join as a Mentor" : "Join as an Entrepreneur"}
          </h3>

          {/* Tab Navigation */}
          <div className="flex justify-center space-x-2 mb-4">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsMentor(false)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                !isMentor ? "bg-orange-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Entrepreneur
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsMentor(true)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                isMentor ? "bg-orange-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Mentor
            </motion.button>
          </div>

          {/* Dynamic Form Section */}
          <motion.div
            key={isMentor ? "mentor" : "entrepreneur"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            {isMentor ? <MentorSignup /> : <EntrepreneurSignup />}
          </motion.div>
        </div>

        {/* Footer note */}
        <p className="text-gray-500 text-xs mt-3 text-center">
          By joining, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  )
}