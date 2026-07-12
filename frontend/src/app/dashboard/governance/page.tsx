"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { gsap } from "gsap";
import { 
  MdGavel, 
  MdLibraryBooks, 
  MdFactCheck, 
  MdWarningAmber,
  MdCheckCircle,
  MdInfo
} from "react-icons/md";
import { message } from "antd";

interface Audit {
  id: string;
  department: string;
  auditor: string;
  status: "Passed" | "Open" | "Failed";
  score: number;
  date: string;
}

interface ComplianceIssue {
  id: string;
  department: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  status: "Open" | "Resolved";
  due_date: string;
}

export default function GovernancePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch policies from backend
  const { data: policiesData, isLoading: policiesLoading, refetch } = useQuery({
    queryKey: ["policies"],
    queryFn: () => apiService.getPolicies(),
  });

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
      gsap.fromTo(".gov-animate", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [policiesLoading]);

  const handleAcknowledge = (id: string) => {
    if (acknowledgedIds.includes(id)) return;
    
    // Simulate API call
    setAcknowledgedIds([...acknowledgedIds, id]);
    message.success("ESG policy acknowledgement successfully logged.");
  };

  const handleResolveIssue = (id: string) => {
    setComplianceIssues(prev => 
      prev.map(issue => issue.id === id ? { ...issue, status: "Resolved" } : issue)
    );
    message.success("Compliance issue marked as Resolved.");
  };

  if (policiesLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-slate-400 text-sm animate-pulse">Checking policy directories...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Governance & Compliance</h1>
        <p className="text-slate-400 text-sm mt-1">Audit ledgers, ESG policies library, and risk/compliance issue tracking.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="gov-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Policies</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <MdLibraryBooks size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{policiesData?.length || 2}</span>
            <span className="text-slate-500 text-xs font-semibold">published</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Next review scheduled: Oct 2026</p>
        </div>

        <div className="gov-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acknowledgements</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <MdFactCheck size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {policiesData ? Math.round(((acknowledgedIds.length + 1) / (policiesData.length + 1)) * 100) : 50}%
            </span>
            <span className="text-slate-500 text-xs font-semibold">completion rate</span>
          </div>
          <p className="mt-2 text-xs text-indigo-400">Manager & Admin roles verified</p>
        </div>

        <div className="gov-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audits Completed</span>
            <div className="rounded-lg bg-pink-500/10 p-2 text-pink-400">
              <MdGavel size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {audits.filter(a => a.status === "Passed").length} / {audits.length}
            </span>
            <span className="text-slate-500 text-xs font-semibold">passed audit checks</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Avg Audit Score: 91.7%</p>
        </div>

        <div className="gov-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Risks</span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
              <MdWarningAmber size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {complianceIssues.filter(i => i.status === "Open").length}
            </span>
            <span className="text-slate-500 text-xs font-semibold">unresolved issues</span>
          </div>
          <p className="mt-2 text-xs text-rose-400">1 High-severity alert active</p>
        </div>
      </div>

      {/* Main Governance Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Policies Library */}
        <div className="gov-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Active ESG Policies</h3>
          <div className="space-y-4">
            {policiesData?.map((policy) => {
              const isAck = acknowledgedIds.includes(policy.id);
              return (
                <div 
                  key={policy.id} 
                  className="rounded-xl border border-white/5 bg-white/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition hover:bg-white/10"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 mt-0.5">
                      <MdLibraryBooks size={22} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-100">{policy.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">Version: {policy.version} | Status: <span className="text-emerald-400 font-semibold">{policy.status}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcknowledge(policy.id)}
                    disabled={isAck}
                    className={`rounded-lg px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isAck 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default" 
                        : "bg-emerald-500 text-white hover:opacity-90 active:scale-[0.97]"
                    }`}
                  >
                    {isAck ? (
                      <>
                        <MdCheckCircle size={15} />
                        <span>Acknowledged</span>
                      </>
                    ) : (
                      <span>Acknowledge Policy</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audits status checklist */}
        <div className="gov-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Department Audits Log</h3>
          <div className="space-y-4">
            {audits.map((a) => (
              <div 
                key={a.id} 
                className="rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-200">{a.department}</span>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.status === "Passed" ? "bg-emerald-500/10 text-emerald-400" :
                    a.status === "Open" ? "bg-amber-500/10 text-amber-400" :
                    "bg-rose-500/10 text-rose-400"
                  }`}>
                    {a.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>Score: <span className="font-bold text-slate-200">{a.score > 0 ? `${a.score}%` : "Pending"}</span></span>
                  <span>Date: {a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance issues table */}
      <div className="gov-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Compliance & Risk Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3.5 pl-4">Department</th>
                <th className="pb-3.5">Risk Description</th>
                <th className="pb-3.5 text-center">Severity</th>
                <th className="pb-3.5 text-center">Status</th>
                <th className="pb-3.5">Due Date</th>
                <th className="pb-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-200">
              {complianceIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 pl-4">{issue.department}</td>
                  <td className="text-slate-300 font-semibold">{issue.title}</td>
                  <td className="text-center">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      issue.severity === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      issue.severity === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      issue.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400 animate-pulse"
                    }`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="text-slate-400 text-xs">{issue.due_date}</td>
                  <td className="text-right pr-4">
                    {issue.status === "Open" ? (
                      <button
                        onClick={() => handleResolveIssue(issue.id)}
                        className="rounded bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 px-2.5 py-1 text-xs font-semibold transition cursor-pointer"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">No actions required</span>
                    )}
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
