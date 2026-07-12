"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { gsap } from "gsap";
import { MdEmojiEvents, MdLocalFireDepartment, MdGroup, MdWorkspacePremium, MdAdd, MdCardGiftcard, MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { message } from "antd";

export default function GamificationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: () => apiService.getDashboardOverview(),
  });

  const [activeTab, setActiveTab] = useState("challenges");
  
  const challenges = [
    { id: 1, title: "Zero-Waste Week", category: "Environmental", participants: 142, reward: "500 XP", daysLeft: 2, progress: 85 },
    { id: 2, title: "Commute Green", category: "Scope 3", participants: 315, reward: "800 XP + Badge", daysLeft: 14, progress: 42 },
    { id: 3, title: "Diversity Mentorship", category: "Social", participants: 64, reward: "1200 XP", daysLeft: 30, progress: 15 },
  ];

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".game-card", 
          { opacity: 0, y: 30, scale: 0.95 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08, ease: "elastic.out(1, 0.75)" }
        );
        gsap.fromTo(".leaderboard-row", 
          { opacity: 0, x: -20 }, 
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.05, ease: "power2.out", delay: 0.4 }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, activeTab]);

  if (isLoading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-ping opacity-50 blur-sm"></div>
          <div className="h-16 w-16 rounded-2xl border border-white/10 glass-panel flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent"></div>
            <MdEmojiEvents size={24} className="text-violet-400 animate-pulse" />
          </div>
        </div>
        <p className="text-violet-400/80 text-xs font-bold mt-6 tracking-widest uppercase animate-pulse">Loading Leaderboards...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4">
        <div className="relative">
          <div className="absolute -left-4 top-2 w-1 h-8 rounded-r-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
          <h1 className="text-3xl md:text-[32px] font-extrabold tracking-tight text-white leading-tight">Gamification</h1>
          <p className="text-slate-400 text-[14px] mt-1.5 font-medium">Employee engagement, challenges, and sustainability rewards</p>
        </div>
        
        <button className="self-start md:self-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer hover-lift group">
          <MdAdd size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Challenge</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Active Challenges", value: dashboard?.active_challenges || 0, icon: <MdLocalFireDepartment size={22} />, color: "orange" },
          { label: "Total Participants", value: "842", icon: <MdGroup size={22} />, color: "cyan" },
          { label: "XP Awarded (YTD)", value: "124.5k", icon: <MdWorkspacePremium size={22} />, color: "amber" },
        ].map((k, i) => (
          <div key={i} className={`game-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-${k.color}-500/30`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-${k.color}-500/10 blur-[50px] group-hover:bg-${k.color}-500/20 transition-all duration-700`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{k.label}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-${k.color}-500/20 to-${k.color}-500/5 text-${k.color}-400 border border-${k.color}-500/20 shadow-[0_0_15px_rgba(var(--${k.color}-500-rgb),0.2)]`}>
                  {k.icon}
                </div>
              </div>
              <span className="text-[38px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="game-card glass-panel-strong rounded-3xl p-2 lg:col-span-2 relative overflow-hidden flex flex-col">
          {/* Custom Tabs */}
          <div className="flex p-2 gap-2 border-b border-white/[0.04]">
            {[
              { id: 'challenges', label: 'Active Challenges' },
              { id: 'rewards', label: 'Rewards Store' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-white/[0.06] text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 flex-1">
            {activeTab === 'challenges' && (
              <div className="space-y-4">
                {challenges.map(c => (
                  <div key={c.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                          <MdOutlineEnergySavingsLeaf size={20} />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-200 group-hover:text-white transition-colors">{c.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-[#0c0e16] px-2 py-0.5 rounded border border-white/[0.04]">{c.category}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{c.participants} joined</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[14px] font-black text-amber-400">{c.reward}</span>
                        <span className="block text-[11px] text-slate-500 font-medium mt-1">{c.daysLeft} days left</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{c.progress}%</span>
                      </div>
                      <div className="w-full bg-[#0c0e16] rounded-full h-2 overflow-hidden border border-white/[0.04]">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full relative" style={{ width: `${c.progress}%` }}>
                          <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "$50 Green Charity Donation", cost: "5,000 XP", icon: <MdCardGiftcard size={24} /> },
                  { name: "Extra PTO Day", cost: "15,000 XP", icon: <MdWorkspacePremium size={24} /> },
                  { name: "Eco-Friendly Swag Kit", cost: "8,000 XP", icon: <MdOutlineEnergySavingsLeaf size={24} /> },
                ].map((r, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col items-center text-center hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group hover:-translate-y-1">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center text-amber-400 mb-4 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-shadow">
                      {r.icon}
                    </div>
                    <h5 className="text-[14px] font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">{r.name}</h5>
                    <span className="text-[12px] font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 mb-4">{r.cost}</span>
                    <button className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[12px] font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors">
                      Redeem
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="game-card glass-panel-strong rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] -z-10"></div>
          
          <h3 className="text-[16px] font-bold text-white mb-1">Global Leaderboard</h3>
          <p className="text-[12px] text-slate-400 font-medium mb-6">Top sustainability champions</p>
          
          <div className="space-y-2">
            {dashboard?.leaderboard.map((user, idx) => (
              <div key={user.name} className="leaderboard-row flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-[12px] font-extrabold shadow-inner
                      ${idx === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-amber-500/50" :
                        idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 shadow-slate-400/50" :
                        idx === 2 ? "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 shadow-amber-800/50" :
                        "bg-white/[0.05] text-slate-400"
                      }`}>
                      {idx + 1}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors">{user.name}</span>
                    <span className="block text-[10px] text-slate-500 font-medium mt-0.5">{user.department || 'Operations'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[13px] font-black text-emerald-400">{user.xp.toLocaleString()} XP</span>
                </div>
              </div>
            ))}
            {(!dashboard?.leaderboard || dashboard.leaderboard.length === 0) && (
              <div className="text-center py-8 text-slate-500 text-sm font-medium">No ranking data available.</div>
            )}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-[12px] font-bold text-slate-300 transition-colors">
            View Full Rankings
          </button>
        </div>
      </div>
    </div>
  );
}
