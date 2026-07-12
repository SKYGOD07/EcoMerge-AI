"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { gsap } from "gsap";
import { 
  MdTrackChanges, 
  MdNotificationsActive, 
  MdWorkspacePremium, 
  MdEmojiEvents,
  MdArrowForward,
  MdNorthEast,
  MdAdd,
  MdFileDownload,
  MdAutorenew
} from "react-icons/md";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0e16]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold text-white drop-shadow-md">
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          <span className="text-slate-500 text-xs ml-1 font-medium">{p.dataKey === 'kgco2e' ? 'kgCO2e' : ''}</span>
        </p>
      ))}
    </div>
  );
};

export default function OverviewPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("6M");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: dashboard, isLoading: dashLoading, error: dashError } = useQuery({
    queryKey: ["dashboardOverview", timeRange],
    queryFn: () => apiService.getDashboardOverview(timeRange),
  });

  const { data: carbon, isLoading: carbonLoading } = useQuery({
    queryKey: ["carbonSummary"],
    queryFn: () => apiService.getCarbonSummary(),
  });

  useEffect(() => {
    if (!dashLoading && dashboard) {
      const ctx = gsap.context(() => {
        // Stagger cards with spring effect
        gsap.fromTo(".kpi-card", 
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.08, ease: "elastic.out(1, 0.75)" }
        );
        
        // Charts entry
        gsap.fromTo(".chart-panel",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
        
        // Bottom sections entry
        gsap.fromTo(".bottom-card",
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.4 }
        );

        // Orbital rings animation using standard CSS classes is handled in layout,
        // but let's animate the inner elements slightly
        gsap.utils.toArray('.kpi-icon-wrap').forEach((el: any) => {
          gsap.to(el, {
            y: -4,
            duration: 2 + Math.random(),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        });

        // Score counter animation
        const scoreVal = { val: 0 };
        gsap.to(scoreVal, {
          val: dashboard.overall_esg_score,
          duration: 2.5,
          ease: "power3.out",
          onUpdate: () => {
            const el = document.getElementById("esg-score-counter");
            if (el) el.innerText = scoreVal.val.toFixed(1);
          }
        });

        // Counter animations
        ["carbon-counter", "challenges-counter", "notif-counter"].forEach((id, idx) => {
          const el = document.getElementById(id);
          if (!el) return;
          const targetVal = id === "carbon-counter" ? (carbon?.target_progress || 74) 
                          : id === "challenges-counter" ? dashboard.active_challenges 
                          : dashboard.notifications;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: targetVal,
            duration: 2,
            delay: 0.2 + idx * 0.15,
            ease: "power3.out",
            onUpdate: () => {
              if (el) el.innerText = id === "carbon-counter" ? `${Math.round(obj.val)}%` : Math.round(obj.val).toString();
            }
          });
        });

      }, containerRef);
      return () => ctx.revert();
    }
  }, [dashLoading, dashboard, carbon]);

  // Loading State
  if (dashLoading || carbonLoading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-50 blur-sm"></div>
          <div className="h-16 w-16 rounded-2xl border border-white/10 glass-panel flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400"></div>
          </div>
        </div>
        <p className="text-emerald-400/80 text-xs font-bold mt-6 tracking-widest uppercase animate-pulse">Initializing Telemetry...</p>
      </div>
    );
  }

  if (dashError || !dashboard) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center text-center">
        <div className="rounded-2xl bg-rose-500/5 border border-rose-500/10 p-5 text-rose-400 mb-4 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <MdNotificationsActive size={32} />
        </div>
        <h3 className="text-lg font-semibold text-white mt-2">Connection Error</h3>
        <p className="text-slate-400 max-w-sm text-sm mt-2 leading-relaxed">Ensure the backend server is running on port 8000 and try refreshing the page.</p>
      </div>
    );
  }

  const barColors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b"];

  // Mini sparkline data
  const sparkData = [
    { v: 65 }, { v: 72 }, { v: 68 }, { v: 74 }, { v: 78 }, { v: 82 }, { v: 80 }, { v: dashboard.overall_esg_score }
  ];

  return (
    <div ref={containerRef} className="space-y-6 relative z-10">
      {/* ═══ Page Header ═══ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4">
        <div className="relative">
          <div className="absolute -left-4 top-2 w-1 h-8 rounded-r-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <h1 className="text-3xl md:text-[32px] font-extrabold tracking-tight text-white leading-tight">
            Overview
          </h1>
          <p className="text-slate-400 text-[14px] mt-1.5 font-medium">
            Real-time sustainability indicators across all departments
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Quick Action Button */}
          <button 
            onClick={() => router.push("/dashboard/environmental")}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 px-4 py-2 transition-all duration-300 hover-lift group cursor-pointer"
          >
            <MdAdd size={16} className="text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[12px] font-semibold text-slate-200">New Initiative</span>
          </button>
          
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] backdrop-blur-md">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">Live Sync</span>
          </div>
        </div>
      </div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* ESG Score */}
        <div className="kpi-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-emerald-500/30">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-emerald-500/10 blur-[50px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">ESG Score</span>
              <div className="kpi-icon-wrap relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <MdWorkspacePremium size={20} />
                <div className="absolute inset-0 rounded-2xl border border-emerald-400/30 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-orbit"></div>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span id="esg-score-counter" className="text-[42px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">0</span>
              <span className="text-slate-500 text-sm font-bold mb-1.5">/100</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/10">
                <MdNorthEast size={12} />
                <span className="text-[11px] font-bold">+4.2%</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">vs. last quarter</span>
            </div>
            {/* Mini sparkline */}
            <div className="mt-4 h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#10b981" fill="url(#sparkGreen)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Carbon Reduction */}
        <div className="kpi-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-cyan-500/30">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-cyan-500/10 blur-[50px] group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Carbon Target</span>
              <div className="kpi-icon-wrap relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <MdTrackChanges size={20} />
                <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-orbit-reverse"></div>
              </div>
            </div>
            <span id="carbon-counter" className="text-[42px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">0%</span>
            <div className="mt-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-slate-500 font-medium">Progress to Net-Zero</span>
                <span className="text-[11px] text-cyan-400 font-bold">{carbon?.target_progress || 74}%</span>
              </div>
              <div className="w-full bg-white/[0.03] rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full relative" 
                  style={{ width: `${carbon?.target_progress || 74}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 animate-shimmer opacity-30"></div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 font-medium bg-white/[0.02] inline-block px-2.5 py-1 rounded-lg border border-white/[0.04]">26% remaining</p>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="kpi-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-violet-500/30">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-500/10 blur-[50px] group-hover:bg-violet-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Challenges</span>
              <div className="kpi-icon-wrap relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <MdEmojiEvents size={20} />
                <div className="absolute inset-0 rounded-2xl border border-violet-400/30 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-orbit"></div>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span id="challenges-counter" className="text-[42px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">0</span>
              <span className="text-slate-500 text-sm font-bold mb-1.5">active</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Env", pct: 40, color: "from-emerald-500 to-emerald-400" },
                { label: "Soc", pct: 35, color: "from-violet-500 to-fuchsia-400" },
                { label: "Gov", pct: 25, color: "from-cyan-500 to-blue-400" },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</span>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-1.5">
                    <div className={`bg-gradient-to-r ${s.color} h-1.5 rounded-full`} style={{ width: `${s.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="kpi-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-amber-500/30">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-amber-500/10 blur-[50px] group-hover:bg-amber-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Alerts</span>
              <div className="kpi-icon-wrap relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <MdNotificationsActive size={20} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-[#0c0e16]"></span>
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span id="notif-counter" className="text-[42px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">0</span>
              <span className="text-slate-500 text-sm font-bold mb-1.5">pending</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2.5 bg-rose-500/5 border border-rose-500/10 p-2 rounded-xl">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[11px] text-rose-200/80 font-medium">1 high-severity compliance</span>
              </div>
              <div className="flex items-center gap-2.5 bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                <span className="text-[11px] text-amber-200/80 font-medium">Policy ack. required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Charts ═══ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Carbon Trend - 3 cols */}
        <div className="chart-panel glass-panel-strong rounded-3xl p-6 lg:col-span-3 relative overflow-hidden group">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-[15px] font-bold text-white">Carbon Emissions Trend</h3>
              <p className="text-[12px] text-slate-400 font-medium mt-1">Monthly kgCO2e trajectory vs targets</p>
            </div>
            <div className="flex gap-1.5 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
              {["1W", "1M", "6M", "1Y"].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer
                    ${timeRange === t ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'}
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.carbon_trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="kgco2e" 
                  stroke="url(#lineGradient)" 
                  strokeWidth={3} 
                  fill="url(#areaGradient)"
                  dot={{ fill: "#0c0e16", r: 4, strokeWidth: 2, stroke: "#34d399" }} 
                  activeDot={{ r: 6, strokeWidth: 3, stroke: "#10b981", fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Scores - 2 cols */}
        <div className="chart-panel glass-panel-strong rounded-3xl p-6 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[15px] font-bold text-white">Department Index</h3>
              <p className="text-[12px] text-slate-400 font-medium mt-1">ESG performance by division</p>
            </div>
            <button className="text-slate-500 hover:text-white p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] transition-colors">
              <MdAutorenew size={16} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.department_scores} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="department" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {dashboard.department_scores.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={barColors[index % barColors.length]} 
                      fillOpacity={0.85} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ Bottom Section ═══ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        {/* Quick Actions (New Widget) */}
        <div className="bottom-card glass-panel-strong rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-bold text-white">Quick Actions</h3>
              <p className="text-[12px] text-slate-400 font-medium mt-1">Frequent dashboard tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "Export Report", icon: <MdFileDownload size={18} />, color: "from-emerald-500/20 to-emerald-500/5", text: "text-emerald-400", path: "/dashboard/reports" },
              { title: "Log Emissions", icon: <MdTrackChanges size={18} />, color: "from-cyan-500/20 to-cyan-500/5", text: "text-cyan-400", path: "/dashboard/environmental" },
              { title: "New Challenge", icon: <MdEmojiEvents size={18} />, color: "from-violet-500/20 to-violet-500/5", text: "text-violet-400", path: "/dashboard/gamification" },
              { title: "Review Alerts", icon: <MdNotificationsActive size={18} />, color: "from-amber-500/20 to-amber-500/5", text: "text-amber-400", path: "/dashboard/governance" },
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={() => router.push(action.path)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} ${action.text}`}>
                  {action.icon}
                </div>
                <span className="text-[11px] font-semibold text-slate-300">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard (Span 1) */}
        <div className="bottom-card glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-bold text-white">Top Contributors</h3>
              <p className="text-[12px] text-slate-400 font-medium mt-1">Employee sustainability leaderboard</p>
            </div>
            <button 
              onClick={() => router.push("/dashboard/gamification")}
              className="flex items-center gap-1 text-[11px] text-emerald-400/80 font-bold hover:text-emerald-400 hover:bg-emerald-400/10 px-2 py-1 rounded-lg transition-all cursor-pointer"
            >
              <span>View All</span>
              <MdArrowForward size={14} />
            </button>
          </div>
          <div className="space-y-2.5">
            {dashboard.leaderboard.slice(0, 3).map((item, idx) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3.5 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.08] hover:shadow-lg group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-[12px] font-extrabold shadow-inner
                      ${idx === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-amber-500/50" :
                        idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 shadow-slate-400/50" :
                        "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 shadow-amber-800/50"
                      }`}>
                      {idx + 1}
                    </span>
                    {idx === 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <MdWorkspacePremium size={10} className="text-amber-500" />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-[13px] text-slate-200 group-hover:text-white transition-colors">{item.name}</span>
                    <span className="block text-[10px] text-slate-500 font-medium mt-0.5">{item.department || 'Operations'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[12px] font-black text-emerald-400">
                    {item.xp} XP
                  </span>
                  <div className="h-1.5 w-16 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: `${Math.min(100, (item.xp / 500) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Initiatives (Span 1) */}
        <div className="bottom-card glass-panel-strong rounded-3xl p-6 flex flex-col relative overflow-hidden hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-[60px] -z-10"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-bold text-white">Active Initiatives</h3>
              <p className="text-[12px] text-slate-400 font-medium mt-1">Current programs in flight</p>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {[
              { title: "Hybrid Shift Optimization", desc: "Reduce Scope 3 commute emissions", color: "emerald", progress: 68, icon: "🌿", path: "/dashboard/environmental" },
              { title: "ESG Compliance Audit", desc: "Mandatory HR policy reviews", color: "violet", progress: 84, icon: "📋", path: "/dashboard/governance" },
            ].map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => router.push(item.path)}
                className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-lg border border-white/[0.05] shadow-sm">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-white transition">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold bg-white/[0.05] px-2 py-0.5 rounded-md">{item.progress}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed truncate">{item.desc}</p>
                    <div className="mt-3 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          item.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                          'bg-gradient-to-r from-violet-500 to-fuchsia-400'
                        }`} 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>System fully operational</span>
            <span className="flex items-center gap-1.5 text-emerald-400/80 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/10">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
