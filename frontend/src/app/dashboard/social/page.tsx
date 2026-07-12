"use client";

import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { gsap } from "gsap";
import { MdAdd, MdVolunteerActivism, MdDiversity3, MdSchool, MdHourglassTop, MdCheckCircle, MdClose, MdPeople, MdArrowForward } from "react-icons/md";
import { message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api";

interface CSRActivity {
  id: string;
  title: string;
  category: string;
  volunteer_hours: number;
  funds_raised: string;
  participation_rate: number;
  status: "Completed" | "In Progress" | "Scheduled";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0e16]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold text-white drop-shadow-md">{p.value}%</p>
      ))}
    </div>
  );
};

export default function SocialPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const { data: dbActivities = [], isLoading } = useQuery({
    queryKey: ["socialActivities"],
    queryFn: () => apiService.getSocialActivities(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["settings_categories"],
    queryFn: async () => {
      const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (isVercel ? '' : "http://localhost:8000");
      const res = await fetch(`${API_BASE_URL}/api/settings/categories`);
      if (!res.ok) throw new Error("Failed to load categories");
      return res.json();
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Community Outreach");
  const [newHours, setNewHours] = useState("");
  const [newFunds, setNewFunds] = useState("");
  const [newRate, setNewRate] = useState("50");
  const [newStatus, setNewStatus] = useState<"Completed" | "In Progress" | "Scheduled">("Scheduled");

  useEffect(() => {
    const csrCats = categories.filter((c: any) => c.type === "csr");
    if (csrCats.length > 0 && (!newCategory || !csrCats.some((c: any) => c.name === newCategory))) {
      setNewCategory(csrCats[0].name);
    }
  }, [categories, newCategory]);

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".social-card", 
          { opacity: 0, y: 30, scale: 0.95 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08, ease: "elastic.out(1, 0.75)" }
        );
        gsap.fromTo(".social-section", 
          { opacity: 0, y: 25 }, 
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
        gsap.utils.toArray('.kpi-icon-wrap').forEach((el: any) => {
          gsap.to(el, { y: -3, duration: 2 + Math.random(), yoyo: true, repeat: -1, ease: "sine.inOut" });
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading]);

  const addActivityMutation = useMutation({
    mutationFn: (newAct: any) => apiService.createSocialActivity(newAct),
    onSuccess: () => {
      messageApi.success("CSR activity logged successfully");
      queryClient.invalidateQueries({ queryKey: ["socialActivities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] });
      setIsModalOpen(false);
      setNewTitle("");
      setNewHours("");
      setNewFunds("");
      setNewRate("50");
      setNewStatus("Scheduled");
    },
    onError: (err: any) => {
      messageApi.error(`Error logging CSR activity: ${err.message}`);
    }
  });

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHours || !newRate) { messageApi.error("Please fill in all required fields"); return; }
    const catObj = categories.find((c: any) => c.name === newCategory);
    addActivityMutation.mutate({
      title: newTitle,
      category_id: catObj ? catObj.id : undefined,
      description: newTitle,
      volunteer_hours_est: parseInt(newHours),
      funds_raised: newFunds || "N/A",
      points_reward: 50,
      evidence_required: true,
      status: newStatus
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-ping opacity-50 blur-sm"></div>
          <div className="h-16 w-16 rounded-2xl border border-white/10 glass-panel flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent"></div>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400"></div>
          </div>
        </div>
        <p className="text-violet-400/80 text-xs font-bold mt-6 tracking-widest uppercase animate-pulse">Loading CSR metrics...</p>
      </div>
    );
  }

  const mappedActivities = dbActivities.map((act: any) => {
    const cat = categories.find((c: any) => c.id === act.category_id);
    return {
      id: act.id,
      title: act.title,
      category: cat ? cat.name : "Community Outreach",
      volunteer_hours: act.volunteer_hours_est || 0,
      funds_raised: act.funds_raised || "N/A",
      participation_rate: 65,
      status: act.status || "In Progress"
    };
  });

  const diversityData = [
    { name: "Female", value: 46, color: "#ec4899" },
    { name: "Male", value: 50, color: "#6366f1" },
    { name: "Non-Binary", value: 4, color: "#10b981" },
  ];

  const trainingData = [
    { name: "ESG Policy", rate: 94 },
    { name: "Anti-Bribery", rate: 98 },
    { name: "Cybersecurity", rate: 89 },
    { name: "D&I", rate: 92 },
  ];

  const statusColor = (s: string) => s === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : s === "In Progress" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-[0_0_10px_rgba(100,116,139,0.1)]";
  const catColor = (c: string) => c === "Community Outreach" ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" : c === "Environmental" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : c === "Education" ? "text-violet-400 bg-violet-500/10 border-violet-500/20" : "text-pink-400 bg-pink-500/10 border-pink-500/20";

  return (
    <div ref={containerRef} className="space-y-6 relative z-10">
      {contextHolder}
      
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4">
        <div className="relative">
          <div className="absolute -left-4 top-2 w-1 h-8 rounded-r-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
          <h1 className="text-3xl md:text-[32px] font-extrabold tracking-tight text-white leading-tight">Social & CSR</h1>
          <p className="text-slate-400 text-[14px] mt-1.5 font-medium">Outreach initiatives, diversity metrics, and staff engagement analytics</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="self-start md:self-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer hover-lift group">
          <MdAdd size={18} className="group-hover:rotate-90 transition-transform duration-300" /><span>Add Activity</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Volunteer Hours", value: "1,190", sub: "cumulative hours", trend: "+12% QoQ", icon: <MdVolunteerActivism size={20} />, color: "emerald" },
          { label: "Training Rate", value: "93.2%", sub: "avg completion", trend: "Target: 95%", icon: <MdSchool size={20} />, color: "violet" },
          { label: "Diversity Ratio", value: "46/54", sub: "female / male+nb", trend: "GRI compliant", icon: <MdDiversity3 size={20} />, color: "pink" },
          { label: "Active Campaigns", value: "2", sub: "campaigns live", trend: "Forestry & Tech", icon: <MdHourglassTop size={20} />, color: "amber" },
        ].map((k, i) => (
          <div key={i} className={`social-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-${k.color}-500/30`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-${k.color}-500/10 blur-[50px] group-hover:bg-${k.color}-500/20 transition-all duration-700`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{k.label}</span>
                <div className={`kpi-icon-wrap flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-${k.color}-500/20 to-${k.color}-500/5 text-${k.color}-400 border border-${k.color}-500/20 shadow-[0_0_15px_rgba(var(--${k.color}-500-rgb),0.2)]`}>
                  {k.icon}
                </div>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-[38px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">{k.value}</span>
                <span className="text-slate-500 text-sm font-bold mb-1.5">{k.sub}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 bg-white/[0.04] px-2.5 py-1.5 rounded-lg border border-white/[0.04] w-max">
                <span className="text-[11px] font-bold text-slate-400">{k.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="social-section glass-panel-strong rounded-3xl p-6 lg:col-span-3 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-violet-500/10 transition-colors duration-1000"></div>
          
          <div className="mb-6">
            <h3 className="text-[15px] font-bold text-white">Training Completion Rates</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">Mandatory ESG module completions by staff</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {trainingData.map((_, i) => (
                    <Cell key={`c-${i}`} fill={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="social-section glass-panel-strong rounded-3xl p-6 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-[60px] -z-10 group-hover:bg-pink-500/10 transition-colors duration-1000"></div>
          
          <h3 className="text-[15px] font-bold text-white mb-6">Gender Diversity</h3>
          <div className="h-48 flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diversityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={6} dataKey="value" strokeWidth={0} cornerRadius={6}>
                  {diversityData.map((e, i) => <Cell key={`c-${i}`} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <MdPeople size={24} className="text-slate-400 mb-1 mx-auto" />
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {diversityData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-[12px] p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}66` }}></div>
                  <span className="text-slate-300 font-semibold">{d.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{d.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="social-section glass-panel-strong rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[15px] font-bold text-white">CSR & Volunteering Initiatives</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">{mappedActivities.length} tracked programs</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mappedActivities.map(item => (
            <div key={item.id} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${catColor(item.category)}`}>{item.category}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${statusColor(item.status)}`}>{item.status}</span>
              </div>
              <h4 className="text-[15px] font-bold text-slate-200 group-hover:text-white transition-colors mb-5">{item.title}</h4>
              <div className="grid grid-cols-3 gap-4 text-[12px] p-4 bg-white/[0.02] rounded-xl border border-white/[0.02]">
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Hours</span>
                  <span className="font-extrabold text-white text-[14px]">{item.volunteer_hours}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Funds</span>
                  <span className="font-extrabold text-white text-[14px]">{item.funds_raised}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Part.</span>
                  <div className="flex flex-col gap-1.5 mt-0.5">
                    <span className="font-extrabold text-white text-[14px]">{item.participation_rate}%</span>
                    <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full relative" style={{ width: `${item.participation_rate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#06080f]/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.08] glass-panel-strong p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white">Create CSR Activity</h3>
                <p className="text-[12px] text-slate-400 mt-1">Launch a new program or volunteer initiative</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/[0.05] transition cursor-pointer active:scale-95"><MdClose size={20} /></button>
            </div>
            
            <form onSubmit={handleAddActivity} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Local Tree Planting Drive" className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all">
                    {categories.filter((c: any) => c.type === "csr").map((c: any) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all">
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vol. Hours</label>
                  <input type="number" value={newHours} onChange={e => setNewHours(e.target.value)} placeholder="100" className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Funds</label>
                  <input type="text" value={newFunds} onChange={e => setNewFunds(e.target.value)} placeholder="$2,500" className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Part. %</label>
                  <input type="number" min="0" max="100" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="45" className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all" required />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/[0.06]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-2.5 text-[13px] font-bold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">Launch Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
