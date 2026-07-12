"use client";

import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area
} from "recharts";
import { gsap } from "gsap";
import { 
  MdTrendingUp, 
  MdTrackChanges, 
  MdNotificationsActive, 
  MdWorkspacePremium, 
  MdLeaderboard,
  MdEmojiEvents,
  MdArrowForward,
  MdTrendingDown,
  MdNorthEast
} from "react-icons/md";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0e16] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold text-white">
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          <span className="text-slate-500 text-xs ml-1">{p.dataKey === 'kgco2e' ? 'kgCO2e' : ''}</span>
        </p>
      ))}
    </div>
  );
};

export default function OverviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: dashboard, isLoading: dashLoading, error: dashError } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: () => apiService.getDashboardOverview(),
  });

  const { data: carbon, isLoading: carbonLoading } = useQuery({
    queryKey: ["carbonSummary"],
    queryFn: () => apiService.getCarbonSummary(),
  });

  useEffect(() => {
    if (!dashLoading && dashboard) {
      const ctx = gsap.context(() => {
        // Stagger cards
        gsap.fromTo(".kpi-card", 
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.06, ease: "power3.out" }
        );
        
        // Charts
        gsap.fromTo(".chart-panel",
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.3 }
        );
        
        // Bottom sections
        gsap.fromTo(".bottom-card",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.5 }
        );

        // Score counter animation
        const scoreVal = { val: 0 };
        gsap.to(scoreVal, {
          val: dashboard.overall_esg_score,
          duration: 2,
          ease: "power2.out",
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
            duration: 1.8,
            delay: 0.2 + idx * 0.1,
            ease: "power2.out",
            onUpdate: () => {
              if (el) el.innerText = id === "carbon-counter" ? `${Math.round(obj.val)}%` : Math.round(obj.val).toString();
            }
          });
        });

      }, containerRef);
      return () => ctx.revert();
    }
  }, [dashLoading, dashboard, carbon]);

  if (dashLoading || carbonLoading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl border-2 border-white/5 bg-white/[0.02] flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          </div>
        </div>
        <p className="text-slate-600 text-xs font-medium mt-5 tracking-wider uppercase">Loading ESG data...</p>
      </div>
    );
  }

  if (dashError || !dashboard) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center text-center">
        <div className="rounded-2xl bg-rose-500/5 border border-rose-500/10 p-4 text-rose-400 mb-4">
          <MdNotificationsActive size={28} />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mt-2">Connection Error</h3>
        <p className="text-slate-500 max-w-sm text-xs mt-2 leading-relaxed">Ensure the backend server is running on port 8000 and try refreshing the page.</p>
      </div>
    );
  }

  const barColors = ["#10b981", "#6366f1", "#f472b6", "#fbbf24"];

  // Mini sparkline data
  const sparkData = [
    { v: 65 }, { v: 72 }, { v: 68 }, { v: 74 }, { v: 78 }, { v: 82 }, { v: 80 }, { v: dashboard.overall_esg_score }
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ═══ Page Header ═══ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-2">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-white leading-tight">
            ESG Performance Hub
          </h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">
            Real-time sustainability indicators across all departments
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-widest">Live</span>
          </div>
          <span className="text-[11px] text-slate-600 font-medium hidden sm:inline">Updated just now</span>
        </div>
      </div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* ESG Score */}
        <div className="kpi-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden transition-all duration-300 hover:border-emerald-500/15 hover:bg-white/[0.03]">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/[0.03] blur-2xl group-hover:bg-emerald-500/[0.06] transition-all duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">ESG Score</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <MdWorkspacePremium size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span id="esg-score-counter" className="text-[36px] font-extrabold text-white leading-none tracking-tight">0</span>
              <span className="text-slate-600 text-xs font-bold mb-1">/100</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-emerald-400">
                <MdNorthEast size={12} />
                <span className="text-[11px] font-bold">+4.2%</span>
              </div>
              <span className="text-[11px] text-slate-600">vs. last quarter</span>
            </div>
            {/* Mini sparkline */}
            <div className="mt-3 h-8 w-full opacity-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#10b981" fill="url(#sparkGreen)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Carbon Reduction */}
        <div className="kpi-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden transition-all duration-300 hover:border-cyan-500/15 hover:bg-white/[0.03]">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-500/[0.03] blur-2xl group-hover:bg-cyan-500/[0.06] transition-all duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">Carbon Target</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <MdTrackChanges size={16} />
              </div>
            </div>
            <span id="carbon-counter" className="text-[36px] font-extrabold text-white leading-none tracking-tight">0%</span>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-slate-600 font-medium">Progress</span>
                <span className="text-[10px] text-slate-500 font-bold">{carbon?.target_progress || 74}%</span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${carbon?.target_progress || 74}%` }}
                ></div>
              </div>
            </div>
            <p className="mt-2.5 text-[11px] text-slate-600 font-medium">26% remaining to net-zero</p>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="kpi-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden transition-all duration-300 hover:border-violet-500/15 hover:bg-white/[0.03]">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-violet-500/[0.03] blur-2xl group-hover:bg-violet-500/[0.06] transition-all duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">Challenges</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <MdEmojiEvents size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span id="challenges-counter" className="text-[36px] font-extrabold text-white leading-none tracking-tight">0</span>
              <span className="text-slate-600 text-xs font-bold mb-1">active</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Env", pct: 40, color: "bg-emerald-500" },
                { label: "Soc", pct: 35, color: "bg-violet-500" },
                { label: "Gov", pct: 25, color: "bg-cyan-500" },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] text-slate-600 font-bold uppercase">{s.label}</span>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-1">
                    <div className={`${s.color} h-1 rounded-full`} style={{ width: `${s.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-slate-600 font-medium">148 staff participating</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="kpi-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden transition-all duration-300 hover:border-amber-500/15 hover:bg-white/[0.03]">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/[0.03] blur-2xl group-hover:bg-amber-500/[0.06] transition-all duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">Alerts</span>
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <MdNotificationsActive size={16} />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-[#0c0e16]"></span>
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span id="notif-counter" className="text-[36px] font-extrabold text-white leading-none tracking-tight">0</span>
              <span className="text-slate-600 text-xs font-bold mb-1">pending</span>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
                <span className="text-[11px] text-slate-500 font-medium">1 high-severity compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                <span className="text-[11px] text-slate-500 font-medium">Policy ack. required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Charts ═══ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Carbon Trend - 3 cols */}
        <div className="chart-panel rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[13px] font-semibold text-white">Carbon Emissions Trend</h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">Monthly kgCO2e across all scopes</p>
            </div>
            <div className="flex gap-1">
              {["6M", "1Y", "All"].map((t, i) => (
                <button key={t} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer
                  ${i === 0 ? 'bg-white/[0.06] text-white' : 'text-slate-600 hover:text-slate-400 hover:bg-white/[0.03]'}
                `}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.carbon_trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="kgco2e" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fill="url(#areaGradient)"
                  dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }} 
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#10b981", fill: "#0c0e16" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Scores - 2 cols */}
        <div className="chart-panel rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[13px] font-semibold text-white">Department Scores</h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">ESG index by division</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.department_scores} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="department" stroke="#334155" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#334155" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[8, 8, 4, 4]} maxBarSize={32}>
                  {dashboard.department_scores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ Bottom Section ═══ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        
        {/* Leaderboard */}
        <div className="bottom-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[13px] font-semibold text-white">Sustainability Leaderboard</h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">Top contributors this quarter</p>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-emerald-400/80 font-semibold hover:text-emerald-400 transition cursor-pointer">
              <span>View All</span>
              <MdArrowForward size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {dashboard.leaderboard.map((item, idx) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.08] group"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-extrabold
                    ${idx === 0 ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                      idx === 1 ? "bg-slate-400/10 text-slate-400 border border-slate-400/15" :
                      "bg-amber-700/10 text-amber-600/80 border border-amber-700/15"
                    }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-[13px] text-slate-200 group-hover:text-white transition">{item.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-12 bg-white/[0.04] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${Math.min(100, (item.xp / 500) * 100)}%` }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg">
                    {item.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Initiatives */}
        <div className="bottom-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[13px] font-semibold text-white">Active Initiatives</h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">Current programs across departments</p>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {[
              { title: "Operations Hybrid Shift", desc: "Reduce Scope 3 commute emissions by 25% this quarter.", color: "emerald", progress: 68, icon: "🌿" },
              { title: "ESG Policy Review", desc: "HR auditing compliance training completions.", color: "violet", progress: 84, icon: "📋" },
              { title: "Green Logistics Campaign", desc: "Paperless documentation contest — 6 days remaining.", color: "cyan", progress: 42, icon: "📦" },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 bg-white/[0.04] rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.color === 'emerald' ? 'bg-emerald-500' : 
                            item.color === 'violet' ? 'bg-violet-500' : 'bg-cyan-500'
                          }`} 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{item.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-600 font-medium">
            <span>Last refreshed: Just now</span>
            <span className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              System operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
