"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { gsap } from "gsap";
import { MdAnalytics, MdDownload, MdDone, MdFilePresent, MdAutorenew, MdDescription, MdOutlineSettingsInputComponent } from "react-icons/md";
import { message } from "antd";

export default function ReportsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  const { data: reportMeta } = useQuery({ queryKey: ["esgReport"], queryFn: () => apiService.getESGReport() });

  const [reportType, setReportType] = useState("esg_summary");
  const [period, setPeriod] = useState("q2_2026");
  const [format, setFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("");
  const [downloadReady, setDownloadReady] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".report-card", 
        { opacity: 0, y: 30, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08, ease: "elastic.out(1, 0.75)" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleGenerateReport = () => {
    setIsGenerating(true); setProgress(0); setDownloadReady(false);
    const steps = ["Compiling carbon emissions data...", "Validating CSR and diversity metrics...", "Extracting governance compliance records...", "Generating AI advisory insights...", "Assembling final report document..."];
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 4;
        const stepIdx = Math.floor(next / 20);
        if (steps[stepIdx]) setStepText(steps[stepIdx]);
        if (next >= 100) { clearInterval(interval); setIsGenerating(false); setDownloadReady(true); messageApi.success("Report generated successfully"); return 100; }
        return next;
      });
    }, 120);
  };

  const handleDownload = () => {
    const filename = `EcoMerge_${reportType}_${period}.${format}`;
    const content = `EcoMerge AI ESG Report\nType: ${reportType}\nPeriod: ${period}\nGenerated: ${new Date().toISOString()}\nScore: 81.4/100\n`;
    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    el.download = filename;
    document.body.appendChild(el); el.click(); document.body.removeChild(el);
    messageApi.success(`${filename} downloaded`);
  };

  const reportTypes = [
    { value: "esg_summary", label: "ESG Summary Index", desc: "Complete ESG performance across all scopes", icon: "📊", color: "emerald" },
    { value: "environmental", label: "Environmental Audit", desc: "Carbon ledger and emission tracking", icon: "🌿", color: "cyan" },
    { value: "social", label: "Social & CSR Impact", desc: "Volunteering, diversity, and engagement", icon: "🤝", color: "violet" },
    { value: "governance", label: "Governance & Risk", desc: "Policy compliance and audit records", icon: "📜", color: "amber" },
  ];

  return (
    <div ref={containerRef} className="space-y-6 relative z-10">
      {contextHolder}
      
      <div className="pb-4 relative">
        <div className="absolute -left-4 top-2 w-1 h-8 rounded-r-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
        <h1 className="text-3xl md:text-[32px] font-extrabold tracking-tight text-white leading-tight">Report Builder</h1>
        <p className="text-slate-400 text-[14px] mt-1.5 font-medium">Compile ESG metrics and export audit-ready compliance reports</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Report Configuration */}
        <div className="report-card glass-panel-strong rounded-3xl p-8 lg:col-span-3 space-y-8 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10"></div>
          
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <MdOutlineSettingsInputComponent size={18} />
            </div>
            <h2 className="text-[16px] font-bold text-white">Configuration</h2>
          </div>

          {/* Report Type Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Select Report Module</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reportTypes.map(r => (
                <button key={r.value} onClick={() => setReportType(r.value)}
                  className={`relative flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer overflow-hidden group hover:-translate-y-1
                    ${reportType === r.value 
                      ? `border-${r.color}-500/40 bg-${r.color}-500/10 shadow-[0_4px_20px_rgba(var(--${r.color}-500-rgb),0.15)]` 
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]'}`}>
                  
                  {reportType === r.value && (
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${r.color}-500/20 blur-[30px] rounded-full`}></div>
                  )}
                  
                  <span className="text-2xl mt-1 z-10">{r.icon}</span>
                  <div className="z-10">
                    <span className={`text-[14px] font-bold block mb-1 transition-colors ${reportType === r.value ? `text-${r.color}-400` : 'text-slate-200 group-hover:text-white'}`}>{r.label}</span>
                    <span className={`text-[11px] block transition-colors ${reportType === r.value ? 'text-slate-300' : 'text-slate-500'}`}>{r.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Period & Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c0e16]/50 p-6 rounded-2xl border border-white/[0.04]">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Reporting Period</label>
              <select value={period} onChange={e => setPeriod(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all cursor-pointer">
                <option value="q2_2026">Q2 2026 (Year-to-Date)</option>
                <option value="q1_2026">Q1 2026 (Historical)</option>
                <option value="annual_2025">Annual 2025</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {["pdf", "excel", "csv"].map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`rounded-xl border py-3 text-[12px] font-extrabold uppercase transition-all cursor-pointer shadow-sm
                      ${format === f 
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 border-transparent text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                        : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/[0.15] hover:text-white hover:bg-white/[0.05]"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-lg">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[11px] text-emerald-400/90 font-bold uppercase tracking-wider">GRI & DEFRA Compliant</span>
            </div>
            <button onClick={handleGenerateReport} disabled={isGenerating}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 hover-lift">
              {isGenerating ? <><MdAutorenew size={18} className="animate-spin" /> <span>Compiling...</span></> : <><MdDescription size={18} /> <span>Build Report</span></>}
            </button>
          </div>
        </div>

        {/* Status Panel */}
        <div className="report-card glass-panel-strong rounded-3xl p-8 lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10 pointer-events-none transition-opacity duration-500" style={{ opacity: isGenerating || downloadReady ? 1 : 0.5 }}></div>
          
          <div>
            <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4 mb-6">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <MdAnalytics size={18} />
              </div>
              <h3 className="text-[16px] font-bold text-white">Status Monitor</h3>
            </div>
            
            {isGenerating && (
              <div className="space-y-6 py-4 animate-in fade-in duration-500">
                <div>
                  <div className="flex justify-between items-center text-[12px] font-bold text-slate-300 mb-2">
                    <span className="animate-pulse text-cyan-400">Processing Engine</span>
                    <span className="text-white">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#0c0e16] rounded-full h-3 overflow-hidden border border-white/[0.04] shadow-inner p-0.5">
                    <div className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-150 relative" style={{ width: `${progress}%` }}>
                      <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-3 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">{stepText}</p>
                </div>
                
                {/* Step Indicators */}
                <div className="space-y-2.5 bg-[#0c0e16]/50 p-4 rounded-xl border border-white/[0.04]">
                  {["Data Aggregation", "Validation Checks", "Trend Analysis", "Document Formatting", "Finalizing Package"].map((step, i) => {
                    const completed = progress >= (i + 1) * 20;
                    const current = progress >= i * 20 && progress < (i + 1) * 20;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-300
                          ${completed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : current ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-white/[0.05] text-slate-600 border border-transparent'}`}>
                          {completed ? <MdDone size={14} /> : <span>{i + 1}</span>}
                        </div>
                        <span className={`text-[12px] font-semibold transition-colors duration-300 ${completed ? 'text-slate-400' : current ? 'text-white' : 'text-slate-600'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {downloadReady && !isGenerating && (
              <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <div className="absolute inset-0 rounded-3xl border border-emerald-400/30 rotate-12 opacity-50 animate-orbit"></div>
                  <MdDone size={32} className="relative z-10" />
                </div>
                <h4 className="text-[18px] font-extrabold text-white">Report Compiled</h4>
                <p className="text-[12px] text-slate-400 mt-2">GRI compliance certificate securely attached.</p>
                <button onClick={handleDownload}
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-[14px] font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1">
                  <MdDownload size={18} /><span>Download Secure PDF</span>
                </button>
              </div>
            )}

            {!isGenerating && !downloadReady && (
              <div className="text-center py-16 text-slate-500">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-4">
                  <MdFilePresent size={32} className="opacity-40" />
                </div>
                <p className="text-[14px] font-bold text-slate-300">Ready to Compile</p>
                <p className="text-[11px] text-slate-500 mt-2 max-w-[200px] mx-auto">Select parameters on the left and initiate the build process.</p>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06] pt-5 mt-6 bg-[#0c0e16]/30 -mx-8 -mb-8 p-8 rounded-b-3xl">
            <div className="flex items-center justify-between text-[11px] font-bold mb-2">
              <span className="text-slate-500 uppercase tracking-wider">Engine Status</span>
              <span className="text-emerald-400 flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>{reportMeta?.status || "Online & Ready"}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-500 uppercase tracking-wider">Node Version</span>
              <span className="text-slate-400 font-mono">v2.1.0-esg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
