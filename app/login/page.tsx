"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleLogin = async () => {
    setError("");
    setLoading(true);
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    
    setLoading(false);
    
    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Login</h1>
        
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
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-500 p-3 rounded-lg font-bold text-white hover:bg-orange-600 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          
          {error && (
            <p className="text-center text-red-400 mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
