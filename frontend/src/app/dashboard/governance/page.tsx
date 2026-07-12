"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { gsap } from "gsap";
import { MdGavel, MdLibraryBooks, MdFactCheck, MdWarningAmber, MdCheckCircle, MdShield, MdArrowForward } from "react-icons/md";
import { message } from "antd";

interface Audit { id: string; department: string; auditor: string; status: "Passed" | "Open" | "Failed"; score: number; date: string; }
interface ComplianceIssue { id: string; department: string; title: string; severity: "High" | "Medium" | "Low"; status: "Open" | "Resolved"; due_date: string; }

export default function GovernancePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { data: policiesData, isLoading: policiesLoading } = useQuery({ queryKey: ["policies"], queryFn: () => apiService.getPolicies() });
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);

  const [audits] = useState<Audit[]>([
    { id: "a1", department: "Administration", auditor: "auditor@ecosphere.local", status: "Passed", score: 94.5, date: "2026-06-28" },
    { id: "a2", department: "Operations", auditor: "auditor@ecosphere.local", status: "Open", score: 0, date: "2026-07-11" },
    { id: "a3", department: "People", auditor: "auditor@ecosphere.local", status: "Passed", score: 89.0, date: "2026-06-15" },
  ]);

  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([
    { id: "c1", department: "Operations", title: "Unreported Scope 1 refrigerant refills", severity: "High", status: "Open", due_date: "2026-07-20" },
    { id: "c2", department: "Administration", title: "Missing travel evidence receipts", severity: "Low", status: "Open", due_date: "2026-07-25" },
    { id: "c3", department: "People", title: "Incomplete ESG code acknowledgement audits", severity: "Medium", status: "Resolved", due_date: "2026-07-02" },
  ]);

  useEffect(() => {
    if (!policiesLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".gov-card", { opacity: 0, y: 25, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" });
        gsap.fromTo(".gov-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.3 });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [policiesLoading]);

  const handleAcknowledge = (id: string) => { if (acknowledgedIds.includes(id)) return; setAcknowledgedIds([...acknowledgedIds, id]); messageApi.success("Policy acknowledged successfully"); };
  const handleResolveIssue = (id: string) => { setComplianceIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status: "Resolved" } : issue)); messageApi.success("Issue marked as resolved"); };

  if (policiesLoading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <div className="h-14 w-14 rounded-2xl border-2 border-white/5 bg-white/[0.02] flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div></div>
        <p className="text-slate-600 text-xs font-medium mt-5 tracking-wider uppercase">Loading policies...</p>
      </div>
    );
  }

  const sevColor = (s: string) => s === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/15" : s === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/15" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/15";
  const auditColor = (s: string) => s === "Passed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" : s === "Open" ? "bg-amber-500/10 text-amber-400 border-amber-500/15" : "bg-rose-500/10 text-rose-400 border-rose-500/15";

  return (
    <div ref={containerRef} className="space-y-6">
      {contextHolder}
      <div className="pb-2">
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-white leading-tight">Governance & Compliance</h1>
        <p className="text-slate-500 text-[13px] mt-1 font-medium">Audit records, ESG policy library, and risk/compliance management</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Policies", value: policiesData?.length || 3, sub: "published", icon: <MdLibraryBooks size={16} />, color: "emerald", extra: "Next review: Oct 2026" },
          { label: "Acknowledged", value: `${policiesData ? Math.round(((acknowledgedIds.length + 1) / (policiesData.length + 1)) * 100) : 50}%`, sub: "completion", icon: <MdFactCheck size={16} />, color: "violet", extra: "All roles verified" },
          { label: "Audits Passed", value: `${audits.filter(a => a.status === "Passed").length}/${audits.length}`, sub: "audit checks", icon: <MdShield size={16} />, color: "cyan", extra: "Avg: 91.7%" },
          { label: "Compliance Risks", value: complianceIssues.filter(i => i.status === "Open").length, sub: "unresolved", icon: <MdWarningAmber size={16} />, color: "rose", extra: "1 high-severity active" },
        ].map((k, i) => (
          <div key={i} className="gov-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden transition-all duration-300 hover:border-white/10">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">{k.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-${k.color}-500/10 text-${k.color}-400`}>{k.icon}</div>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-[32px] font-extrabold text-white leading-none">{k.value}</span>
                <span className="text-slate-600 text-[11px] font-bold mb-1">{k.sub}</span>
              </div>
              <p className={`mt-2 text-[11px] font-medium ${k.color === 'rose' ? 'text-rose-400/80' : 'text-slate-500'}`}>{k.extra}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Policies & Audits */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Policies */}
        <div className="gov-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-3">
          <div className="mb-5">
            <h3 className="text-[13px] font-semibold text-white">Active ESG Policies</h3>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Review and acknowledge compliance documents</p>
          </div>
          <div className="space-y-3">
            {policiesData?.map(policy => {
              const isAck = acknowledgedIds.includes(policy.id);
              return (
                <div key={policy.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all hover:bg-white/[0.04] hover:border-white/[0.08] group">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0"><MdLibraryBooks size={18} /></div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition">{policy.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Version: {policy.version} · Status: <span className="text-emerald-400 font-semibold">{policy.status}</span></p>
                    </div>
                  </div>
                  <button onClick={() => handleAcknowledge(policy.id)} disabled={isAck}
                    className={`rounded-xl px-4 py-2 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${isAck ? "bg-emerald-500/8 text-emerald-400 border border-emerald-500/15 cursor-default" : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:brightness-110 active:scale-[0.97]"}`}>
                    {isAck ? <><MdCheckCircle size={13} /><span>Acknowledged</span></> : <span>Acknowledge</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audits */}
        <div className="gov-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-2">
          <h3 className="text-[13px] font-semibold text-white mb-5">Department Audits</h3>
          <div className="space-y-3">
            {audits.map(a => (
              <div key={a.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-slate-200">{a.department}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${auditColor(a.status)}`}>{a.status}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Score: <span className="font-bold text-slate-300">{a.score > 0 ? `${a.score}%` : "Pending"}</span></span>
                  <span className="font-medium">{a.date}</span>
                </div>
                {a.score > 0 && (
                  <div className="mt-2 w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${a.score}%` }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="gov-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-5">
          <h3 className="text-[13px] font-semibold text-white">Compliance & Risk Registry</h3>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">Track and resolve outstanding compliance issues</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.04] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 pl-3">Department</th><th className="pb-3">Risk</th><th className="pb-3 text-center">Severity</th><th className="pb-3 text-center">Status</th><th className="pb-3">Due</th><th className="pb-3 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {complianceIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3.5 pl-3 text-slate-300 font-medium">{issue.department}</td>
                  <td className="text-slate-200 font-semibold">{issue.title}</td>
                  <td className="text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${sevColor(issue.severity)}`}>{issue.severity}</span></td>
                  <td className="text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${issue.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" : "bg-rose-500/10 text-rose-400 border-rose-500/15"}`}>{issue.status}</span></td>
                  <td className="text-slate-500 text-[11px] font-medium">{issue.due_date}</td>
                  <td className="text-right pr-3">
                    {issue.status === "Open" ? (
                      <button onClick={() => handleResolveIssue(issue.id)} className="rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/20 hover:bg-emerald-500/8 hover:text-emerald-400 px-3 py-1 text-[11px] font-semibold transition cursor-pointer text-slate-400">Resolve</button>
                    ) : <span className="text-[11px] text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
