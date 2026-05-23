"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, User, AlertTriangle, Disc, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength meter state
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("Weak");
  const [strengthColor, setStrengthColor] = useState("bg-red-500");

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthText("Weak");
      setStrengthColor("bg-red-550");
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(score);

    if (score <= 1) {
      setStrengthText("Weak");
      setStrengthColor("bg-red-500");
    } else if (score === 2) {
      setStrengthText("Fair");
      setStrengthColor("bg-amber-500");
    } else if (score === 3) {
      setStrengthText("Good");
      setStrengthColor("bg-indigo-500");
    } else if (score === 4) {
      setStrengthText("Strong");
      setStrengthColor("bg-emerald-500");
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (strength < 4) {
      setError("Password must contain at least 1 uppercase letter, 1 number, and 1 special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register account.");
        setLoading(false);
      } else {
        setSuccess(true);
        // Automatically sign in the user
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (loginRes?.error) {
          router.push("/login?registered=true");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5 font-mono">
        <h2 className="text-sm font-bold tracking-wider uppercase text-zinc-200">
          Create Account
        </h2>
        <p className="text-zinc-500 text-[11px] font-sans">
          Get started with FlowForge dynamic compiler today.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-400 p-3 rounded text-[11px] font-mono flex items-start gap-2.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-3 rounded text-[11px] font-mono flex items-start gap-2.5">
          <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Registration successful! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono text-[11px]">
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <User className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 outline-none rounded p-2.5 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-650 transition-colors"
            />
          </div>
        </div>

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

          {/* Password Strength Meter UI */}
          {password && (
            <div className="flex flex-col gap-1.5 mt-1 text-[10px]">
              <div className="flex justify-between items-center text-zinc-450">
                <span>Password Strength:</span>
                <span className="font-semibold">{strengthText}</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden flex gap-0.5 border border-zinc-800/40">
                <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(strength / 4) * 100}%` }} />
              </div>
              <span className="text-zinc-550 leading-normal font-sans">
                Must contain at least 8 chars, 1 uppercase letter, 1 number, and 1 special symbol.
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 outline-none rounded p-2.5 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-650 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded py-2.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] shadow-sm"
        >
          {loading ? (
            <Disc className="w-4 h-4 animate-spin text-zinc-950" />
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-zinc-400 font-sans mt-1">
        Already have an account?{" "}
        <Link href="/login" className="text-zinc-200 hover:text-white font-semibold hover:underline transition-all">
          Sign in
        </Link>
      </div>
    </>
  );
}
