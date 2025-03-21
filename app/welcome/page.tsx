"use client";

import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import EntrepreneurSignup from "@/components/entrepreneur-signup";
import MentorSignup from "@/components/mentor-signup";

export default function WelcomePage() {
  const [isMentor, setIsMentor] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-gray-50">
      {/* Left Side - Professional Background */}
      <div className="hidden lg:flex items-center justify-center bg-gray-100">
        <img
          src="/placeholder.svg"
          alt="Signup"
          className="h-full w-full object-cover opacity-90 dark:brightness-[0.2] dark:grayscale"
        />
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex flex-col justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo & Branding */}
          <div className="flex items-center justify-center md:justify-start">
            <a href="/welcome" className="flex items-center gap-2 font-semibold text-gray-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 text-white shadow-sm">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <span className="text-xl font-medium tracking-tight">ConnectIn.</span>
            </a>
          </div>

          {/* Signup Component */}
          {isMentor ? <MentorSignup /> : <EntrepreneurSignup />}

          {/* Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsMentor(!isMentor)}
              className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 transition-all shadow-sm"
            >
              {isMentor ? "Sign up as Entrepreneur" : "Sign up as Mentor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
