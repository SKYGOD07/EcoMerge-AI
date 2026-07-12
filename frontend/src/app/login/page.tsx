"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { message } from "antd";
import { gsap } from "gsap";
import Image from "next/image";
import EulerLogo from "@/assets/Euler-Img.svg";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, user, loading, error, clearError } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      router.push("/dashboard/overview");
    }
  }, [user, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2 }
      );

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      );

      tl.fromTo(
        formRef.current ? formRef.current.children : [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
        "-=0.4"
      );

      tl.fromTo(
        demoRef.current ? demoRef.current.children : [],
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08 },
        "-=0.2"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      messageApi.error("Please fill in all fields");
      return;
    }

    if (mode === "register") {
      if (!fullName) {
        messageApi.error("Please enter your full name");
        return;
      }
      const success = await register(email, password, fullName);
      if (success) {
        messageApi.success("Account created! Redirecting to workspace...");
        router.push("/dashboard/overview");
      } else {
        messageApi.error(error || "Registration failed");
      }
    } else {
      const success = await login(email, password);
      if (success) {
        messageApi.success("Logged in successfully!");
        router.push("/dashboard/overview");
      } else {
        messageApi.error(error || "Invalid email or password");
      }
    }
  };

  const handleQuickLogin = async (role: string) => {
    let testEmail = "";
    let testPassword = "";

    switch (role) {
      case "admin":
        testEmail = "admin@ecosphere.local";
        testPassword = "admin123";
        break;
      case "manager":
        testEmail = "manager@ecosphere.local";
        testPassword = "manager123";
        break;
      case "employee":
        testEmail = "employee@ecosphere.local";
        testPassword = "employee123";
        break;
      case "auditor":
        testEmail = "auditor@ecosphere.local";
        testPassword = "auditor123";
        break;
    }

    setEmail(testEmail);
    setPassword(testPassword);

    const success = await login(testEmail, testPassword);
    if (success) {
      messageApi.success(`Logged in as ${role.toUpperCase()}`);
      router.push("/dashboard/overview");
    } else {
      messageApi.error("Failed to login with shortcut credentials.");
    }
  };

  const toggleMode = () => {
    clearError();
    setMode(mode === "login" ? "register" : "login");
    setFullName("");
  };

  /* ---------- Google SVG icon ---------- */
  const GoogleIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 48 48"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );

  /* ---------- Microsoft SVG icon ---------- */
  const MicrosoftIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 21 21"
    >
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );

  const handleGoogleLogin = () => {
    // For hackathon demo: simulate Google OAuth by registering/logging in
    messageApi.info("Google SSO: Redirecting — for demo, use email/password or sandbox.");
  };

  const handleMicrosoftLogin = () => {
    messageApi.info("Microsoft SSO: Redirecting — for demo, use email/password or sandbox.");
  };

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-radial from-slate-900 via-slate-950 to-black px-4"
    >
      {contextHolder}
      {/* Animated gradient shapes */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[150px] animate-pulse duration-[10000ms]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[180px]" />

      <div
        ref={cardRef}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src={EulerLogo}
              alt="EcoMerge Logo"
              className="w-12 h-12 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              EcoMerge AI
            </h1>
          </div>
          <p
            ref={titleRef}
            className="text-sm text-slate-400 font-medium tracking-wide"
          >
            ESG Enterprise Management Platform
          </p>
        </div>

        {/* ----- Social / Enterprise SSO Buttons ----- */}
        <div className="flex gap-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
          >
            <MicrosoftIcon />
            Microsoft
          </button>
        </div>

        <div className="relative flex items-center gap-4 my-4">
          <span className="flex-1 h-px bg-white/10"></span>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            or continue with email
          </span>
          <span className="flex-1 h-px bg-white/10"></span>
        </div>

        {/* ----- Mode Toggle Tabs ----- */}
        <div className="flex rounded-lg border border-white/10 mb-5 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              mode === "login"
                ? "bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              mode === "register"
                ? "bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Create Account
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Arjun Mehta"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500/50 focus:bg-white/10"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {mode === "register" ? "Company Email" : "Email Address"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                mode === "register"
                  ? "name@company.com"
                  : "e.g. manager@ecosphere.local"
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50 focus:bg-white/10"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50 focus:bg-white/10"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 text-sm font-semibold text-white shadow-lg outline-none transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 ${
              mode === "register"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-500/20"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20"
            }`}
          >
            {loading
              ? "Processing..."
              : mode === "register"
              ? "Create Account & Enter Workspace"
              : "Enter Workspace"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-slate-500 hover:text-emerald-400 transition"
          >
            {mode === "login"
              ? "Don't have an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </div>

        {/* ----- Sandbox Quick-Logins ----- */}
        <div className="mt-6 border-t border-white/5 pt-5">
          <span className="block text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Quick Sandbox Logins
          </span>
          <div ref={demoRef} className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin("admin")}
              className="rounded-lg border border-white/5 bg-white/5 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:bg-emerald-500/5"
            >
              👑 Admin
            </button>
            <button
              onClick={() => handleQuickLogin("manager")}
              className="rounded-lg border border-white/5 bg-white/5 py-2.5 text-xs font-medium text-slate-300 transition hover:border-teal-500/30 hover:bg-teal-500/5"
            >
              👔 Manager
            </button>
            <button
              onClick={() => handleQuickLogin("employee")}
              className="rounded-lg border border-white/5 bg-white/5 py-2.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/5"
            >
              🧑‍💻 Employee
            </button>
            <button
              onClick={() => handleQuickLogin("auditor")}
              className="rounded-lg border border-white/5 bg-white/5 py-2.5 text-xs font-medium text-slate-300 transition hover:border-pink-500/30 hover:bg-pink-500/5"
            >
              🔍 Auditor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
