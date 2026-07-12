"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { message } from "antd";
import { gsap } from "gsap";
import Image from "next/image";
import EulerLogo from "@/assets/Euler-Img.svg";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading, error, clearError } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
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
    // GSAP reveal animations
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.fromTo(cardRef.current, 
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2 }
      );
      
      tl.fromTo(titleRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      );

      tl.fromTo(formRef.current ? formRef.current.children : [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
        "-=0.4"
      );

      tl.fromTo(demoRef.current ? demoRef.current.children : [],
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

    const success = await login(email, password);
    if (success) {
      messageApi.success("Logged in successfully!");
      router.push("/dashboard/overview");
    } else {
      messageApi.error(error || "Invalid email or password");
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

  return (
    <div 
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-radial from-slate-900 via-slate-950 to-black px-4"
    >
      {contextHolder}
      {/* Animated gradient shapes */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[150px] animate-pulse duration-[10000ms]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[180px]"></div>

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
          <p ref={titleRef} className="text-sm text-slate-400 font-medium tracking-wide">
            ESG Enterprise Management Platform
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. manager@ecosphere.local"
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
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 outline-none transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Verifying Credentials..." : "Enter Workspace"}
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-6">
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
