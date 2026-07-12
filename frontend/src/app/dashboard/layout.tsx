"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
  MdKeyboardCommandKey,
  MdLightMode,
  MdDarkMode
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

// Floating particle component
function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5" aria-hidden="true">
      {/* Large ambient orbs */}
      <div className="absolute -top-[30%] -right-[15%] h-[60%] w-[50%] rounded-full bg-emerald-500/[0.04] blur-[180px] animate-float-slow" />
      <div className="absolute -bottom-[25%] -left-[10%] h-[55%] w-[45%] rounded-full bg-indigo-500/[0.04] blur-[180px] animate-float-medium" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[30%] h-[30%] w-[30%] rounded-full bg-violet-500/[0.03] blur-[200px] animate-float-slow" style={{ animationDelay: '4s' }} />
      <div className="absolute top-[10%] left-[40%] h-[20%] w-[20%] rounded-full bg-cyan-500/[0.03] blur-[150px] animate-float-medium" style={{ animationDelay: '1s' }} />
      
      {/* Small floating dots */}
      <div className="absolute top-[15%] right-[20%] h-1 w-1 rounded-full bg-emerald-400/30 animate-float-fast" style={{ animationDelay: '0s' }} />
      <div className="absolute top-[40%] right-[45%] h-1.5 w-1.5 rounded-full bg-cyan-400/20 animate-float-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[65%] left-[25%] h-1 w-1 rounded-full bg-violet-400/25 animate-float-medium" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[80%] right-[35%] h-0.5 w-0.5 rounded-full bg-emerald-300/30 animate-float-fast" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[25%] left-[60%] h-1 w-1 rounded-full bg-teal-400/20 animate-float-slow" style={{ animationDelay: '2.5s' }} />
      <div className="absolute top-[55%] right-[15%] h-0.5 w-0.5 rounded-full bg-indigo-300/30 animate-float-medium" style={{ animationDelay: '4.5s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
    </div>
  );
}

// Clock component for the header
function LiveClock() {
  const [time, setTime] = useState('');
  
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-[11px] text-slate-500 font-mono font-medium tabular-nums hidden lg:inline">
      {time}
    </span>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
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
    // Enhanced page transition
    const ctx = gsap.context(() => {
      gsap.fromTo(".page-content-wrapper", 
        { opacity: 0, y: 16, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [pathname]);

  // Sidebar entry animation
  useEffect(() => {
    if (sidebarRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".nav-item",
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.04, ease: "power2.out", delay: 0.2 }
        );
        // Logo entrance
        gsap.fromTo(".logo-mark",
          { opacity: 0, scale: 0.8, rotate: -10 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: "back.out(1.7)", delay: 0.1 }
        );
      }, sidebarRef.current);
      return () => ctx.revert();
    }
  }, []);

  if (!isHydrated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#06080f] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-2xl border border-emerald-500/20 animate-ping opacity-30"></div>
            <div className="absolute inset-1 rounded-xl border border-emerald-500/30 animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
            <div className="h-12 w-12 animate-spin rounded-2xl border-2 border-emerald-500/40 border-t-emerald-400 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500/50 animate-pulse"></div>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium tracking-wider uppercase mt-2">Initializing session...</p>
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
      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* ═══════════ Desktop Sidebar ═══════════ */}
      <aside 
        ref={sidebarRef}
        className={`hidden md:flex md:flex-col sticky top-0 h-screen transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
          border-r border-white/[0.04] bg-[#080a12]/90 backdrop-blur-2xl`}
      >
        {/* Logo Section */}
        <div className={`flex items-center gap-3 border-b border-white/[0.04] ${sidebarCollapsed ? 'px-4 py-5 justify-center' : 'px-5 py-5'}`}>
          <div className="relative logo-mark">
            <Image 
              src={EulerLogo} 
              alt="EcoMerge Logo" 
              className="w-8 h-8 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#080a12]">
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30"></div>
            </div>
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
              const isHovered = hoveredNav === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  onMouseEnter={() => setHoveredNav(item.path)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`nav-item group relative flex w-full items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-300 cursor-pointer
                    ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                    ${isActive 
                      ? "bg-white/[0.06] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                    }`}
                >
                  {/* Active indicator bar with glow */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-emerald-400 to-teal-500">
                      <div className="absolute inset-0 rounded-r-full bg-emerald-400 blur-sm opacity-50"></div>
                    </div>
                  )}
                  
                  {/* Hover glow background */}
                  {isHovered && !isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/[0.02] to-transparent transition-opacity duration-300"></div>
                  )}
                  
                  <span className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {item.icon}
                  </span>
                  
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1 transition-all duration-300
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
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800/95 backdrop-blur-xl text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                      {item.name}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar floating decoration */}
          {!sidebarCollapsed && (
            <div className="mt-6 mx-2 rounded-xl border border-white/[0.04] bg-gradient-to-br from-emerald-500/[0.04] to-cyan-500/[0.02] p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/10 blur-xl animate-float-slow"></div>
              <div className="relative">
                <div className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider mb-1">Pro Tip</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Use <kbd className="text-[9px] bg-white/5 border border-white/10 rounded px-1 py-0.5 mx-0.5 font-mono">⌘K</kbd> for quick search
                </p>
              </div>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className={`border-t border-white/[0.04] bg-white/[0.01] ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-[11px] font-bold text-white shadow-lg shadow-emerald-500/20">
                  {getInitials(user.email)}
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#080a12]"></div>
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] py-2 text-[11px] font-medium text-slate-500 transition-all duration-300 hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-400 cursor-pointer"
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
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-white/[0.04] bg-[#06080f]/60 backdrop-blur-2xl px-6 md:px-8 py-3 transition-all duration-300">
          {/* Left: Mobile Menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-slate-400 hover:text-white transition-all duration-200 p-1.5 rounded-xl hover:bg-white/5 active:scale-95"
            >
              {sidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
            </button>
            
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex text-slate-500 hover:text-slate-300 transition-all duration-200 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer active:scale-95"
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
            {/* Live Clock */}
            <LiveClock />

            <div className="h-4 w-px bg-white/[0.06] mx-1 hidden lg:block" />

            {/* Search Trigger */}
            <button className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-500 text-xs font-medium hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group">
              <MdSearch size={14} className="group-hover:text-emerald-400 transition-colors" />
              <span>Search</span>
              <kbd className="ml-4 hidden lg:inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                <MdKeyboardCommandKey size={10} />K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200 cursor-pointer group">
              <MdNotifications size={18} className="group-hover:animate-float-fast" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border border-[#06080f]">
                <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-40"></span>
              </span>
            </button>

            {/* User Avatar - Mobile */}
            <div className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-[10px] font-bold text-white shadow-lg shadow-emerald-500/15">
              {getInitials(user.email)}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <aside 
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#080a12]/95 backdrop-blur-2xl border-r border-white/[0.04] flex flex-col"
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
                <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white p-1 transition-all active:scale-90">
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
                      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300
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
        <main ref={mainRef} className="flex-1 page-content-wrapper relative">
          {/* Subtle scan line effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.015]">
            <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" style={{ animation: 'scan-line 8s linear infinite' }} />
          </div>
          
          <div className="px-5 md:px-8 py-6 md:py-8 max-w-[1440px] mx-auto w-full relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
