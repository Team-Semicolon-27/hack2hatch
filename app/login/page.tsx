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
      router.push("/welcome");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 transition-all">
        <h1 className="text-3xl font-semibold text-center text-orange-600 mb-8">
          Login
        </h1>

        <div className="space-y-6">
          {/* Floating Label Inputs */}
          {[
            { id: "email", label: "Email", value: email, setter: setEmail, type: "email" },
            { id: "password", label: "Password", value: password, setter: setPassword, type: "password" },
          ].map(({ id, label, value, setter, type }) => (
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

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-500 p-4 rounded-xl font-medium text-white hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-center text-red-500 mt-2">
              {error}
            </p>
          )}
        </div>

        {/* Signup Link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{" "}
          <a href="/auth/signup/entrepreneur" className="text-orange-600 font-medium hover:underline transition-all">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
