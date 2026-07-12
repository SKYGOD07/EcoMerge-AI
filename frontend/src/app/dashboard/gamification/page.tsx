"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MdEmojiEvents, MdCheckCircle, MdOfflineBolt, MdLock, MdArrowForward, MdStar, MdRedeem } from "react-icons/md";
import { message } from "antd";

interface Challenge { id: string; title: string; type: string; xp_reward: number; progress: number; target: number; unit: string; status: "Active" | "Completed"; }
interface Badge { id: string; name: string; description: string; xp_threshold: number; icon: string; unlocked: boolean; }
interface Reward { id: string; title: string; xp_cost: number; stock: number; image: string; }

export default function GamificationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [xp, setXp] = useState(850);
  const [level, setLevel] = useState(4);

  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: "ch1", title: "Complete Q3 Compliance Training", type: "Governance", xp_reward: 150, progress: 1, target: 1, unit: "workshop", status: "Active" },
    { id: "ch2", title: "Log 5 Commute Walks instead of Driving", type: "Environmental", xp_reward: 200, progress: 3, target: 5, unit: "walks", status: "Active" },
    { id: "ch3", title: "Participate in Carbon Forestry Event", type: "Social", xp_reward: 250, progress: 0, target: 1, unit: "event", status: "Active" },
  ]);

  const [badges] = useState<Badge[]>([
    { id: "b1", name: "Carbon Zero Hero", description: "Logged first carbon scope reduction entry", xp_threshold: 100, icon: "🌱", unlocked: true },
    { id: "b2", name: "Compliance Champion", description: "Completed all active policy acknowledgements", xp_threshold: 300, icon: "📜", unlocked: true },
    { id: "b3", name: "Outreach Catalyst", description: "Volunteered 10+ hours in CSR activities", xp_threshold: 600, icon: "🤝", unlocked: true },
    { id: "b4", name: "ESG Vanguard", description: "Reached 1,500+ cumulative XP", xp_threshold: 1500, icon: "👑", unlocked: false },
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    { id: "r1", title: "Premium Eco Flask", xp_cost: 300, stock: 14, image: "🧉" },
    { id: "r2", title: "1-Month Transit Pass", xp_cost: 500, stock: 6, image: "🎫" },
    { id: "r3", title: "Tree Planted In Your Name", xp_cost: 200, stock: 99, image: "🌳" },
  ]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".game-card", { opacity: 0, y: 25, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" });
      gsap.fromTo(".game-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleCompleteChallenge = (id: string, xpReward: number) => {
    setChallenges(prev => prev.map(ch => ch.id === id ? { ...ch, progress: ch.target, status: "Completed" } : ch));
    setXp(prev => {
      const newXp = prev + xpReward;
      messageApi.success(`+${xpReward} XP awarded!`);
      if (newXp >= level * 300) { setLevel(l => l + 1); messageApi.success(`🎉 Level Up! Reached Level ${level + 1}`); }
      return newXp;
    });
  };

  const handleRedeemReward = (id: string, cost: number) => {
    if (xp < cost) { messageApi.error("Insufficient XP for redemption"); return; }
    setXp(prev => prev - cost);
    setRewards(prev => prev.map(r => r.id === id ? { ...r, stock: r.stock - 1 } : r));
    messageApi.success("Reward redeemed! Receipt sent to email");
  };

  const nextLevelXp = level * 300;
  const prevLevelXp = (level - 1) * 300;
  const progressPercent = Math.min(100, Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  const typeColor = (t: string) => t === "Governance" ? "text-violet-400 bg-violet-500/10 border-violet-500/15" : t === "Environmental" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/15" : "text-cyan-400 bg-cyan-500/10 border-cyan-500/15";

  return (
    <div ref={containerRef} className="space-y-6">
      {contextHolder}
      <div className="pb-2">
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-white leading-tight">Gamification & Rewards</h1>
        <p className="text-slate-500 text-[13px] mt-1 font-medium">Sustainability quests, progression system, and rewards store</p>
      </div>

      {/* Level Progress Hero Card */}
      <div className="game-card relative rounded-2xl border border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-violet-950/10 p-6 md:p-7 overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-violet-500/[0.04] blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-emerald-500/[0.03] blur-[80px]"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-600 text-white shadow-xl shadow-violet-500/20">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Lvl</span>
                  <span className="block text-2xl font-black leading-none">{level}</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#0c0e16] flex items-center justify-center">
                <MdStar size={10} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Active ESG Practitioner
                <MdOfflineBolt className="text-emerald-400" size={18} />
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Next badge unlock at {badges.find(b => !b.unlocked)?.xp_threshold || 1500} XP</p>
            </div>
          </div>
          <div className="flex-1 max-w-sm">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-2">
              <span className="flex items-center gap-1"><MdOfflineBolt size={12} className="text-emerald-400" /> {xp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 h-2 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5 text-right">{Math.round(progressPercent)}% to Level {level + 1}</p>
          </div>
        </div>
      </div>

      {/* Badges + Quests */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Badges */}
        <div className="game-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-3">
          <h3 className="text-[13px] font-semibold text-white mb-5">Badge Collection</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map(badge => (
              <div key={badge.id} className={`rounded-xl border p-4 text-center flex flex-col items-center justify-center transition-all duration-300 group
                ${badge.unlocked ? "bg-white/[0.02] border-white/[0.06] hover:border-emerald-500/20 hover:bg-white/[0.04]" : "bg-white/[0.01] border-white/[0.03] opacity-40"}`}>
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{badge.icon}</span>
                <h4 className="text-[11px] font-bold text-slate-200">{badge.name}</h4>
                <p className="text-[10px] text-slate-600 mt-1 leading-relaxed line-clamp-2">{badge.description}</p>
                {!badge.unlocked && (
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-600"><MdLock size={10} /><span>{badge.xp_threshold} XP</span></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quests */}
        <div className="game-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-2">
          <h3 className="text-[13px] font-semibold text-white mb-5">Active Quests</h3>
          <div className="space-y-3">
            {challenges.map(ch => (
              <div key={ch.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${typeColor(ch.type)}`}>{ch.type}</span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5"><MdOfflineBolt size={11} />+{ch.xp_reward}</span>
                </div>
                <h4 className="text-[12px] font-semibold text-slate-200 group-hover:text-white transition">{ch.title}</h4>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${(ch.progress / ch.target) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{ch.progress}/{ch.target}</span>
                </div>
                <div className="mt-3 flex justify-end">
                  {ch.status === "Active" ? (
                    <button onClick={() => handleCompleteChallenge(ch.id, ch.xp_reward)} className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-[10px] font-bold text-white hover:brightness-110 active:scale-[0.97] transition cursor-pointer">
                      Complete
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-2 py-1">
                      <MdCheckCircle size={11} /> Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rewards Store */}
      <div className="game-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[13px] font-semibold text-white">Rewards Store</h3>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Redeem XP for exclusive sustainability perks</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-xl px-3 py-1.5">
            <MdOfflineBolt size={13} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-white">{xp} XP</span>
            <span className="text-[10px] text-slate-500 font-medium">available</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rewards.map(reward => (
            <div key={reward.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-5 flex flex-col items-center justify-between hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group">
              <div className="text-center">
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">{reward.image}</span>
                <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-white transition">{reward.title}</h4>
                <div className="flex items-center justify-center gap-1 text-violet-400 font-extrabold text-[12px] mt-2">
                  <MdOfflineBolt size={13} />
                  <span>{reward.xp_cost} XP</span>
                </div>
                <span className="text-[10px] text-slate-600 font-bold mt-1 block">{reward.stock} left</span>
              </div>
              <button onClick={() => handleRedeemReward(reward.id, reward.xp_cost)} disabled={reward.stock <= 0 || xp < reward.xp_cost}
                className={`w-full rounded-xl py-2.5 text-[11px] font-semibold mt-4 transition-all cursor-pointer flex items-center justify-center gap-1.5
                  ${xp >= reward.xp_cost && reward.stock > 0 
                    ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:brightness-110 active:scale-[0.98]" 
                    : "bg-white/[0.03] text-slate-600 border border-white/[0.04] cursor-not-allowed"}`}>
                <MdRedeem size={13} />
                {reward.stock <= 0 ? "Out of Stock" : xp < reward.xp_cost ? "Need More XP" : "Redeem"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
