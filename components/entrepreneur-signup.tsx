"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Paperclip } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

interface UploadResult {
  info: { secure_url: string };
}

export default function EntrepreneurSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUploadSuccess = (result: UploadResult) => {
    if (result?.info?.secure_url) {
      setProfileImage(result.info.secure_url);
    }
  };

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
    <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-200 transition-all">
      <h1 className="text-2xl font-semibold text-center text-orange-600 mb-6">
        Sign Up as an Entrepreneur
      </h1>

      <div className="space-y-6">
        {[
          { id: "username", label: "Username", value: username, setter: setUsername },
          { id: "name", label: "Name", value: name, setter: setName },
          { id: "email", label: "Email", value: email, setter: setEmail, type: "email" },
          { id: "password", label: "Password", value: password, setter: setPassword, type: "password" },
        ].map(({ id, label, value, setter, type = "text" }) => (
          <div key={id} className="relative">
            <input
              type={type}
              id={id}
              className="peer w-full p-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              value={value}
              onChange={(e) => setter(e.target.value)}
            />
            <label
              htmlFor={id}
              className={`absolute left-3 transition-all ${
                value ? "top-1 text-xs text-orange-500" : "top-3 text-sm text-gray-400"
              }`}
            >
              {label}
            </label>
          </div>
        ))}

        {/* Cloudinary Upload Widget */}
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result) => handleUploadSuccess(result as UploadResult)}
        >
          {({ open }: { open: () => void }) => (
            <div
              onClick={() => open()}
              className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-all"
            >
              <Paperclip className="mx-auto h-12 w-12 text-orange-400" />
              <p className="mt-1 text-sm text-gray-500">Click to upload image</p>
            </div>
          )}
        </CldUploadWidget>

        {/* Display Uploaded Image */}
        {profileImage && (
          <div className="flex justify-center">
            <img
              src={profileImage}
              alt="Profile Preview"
              className="h-20 w-20 rounded-full border border-gray-300 shadow-md"
            />
          </div>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-orange-500 p-3 rounded-lg font-medium text-white hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin size-5" /> Signing Up...
            </>
          ) : (
            "Sign Up"
          )}
        </button>

        {message && (
          <p className={`text-center mt-2 ${message.includes("error") ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}
      </div>

      <p className="text-center text-gray-600 text-sm mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-orange-600 font-medium hover:underline transition-all">
          Log in
        </a>
      </p>
    </div>
  );
}
