"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSignup = async () => {
    setLoading(true);
    setMessage("");
    
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    setMessage(data.message || data.error);
    setLoading(false);
    
    if (res.ok) {
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }, 1500);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Sign Up</h1>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-orange-500 p-3 rounded-lg font-bold text-white hover:bg-orange-600 transition"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          
          {message && (
            <p className={`text-center mt-2 ${message.includes("error") ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
