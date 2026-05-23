"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, AlertTriangle, Disc } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setError("Invalid email or password. Please try again.");
    } else if (errorParam) {
      setError("An authentication error occurred: " + errorParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5 font-mono">
        <h2 className="text-sm font-bold tracking-wider uppercase text-zinc-200">
          Sign In
        </h2>
        <p className="text-zinc-500 text-[11px] font-sans">
          Enter your details to access the workspace.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-400 p-3 rounded text-[11px] font-mono flex items-start gap-2.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono text-[11px]">
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Mail className="w-3.5 h-3.5" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 outline-none rounded p-2.5 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-650 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 outline-none rounded p-2.5 pl-10 pr-10 text-xs text-zinc-100 placeholder-zinc-650 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-sans">
          <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-450 hover:text-zinc-200 transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded py-2.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] shadow-sm"
        >
          {loading ? (
            <Disc className="w-4 h-4 animate-spin text-zinc-950" />
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="relative flex items-center justify-center my-1.5 font-mono text-[9px] uppercase">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-850"></div>
        </div>
        <span className="relative px-3 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-550 tracking-wider">
          Or continue with
        </span>
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 rounded py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99] font-mono shadow-sm"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Google OAuth</span>
      </button>

      <div className="text-center text-xs text-zinc-400 font-sans mt-1">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-zinc-200 hover:text-white font-semibold hover:underline transition-all">
          Sign up
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-[10px]">Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
