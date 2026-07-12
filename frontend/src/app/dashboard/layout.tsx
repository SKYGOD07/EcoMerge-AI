"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  MdDashboard, 
  MdCo2, 
  MdPeople, 
  MdGavel, 
  MdEmojiEvents, 
  MdAnalytics, 
  MdPsychology, 
  MdLogout,
  MdMenu,
  MdClose,
  MdSettings,
  MdSearch,
  MdNotifications,
  MdKeyboardCommandKey
} from "react-icons/md";
import Lenis from "lenis";
import { gsap } from "gsap";
import Image from "next/image";
import EulerLogo from "@/assets/Euler-Img.svg";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  roles?: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Enhanced page transition with stagger
    const ctx = gsap.context(() => {
      gsap.fromTo(".page-content-wrapper", 
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [pathname]);

  // Sidebar entry animation
  useEffect(() => {
    if (sidebarRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".nav-item",
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: "power2.out", delay: 0.2 }
        );
      }, sidebarRef.current);
      return () => ctx.revert();
    }
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#06080f] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping"></div>
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          </div>
          <p className="text-slate-500 text-xs font-medium tracking-wider uppercase">Initializing session...</p>
        </div>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    { name: "Overview", path: "/dashboard/overview", icon: <MdDashboard size={18} /> },
    { name: "Environmental", path: "/dashboard/environmental", icon: <MdCo2 size={20} />, badge: "3" },
    { name: "Social & CSR", path: "/dashboard/social", icon: <MdPeople size={18} /> },
    { name: "Governance", path: "/dashboard/governance", icon: <MdGavel size={18} />, badge: "!" },
    { name: "Gamification", path: "/dashboard/gamification", icon: <MdEmojiEvents size={18} /> },
    { name: "Reports", path: "/dashboard/reports", icon: <MdAnalytics size={18} /> },
    { name: "AI Advisor", path: "/dashboard/ai-assistant", icon: <MdPsychology size={18} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <MdSettings size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "EM";
  };

  const getPageTitle = () => {
    const item = menuItems.find(m => pathname.startsWith(m.path));
    return item?.name || "Dashboard";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex min-h-screen bg-[#06080f] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] h-[80%] w-[60%] rounded-full bg-emerald-950/8 blur-[200px]"></div>
        <div className="absolute -bottom-[30%] -left-[15%] h-[70%] w-[50%] rounded-full bg-indigo-950/8 blur-[200px]"></div>
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[40%] w-[40%] rounded-full bg-violet-950/5 blur-[250px]"></div>
      </div>

      {/* ═══════════ Desktop Sidebar ═══════════ */}
      <aside 
        ref={sidebarRef}
        className={`hidden md:flex md:flex-col sticky top-0 h-screen transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
          border-r border-white/[0.04] bg-[#080a12]/80 backdrop-blur-2xl`}
      >
        {/* Logo Section */}
        <div className={`flex items-center gap-3 border-b border-white/[0.04] ${sidebarCollapsed ? 'px-4 py-5 justify-center' : 'px-5 py-5'}`}>
          <div className="relative">
            <Image 
              src={EulerLogo} 
              alt="EcoMerge Logo" 
              className="w-8 h-8 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#080a12]"></div>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-[15px] bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent leading-tight">
                EcoMerge AI
              </span>
              <span className="text-[10px] text-slate-600 font-medium tracking-wider uppercase">Enterprise ESG</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {/* Section Label */}
          {!sidebarCollapsed && (
            <span className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-2 block">Platform</span>
          )}
          
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/dashboard/overview' && pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`nav-item group relative flex w-full items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer
                    ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                    ${isActive 
                      ? "bg-white/[0.06] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                    }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-emerald-400 to-teal-500"></div>
                  )}
                  
                  <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {item.icon}
                  </span>
                  
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1
                          ${item.badge === '!' 
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                      {item.name}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className={`border-t border-white/[0.04] bg-white/[0.01] ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-[11px] font-bold text-white shadow-lg shadow-emerald-500/20">
                  {getInitials(user.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-slate-300 truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    <p className="text-[10px] text-emerald-400/80 font-semibold uppercase tracking-wider">{user.role}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] py-2 text-[11px] font-medium text-slate-500 transition-all duration-200 hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-400 cursor-pointer"
              >
                <MdLogout size={13} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
              title="Sign Out"
            >
              <MdLogout size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* ═══════════ Main Area ═══════════ */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-white/[0.04] bg-[#06080f]/70 backdrop-blur-2xl px-6 md:px-8 py-3">
          {/* Left: Mobile Menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
            >
              {sidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
            </button>
            
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex text-slate-500 hover:text-slate-300 transition p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <MdMenu size={18} />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600 font-medium hidden sm:inline">{getGreeting()}</span>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <span className="text-slate-300 font-semibold">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-500 text-xs font-medium hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer">
              <MdSearch size={14} />
              <span>Search</span>
              <kbd className="ml-4 hidden lg:inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                <MdKeyboardCommandKey size={10} />K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer">
              <MdNotifications size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border border-[#06080f]"></span>
            </button>

            {/* User Avatar - Mobile */}
            <div className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-[10px] font-bold text-white">
              {getInitials(user.email)}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <aside 
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#080a12] border-r border-white/[0.04] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Logo */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Image src={EulerLogo} alt="EcoMerge Logo" className="w-8 h-8" />
                  <span className="font-bold text-[15px] bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    EcoMerge AI
                  </span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white p-1">
                  <MdClose size={20} />
                </button>
              </div>
              
              {/* Mobile Nav Items */}
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all
                        ${isActive 
                          ? "bg-white/[0.06] text-white" 
                          : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                        }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-emerald-400 to-teal-500"></div>
                      )}
                      <span className={isActive ? 'text-emerald-400' : ''}>{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile User */}
              <div className="border-t border-white/[0.04] p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-[11px] font-bold text-white">
                    {getInitials(user.email)}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-300">{user.email}</p>
                    <p className="text-[10px] text-emerald-400/80 font-semibold uppercase tracking-wider">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] py-2 text-[11px] font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition cursor-pointer"
                >
                  <MdLogout size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ═══════════ Main Content ═══════════ */}
        <main ref={mainRef} className="flex-1 page-content-wrapper">
          <div className="px-5 md:px-8 py-6 md:py-8 max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
