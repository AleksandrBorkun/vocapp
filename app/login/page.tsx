"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!auth) {
      setError("Firebase is not initialized");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase is not initialized");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/home");
    } catch (err: any) {
      console.error("Error initiating Google sign-in:", err);
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    // Placeholder for Facebook login - will be implemented later
    setError("Facebook login coming soon");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header with gray background */}
      <div className="bg-gray-200 h-32"></div>

      <main className="flex-1 flex items-start justify-center px-4 -mt-16">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Welcome to VocApp
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-gray-700 mb-2"
                >
                  email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-light transition-colors"
                  placeholder="superhero@miro.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-700 mb-2"
                >
                  password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-light transition-colors"
                  placeholder="your password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#5558D9] text-white font-semibold rounded hover:bg-[#4447b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/forgot-password"
                className="text-[#5558D9] hover:text-[#4447b8] text-sm font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 bg-[#5558D9] text-white font-semibold rounded hover:bg-[#4447b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue with Google
              </button>

              <button
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="w-full py-3.5 bg-[#5558D9] text-white font-semibold rounded hover:bg-[#4447b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue with FB
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/privacy"
                className="text-[#5558D9] hover:text-[#4447b8] text-sm font-medium"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
