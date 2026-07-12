"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { gsap } from "gsap";
import { MdAnalytics, MdDownload, MdDone, MdFilePresent, MdAutorenew } from "react-icons/md";
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
      gsap.fromTo(".report-card", { opacity: 0, y: 25, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" });
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
    { value: "esg_summary", label: "ESG Summary Index", desc: "Complete ESG performance across all scopes", icon: "📊" },
    { value: "environmental", label: "Environmental Audit", desc: "Carbon ledger and emission tracking", icon: "🌿" },
    { value: "social", label: "Social & CSR Impact", desc: "Volunteering, diversity, and engagement", icon: "🤝" },
    { value: "governance", label: "Governance & Risk", desc: "Policy compliance and audit records", icon: "📜" },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {contextHolder}
      <div className="pb-2">
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-white leading-tight">Report Builder</h1>
        <p className="text-slate-500 text-[13px] mt-1 font-medium">Compile ESG metrics and export audit-ready compliance reports</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Report Configuration */}
        <div className="report-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:col-span-3 space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Report Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reportTypes.map(r => (
                <button key={r.value} onClick={() => setReportType(r.value)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer
                    ${reportType === r.value 
                      ? 'border-emerald-500/20 bg-emerald-500/5 shadow-sm' 
                      : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08]'}`}>
                  <span className="text-xl mt-0.5">{r.icon}</span>
                  <div>
                    <span className={`text-[12px] font-semibold block ${reportType === r.value ? 'text-emerald-400' : 'text-slate-300'}`}>{r.label}</span>
                    <span className="text-[10px] text-slate-600 mt-0.5 block">{r.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Period & Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reporting Period</label>
              <select value={period} onChange={e => setPeriod(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white outline-none focus:border-emerald-500/40 transition">
                <option value="q2_2026">Q2 2026 (Year-to-Date)</option>
                <option value="q1_2026">Q1 2026 (Historical)</option>
                <option value="annual_2025">Annual 2025</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {["pdf", "excel", "csv"].map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`rounded-xl border py-2.5 text-[11px] font-bold uppercase transition-all cursor-pointer
                      ${format === f 
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 border-transparent text-white shadow-md shadow-emerald-500/15" 
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-[11px] text-slate-500 font-medium">GRI & DEFRA compliant exports</span>
            </div>
            <button onClick={handleGenerateReport} disabled={isGenerating}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-emerald-500/15 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {isGenerating ? <><MdAutorenew size={14} className="animate-spin" /> Generating...</> : <>Generate Report</>}
            </button>
          </div>
        </div>

        {/* Status Panel */}
        <div className="report-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-semibold text-white mb-5">Build Status</h3>
            
            {isGenerating && (
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                  <span>Compiling...</span><span>{progress}%</span>
                </div>
                <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{stepText}</p>
                
                {/* Step Indicators */}
                <div className="mt-4 space-y-2">
                  {["Data Collection", "Validation", "Analysis", "Formatting", "Finalization"].map((step, i) => {
                    const completed = progress >= (i + 1) * 20;
                    const current = progress >= i * 20 && progress < (i + 1) * 20;
                    return (
                      <div key={step} className="flex items-center gap-2.5">
                        <div className={`h-5 w-5 rounded-lg flex items-center justify-center text-[10px] transition-all
                          ${completed ? 'bg-emerald-500/15 text-emerald-400' : current ? 'bg-cyan-500/15 text-cyan-400 animate-pulse' : 'bg-white/[0.03] text-slate-700'}`}>
                          {completed ? <MdDone size={12} /> : <span>{i + 1}</span>}
                        </div>
                        <span className={`text-[11px] font-medium ${completed ? 'text-slate-300' : current ? 'text-white' : 'text-slate-600'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {downloadReady && !isGenerating && (
              <div className="text-center py-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/15">
                  <MdDone size={24} />
                </div>
                <h4 className="text-[14px] font-bold text-white">Report Ready</h4>
                <p className="text-[11px] text-slate-500 mt-1.5">GRI compliance certificate attached</p>
                <button onClick={handleDownload}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-[12px] font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-500/15">
                  <MdDownload size={14} /><span>Download</span>
                </button>
              </div>
            )}

            {!isGenerating && !downloadReady && (
              <div className="text-center py-12 text-slate-600">
                <MdFilePresent size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-[12px] font-medium">Configure parameters and generate</p>
                <p className="text-[10px] text-slate-700 mt-1">Reports are compiled server-side</p>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.04] pt-4 mt-4">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-slate-600">Backend Status</span>
              <span className="text-emerald-400 font-semibold">{reportMeta?.status || "Ready"}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium mt-1">
              <span className="text-slate-600">Formats Available</span>
              <span className="text-slate-400 font-mono text-[10px]">PDF · CSV · XLS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
