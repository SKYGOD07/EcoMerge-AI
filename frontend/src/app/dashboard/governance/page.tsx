"use client";

import React, { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { gsap } from "gsap";
import { MdGavel, MdPolicy, MdSecurity, MdWarning, MdCheckCircle, MdOutlineFileDownload, MdAutorenew } from "react-icons/md";
import { message } from "antd";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0e16]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label || payload[0].name}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold drop-shadow-md" style={{ color: p.color || '#fff' }}>
          {p.value}%
        </p>
      ))}
    </div>
  );
};

export default function GovernancePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [policies] = useState([
    { id: 1, name: "Anti-Bribery & Corruption Policy", lastUpdated: "2026-06-15", status: "Active", compliance: 98 },
    { id: 2, name: "Data Privacy & Security Framework", lastUpdated: "2026-05-20", status: "Review Required", compliance: 82 },
    { id: 3, name: "Supplier Code of Conduct", lastUpdated: "2026-01-10", status: "Active", compliance: 95 },
    { id: 4, name: "Whistleblower Protection", lastUpdated: "2025-11-05", status: "Active", compliance: 100 },
  ]);

  const [audits] = useState([
    { id: "A-2026-01", type: "Internal", area: "Data Security", date: "2026-04-12", result: "Pass", severity: "Low" },
    { id: "A-2026-02", type: "External (ISO 27001)", area: "InfoSec", date: "2026-05-18", result: "Conditional Pass", severity: "Medium" },
    { id: "A-2026-03", type: "Internal", area: "ESG Reporting", date: "2026-07-02", result: "Pending", severity: "High" },
  ]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".gov-card", 
        { opacity: 0, y: 30, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08, ease: "elastic.out(1, 0.75)" }
      );
      gsap.fromTo(".gov-section", 
        { opacity: 0, y: 25 }, 
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2 }
      );
      gsap.utils.toArray('.kpi-icon-wrap').forEach((el: any) => {
        gsap.to(el, { y: -3, duration: 2 + Math.random(), yoyo: true, repeat: -1, ease: "sine.inOut" });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const riskData = [
    { name: "Low Risk", value: 65, color: "#10b981" },
    { name: "Medium Risk", value: 25, color: "#f59e0b" },
    { name: "High Risk", value: 10, color: "#f43f5e" },
  ];

  return (
    <div ref={containerRef} className="space-y-6 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4">
        <div className="relative">
          <div className="absolute -left-4 top-2 w-1 h-8 rounded-r-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <h1 className="text-3xl md:text-[32px] font-extrabold tracking-tight text-white leading-tight">Governance & Risk</h1>
          <p className="text-slate-400 text-[14px] mt-1.5 font-medium">Policy compliance, audit logs, and risk management oversight</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 px-4 py-2.5 text-[12px] font-bold text-slate-200 transition-all duration-300 hover-lift">
            <MdAutorenew size={16} />
            <span>Sync ERP</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer hover-lift group">
            <MdPolicy size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <span>New Policy</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Policy Compliance", value: "92.4%", sub: "average across org", status: "Good", icon: <MdCheckCircle size={22} />, color: "emerald" },
          { label: "Active Audits", value: "3", sub: "1 internal, 2 external", status: "Pending", icon: <MdSecurity size={22} />, color: "cyan" },
          { label: "Risk Incidents", value: "1", sub: "high severity unassigned", status: "Critical", icon: <MdWarning size={22} />, color: "amber" },
        ].map((k, i) => (
          <div key={i} className={`gov-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-${k.color}-500/30`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-${k.color}-500/10 blur-[50px] group-hover:bg-${k.color}-500/20 transition-all duration-700`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{k.label}</span>
                <div className={`kpi-icon-wrap flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-${k.color}-500/20 to-${k.color}-500/5 text-${k.color}-400 border border-${k.color}-500/20 shadow-[0_0_15px_rgba(var(--${k.color}-500-rgb),0.2)]`}>
                  {k.icon}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-[42px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">{k.value}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[12px] text-slate-500 font-medium">{k.sub}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-${k.color}-500/10 text-${k.color}-400 border border-${k.color}-500/20`}>
                  {k.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policies List */}
        <div className="gov-section glass-panel-strong rounded-3xl p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-white">Active Policies & Frameworks</h3>
              <p className="text-[12px] text-slate-400 font-medium mt-1">Status of required organizational guidelines</p>
            </div>
            <button className="text-[12px] font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
              View Directory
            </button>
          </div>
          
          <div className="space-y-3">
            {policies.map(p => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-3 sm:mb-0">
                  <div className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center text-[16px] border shadow-sm
                    ${p.compliance > 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    <MdGavel />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-200 group-hover:text-white transition-colors">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Last updated: {p.lastUpdated}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 bg-[#0c0e16]/50 px-4 py-2 rounded-xl border border-white/[0.02]">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Compliance</span>
                    <span className={`text-[14px] font-extrabold ${p.compliance > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{p.compliance}%</span>
                  </div>
                  <div className="h-8 w-px bg-white/[0.06]"></div>
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Status</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Profile & Audits */}
        <div className="space-y-6 lg:col-span-1">
          {/* Risk Profile */}
          <div className="gov-section glass-panel-strong rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-rose-500/5 rounded-full blur-[50px] -z-10 group-hover:bg-rose-500/10 transition-colors duration-1000"></div>
            
            <h3 className="text-[15px] font-bold text-white mb-2">Enterprise Risk Profile</h3>
            <p className="text-[12px] text-slate-400 font-medium mb-6">Identified vulnerabilities by severity</p>
            
            <div className="h-44 flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" strokeWidth={0} cornerRadius={4}>
                    {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <MdSecurity size={24} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* Recent Audits */}
          <div className="gov-section glass-panel-strong rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-[15px] font-bold text-white mb-4">Audit Schedule</h3>
            <div className="space-y-3">
              {audits.map(a => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[12px] font-bold text-slate-200">{a.area}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      a.severity === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      a.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>{a.result}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>{a.type}</span>
                    <span className="bg-[#0c0e16] px-2 py-0.5 rounded border border-white/[0.04]">{a.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-[12px] font-bold text-slate-300 transition-colors flex justify-center items-center gap-2">
              <MdOutlineFileDownload size={16} />
              Export Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
