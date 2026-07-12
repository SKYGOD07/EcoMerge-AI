"use client";

import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { gsap } from "gsap";
import { MdAdd, MdVolunteerActivism, MdDiversity3, MdSchool, MdHourglassTop, MdCheckCircle, MdClose, MdPeople, MdArrowForward } from "react-icons/md";
import { message } from "antd";

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
    <div className="bg-[#0c0e16] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold text-white">{p.value}%</p>
      ))}
    </div>
  );
};

export default function SocialPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  const [activities, setActivities] = useState<CSRActivity[]>([
    { id: "1", title: "Global Hunger Charity Run", category: "Community Outreach", volunteer_hours: 320, funds_raised: "$12,500", participation_rate: 68, status: "Completed" },
    { id: "2", title: "Carbon Forestry Volunteering", category: "Environmental", volunteer_hours: 480, funds_raised: "$5,000", participation_rate: 42, status: "In Progress" },
    { id: "3", title: "ESG Compliance Workshop Q3", category: "Education", volunteer_hours: 150, funds_raised: "N/A", participation_rate: 91, status: "Completed" },
    { id: "4", title: "Tech Mentoring for Underrepresented Students", category: "Social Equity", volunteer_hours: 240, funds_raised: "N/A", participation_rate: 25, status: "In Progress" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Community Outreach");
  const [newHours, setNewHours] = useState("");
  const [newFunds, setNewFunds] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newStatus, setNewStatus] = useState<"Completed" | "In Progress" | "Scheduled">("Scheduled");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".social-card", { opacity: 0, y: 25, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" });
      gsap.fromTo(".social-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHours || !newRate) { messageApi.error("Please fill in all required fields"); return; }
    const activity: CSRActivity = { id: (activities.length + 1).toString(), title: newTitle, category: newCategory, volunteer_hours: parseInt(newHours), funds_raised: newFunds || "N/A", participation_rate: parseInt(newRate), status: newStatus };
    setActivities([activity, ...activities]);
    setIsModalOpen(false);
    messageApi.success("CSR activity logged successfully");
    setNewTitle(""); setNewHours(""); setNewFunds(""); setNewRate(""); setNewStatus("Scheduled");
  };

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

  const statusColor = (s: string) => s === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" : s === "In Progress" ? "bg-amber-500/10 text-amber-400 border-amber-500/15" : "bg-slate-500/10 text-slate-400 border-slate-500/15";
  const catColor = (c: string) => c === "Community Outreach" ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/15" : c === "Environmental" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/15" : c === "Education" ? "text-violet-400 bg-violet-500/10 border-violet-500/15" : "text-pink-400 bg-pink-500/10 border-pink-500/15";

  return (
    <div ref={containerRef} className="space-y-6">
      {contextHolder}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-2">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-white leading-tight">Social & CSR</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">Outreach initiatives, diversity metrics, and staff engagement analytics</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="self-start md:self-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-[12px] font-semibold text-white shadow-lg shadow-emerald-500/15 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">
          <MdAdd size={16} /><span>Add Activity</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Volunteer Hours", value: "1,190", sub: "cumulative hours", trend: "+12% QoQ", icon: <MdVolunteerActivism size={16} />, color: "emerald" },
          { label: "Training Rate", value: "93.2%", sub: "avg completion", trend: "Target: 95%", icon: <MdSchool size={16} />, color: "violet" },
          { label: "Diversity Ratio", value: "46/54", sub: "female / male+nb", trend: "GRI compliant", icon: <MdDiversity3 size={16} />, color: "pink" },
          { label: "Active Campaigns", value: "2", sub: "campaigns live", trend: "Forestry & Tech", icon: <MdHourglassTop size={16} />, color: "amber" },
        ].map((k, i) => (
          <div key={i} className={`social-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden transition-all duration-300 hover:border-${k.color}-500/15`}>
            <div className={`absolute top-0 right-0 w-28 h-28 rounded-full bg-${k.color}-500/[0.03] blur-2xl group-hover:bg-${k.color}-500/[0.06] transition-all duration-500`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">{k.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-${k.color}-500/10 text-${k.color}-400`}>{k.icon}</div>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-[32px] font-extrabold text-white leading-none">{k.value}</span>
                <span className="text-slate-600 text-[11px] font-bold mb-1">{k.sub}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 font-medium">{k.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="social-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-3">
          <div className="mb-5">
            <h3 className="text-[13px] font-semibold text-white">Training Completion Rates</h3>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Mandatory ESG module completions by staff</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" radius={[8, 8, 4, 4]} maxBarSize={36}>
                  {trainingData.map((_, i) => (
                    <Cell key={`c-${i}`} fill={i % 2 === 0 ? "#6366f1" : "#10b981"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="social-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-2">
          <h3 className="text-[13px] font-semibold text-white mb-5">Gender Diversity</h3>
          <div className="h-48 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diversityData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={5} dataKey="value" strokeWidth={0}>
                  {diversityData.map((e, i) => <Cell key={`c-${i}`} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2.5">
            {diversityData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-slate-400 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="social-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[13px] font-semibold text-white">CSR & Volunteering Initiatives</h3>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">{activities.length} tracked programs</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activities.map(item => (
            <div key={item.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${catColor(item.category)}`}>{item.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusColor(item.status)}`}>{item.status}</span>
              </div>
              <h4 className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition mb-3">{item.title}</h4>
              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <div><span className="block text-slate-600 text-[9px] uppercase font-bold tracking-wider">Hours</span><span className="font-bold text-slate-300 mt-0.5 block">{item.volunteer_hours}</span></div>
                <div><span className="block text-slate-600 text-[9px] uppercase font-bold tracking-wider">Funds</span><span className="font-bold text-slate-300 mt-0.5 block">{item.funds_raised}</span></div>
                <div>
                  <span className="block text-slate-600 text-[9px] uppercase font-bold tracking-wider">Participation</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-white/[0.04] rounded-full h-1 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.participation_rate}%` }}></div></div>
                    <span className="font-bold text-slate-300 text-[10px]">{item.participation_rate}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0c0e16] p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="text-base font-bold text-white">Create CSR Activity</h3><p className="text-[11px] text-slate-500 mt-0.5">Launch a new program or volunteer initiative</p></div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-1 transition cursor-pointer"><MdClose size={18} /></button>
            </div>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Local Tree Planting Drive" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label><select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white outline-none focus:border-emerald-500/40 transition"><option value="Community Outreach">Community Outreach</option><option value="Environmental">Environmental</option><option value="Education">Education</option><option value="Social Equity">Social Equity</option></select></div>
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label><select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white outline-none focus:border-emerald-500/40 transition"><option value="Scheduled">Scheduled</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Vol. Hours</label><input type="number" value={newHours} onChange={e => setNewHours(e.target.value)} placeholder="100" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" required /></div>
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Funds</label><input type="text" value={newFunds} onChange={e => setNewFunds(e.target.value)} placeholder="$2,500" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" /></div>
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Part. %</label><input type="number" min="0" max="100" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="45" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" required /></div>
              </div>
              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-white/[0.04]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-white/[0.08] px-4 py-2 text-[12px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] transition cursor-pointer">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-[12px] font-semibold text-white hover:brightness-110 transition cursor-pointer">Launch Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
