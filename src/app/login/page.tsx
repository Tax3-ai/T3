"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Incorrect username or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image src="/icon.png" alt="Tax3" width={56} height={56} className="rounded-xl" />
          <div className="text-center">
            <h1 className="text-white font-bold text-xl tracking-wider">TAX3</h1>
            <p className="text-brand-gray-400 text-xs uppercase tracking-widest">Social Agent</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-brand-gray-400 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-brand-gray-900 border border-brand-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-red transition-colors"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-brand-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-gray-900 border border-brand-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-red transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
