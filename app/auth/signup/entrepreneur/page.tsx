"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EntrepreneurSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/signup/entrepreneur", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username, name, profileImage }),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 transition-all">
        <h1 className="text-3xl font-semibold text-center text-orange-600 mb-8">
          Sign Up as an Entrepreneur
        </h1>

        <div className="space-y-6">
          {/* Input Fields with Floating Labels */}
          {[
            { id: "username", label: "Username", value: username, setter: setUsername },
            { id: "name", label: "Name", value: name, setter: setName },
            { id: "email", label: "Email", value: email, setter: setEmail, type: "email" },
            { id: "password", label: "Password", value: password, setter: setPassword, type: "password" },
            { id: "profileImage", label: "Profile Image URL", value: profileImage, setter: setProfileImage },
          ].map(({ id, label, value, setter, type = "text" }) => (
            <div key={id} className="relative">
              <input
                type={type}
                id={id}
                className="peer w-full p-4 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-md"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder=" "
              />
              <label
                htmlFor={id}
                className="absolute left-4 top-4 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-orange-500"
              >
                {label}
              </label>
            </div>
          ))}

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-orange-500 p-4 rounded-xl font-medium text-white hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          {/* Message Display */}
          {message && (
            <p className={`text-center mt-2 ${message.includes("error") ? "text-red-500" : "text-green-500"}`}>
              {message}
            </p>
          )}
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-orange-600 font-medium hover:underline transition-all">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
