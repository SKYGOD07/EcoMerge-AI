"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { gsap } from "gsap";
import { 
  MdAdd, 
  MdCheckCircle, 
  MdFilterAlt,
  MdClose,
  MdTrendingDown,
  MdArrowDownward,
  MdFactory,
  MdElectricBolt,
  MdDirectionsCar,
  MdDescription,
  MdAutorenew
} from "react-icons/md";
import { message } from "antd";

interface CarbonEntry {
  id: string;
  department: string;
  activity_type: string;
  scope: string;
  quantity: number;
  unit: string;
  emission_factor: number;
  kgco2e: number;
  date: string;
  evidence: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0e16]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold drop-shadow-md" style={{ color: p.color || '#fff' }}>
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          <span className="text-slate-500 text-xs ml-1 font-medium">{p.name || ''}</span>
        </p>
      ))}
    </div>
  );
};

export default function EnvironmentalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  const queryClient = useQueryClient();

  const { data: carbon, isLoading } = useQuery({
    queryKey: ["carbonSummary"],
    queryFn: () => apiService.getCarbonSummary(),
  });

  const { data: dbEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["carbonEntries"],
    queryFn: () => apiService.getCarbonEntries(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiService.getDepartments(),
  });

  const deptList = Array.isArray(departments) ? departments : [];
  const entriesList = Array.isArray(dbEntries) ? dbEntries : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterScope, setFilterScope] = useState("All");
  const [newDept, setNewDept] = useState("Operations");
  const [newActivity, setNewActivity] = useState("");
  const [newScope, setNewScope] = useState("Scope 1");
  const [newQty, setNewQty] = useState("");
  const [newUnit, setNewUnit] = useState("kWh");
  const [newFactor, setNewFactor] = useState("");
  const [newEvidence, setNewEvidence] = useState("");

  useEffect(() => {
    if (deptList.length > 0 && !newDept) {
      setNewDept(deptList[0].name);
    }
  }, [deptList, newDept]);

  useEffect(() => {
    if (!isLoading && !entriesLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".env-card", 
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08, ease: "elastic.out(1, 0.75)" }
        );
        gsap.fromTo(".env-section",
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );

        gsap.utils.toArray('.kpi-icon-wrap').forEach((el: any) => {
          gsap.to(el, {
            y: -3,
            duration: 2 + Math.random(),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        });

      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, entriesLoading]);

  if (isLoading || entriesLoading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-50 blur-sm"></div>
          <div className="h-16 w-16 rounded-2xl border border-white/10 glass-panel flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400"></div>
          </div>
        </div>
        <p className="text-emerald-400/80 text-xs font-bold mt-6 tracking-widest uppercase animate-pulse">Calculating Emissions...</p>
      </div>
    );
  }

  const getScope = (activity: string) => {
    if (["Diesel Fuel", "Fleet Petrol", "Diesel Generator"].includes(activity)) return "Scope 1";
    if (activity === "Grid Electricity" || activity === "Electricity Grid" || activity === "Electricity Grid Factor") return "Scope 2";
    return "Scope 3";
  };



  const mappedEntries = entriesList.map((e: any) => {
    const dept = deptList.find((d: any) => d.id === e.department_id);
    return {
      id: e.id,
      department: dept ? dept.name : "Operations",
      activity_type: e.activity_type,
      scope: getScope(e.activity_type),
      quantity: e.quantity,
      unit: e.unit,
      emission_factor: e.emission_factor,
      kgco2e: e.kgco2e,
      date: e.created_at ? e.created_at.split("T")[0] : "",
      evidence: e.evidence_url || "N/A"
    };
  });

  const addEntryMutation = useMutation({
    mutationFn: (newEntry: any) => apiService.createCarbonEntry(newEntry),
    onSuccess: () => {
      messageApi.success("Carbon entry logged successfully");
      queryClient.invalidateQueries({ queryKey: ["carbonEntries"] });
      queryClient.invalidateQueries({ queryKey: ["carbonSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] });
      setIsModalOpen(false);
      setNewActivity("");
      setNewQty("");
      setNewFactor("");
      setNewEvidence("");
    },
    onError: (err: any) => {
      messageApi.error(`Error logging carbon entry: ${err.message}`);
    }
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity || !newQty || !newFactor) {
      messageApi.error("Please fill in all required fields");
      return;
    }

    const deptObj = deptList.find((d: any) => d.name === newDept);

    addEntryMutation.mutate({
      activity_type: newActivity,
      quantity: parseFloat(newQty),
      unit: newUnit,
      emission_factor: parseFloat(newFactor),
      evidence_url: newEvidence || "receipt_pending.pdf",
      department_id: deptObj ? deptObj.id : undefined,
    });
  };

  const filteredEntries = filterScope === "All" ? mappedEntries : mappedEntries.filter(e => e.scope === filterScope);

  const scopeData = [
    { name: "Scope 1", value: carbon?.scope_1 || 320.4, color: "#10b981" },
    { name: "Scope 2", value: carbon?.scope_2 || 410.8, color: "#06b6d4" },
    { name: "Scope 3", value: carbon?.scope_3 || 549.3, color: "#8b5cf6" },
  ];

  const totalEmissions = carbon?.total_kgco2e || 1280.5;

  const scopeIcons: Record<string, React.ReactNode> = {
    "Scope 1": <MdFactory size={16} />,
    "Scope 2": <MdElectricBolt size={16} />,
    "Scope 3": <MdDirectionsCar size={16} />,
  };

  const getScopeGradient = (scopeName: string) => {
    if (scopeName === "Scope 1") return "from-emerald-500 to-emerald-400";
    if (scopeName === "Scope 2") return "from-cyan-500 to-cyan-400";
    if (scopeName === "Scope 3") return "from-violet-500 to-fuchsia-400";
    return "from-slate-500 to-slate-400";
  };

  const getScopeBg = (scopeName: string) => {
    if (scopeName === "Scope 1") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (scopeName === "Scope 2") return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    if (scopeName === "Scope 3") return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  return (
    <div ref={containerRef} className="space-y-6 relative z-10">
      {contextHolder}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4">
        <div className="relative">
          <div className="absolute -left-4 top-2 w-1 h-8 rounded-r-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <h1 className="text-3xl md:text-[32px] font-extrabold tracking-tight text-white leading-tight">
            Environmental
          </h1>
          <p className="text-slate-400 text-[14px] mt-1.5 font-medium">
            Carbon accounting across Scope 1, 2, 3 with audit-ready tracking
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer hover-lift group"
        >
          <MdAdd size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Log Carbon Entry</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Emissions */}
        <div className="env-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-emerald-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/10 blur-[50px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Emissions</span>
            <div className="mt-4 flex items-end gap-1.5">
              <span className="text-[38px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">{totalEmissions.toLocaleString()}</span>
              <span className="text-slate-500 text-sm font-bold mb-1.5">kgCO2e</span>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 w-max">
              <MdTrendingDown size={14} className="text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400">-8.3% vs prior cycle</span>
            </div>
          </div>
        </div>

        {/* Scope Cards */}
        {scopeData.map((s, i) => {
          const colorBase = s.name === "Scope 1" ? "emerald" : s.name === "Scope 2" ? "cyan" : "violet";
          return (
            <div key={s.name} className={`env-card group glass-panel-strong rounded-3xl p-6 relative overflow-hidden hover-lift hover:border-${colorBase}-500/30`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-${colorBase}-500/10 blur-[50px] group-hover:bg-${colorBase}-500/20 transition-all duration-700`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{s.name}</span>
                  <div className={`kpi-icon-wrap relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-${colorBase}-500/20 to-${colorBase}-500/5 text-${colorBase}-400 border border-${colorBase}-500/20 shadow-[0_0_10px_rgba(var(--${colorBase}-500-rgb),0.2)]`}>
                    {scopeIcons[s.name]}
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-[32px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tight">{s.value.toLocaleString()}</span>
                  <span className="text-slate-500 text-[11px] font-bold mb-1.5">kgCO2e</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 bg-white/[0.04] rounded-full h-2 overflow-hidden shadow-inner">
                    <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${(s.value / totalEmissions) * 100}%`, backgroundColor: s.color }}>
                      <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">{((s.value / totalEmissions) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Scope breakdown donut */}
        <div className="env-section glass-panel-strong rounded-3xl p-6 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/[0.02] rounded-full blur-[40px] -z-10 group-hover:bg-white/[0.04] transition-colors duration-1000"></div>
          
          <h3 className="text-[15px] font-bold text-white mb-6">Scope Contribution</h3>
          <div className="h-56 flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={scopeData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={90} 
                  paddingAngle={6} 
                  dataKey="value" 
                  strokeWidth={0}
                  cornerRadius={6}
                >
                  {scopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-[20px] font-extrabold text-white">100%</span>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {scopeData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[12px] p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}66` }}></div>
                  <span className="text-slate-300 font-semibold">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{s.value.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-bold bg-white/[0.04] px-2 py-0.5 rounded-md">{((s.value / totalEmissions) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dept scope allocation stacked bar */}
        <div className="env-section glass-panel-strong rounded-3xl p-6 lg:col-span-3 relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-bold text-white">Department Allocation</h3>
              <p className="text-[12px] text-slate-400 font-medium mt-1">Scope breakdown across business units</p>
            </div>
            <button className="text-slate-500 hover:text-white p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] transition-colors">
              <MdAutorenew size={16} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Operations", Scope1: 180, Scope2: 240, Scope3: 190 },
                  { name: "Admin", Scope1: 60, Scope2: 120, Scope3: 130 },
                  { name: "People", Scope1: 80.4, Scope2: 50.8, Scope3: 229.3 },
                  { name: "Logistics", Scope1: 140, Scope2: 95, Scope3: 180 },
                ]}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="Scope1" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Scope2" stackId="a" fill="#06b6d4" />
                <Bar dataKey="Scope3" stackId="a" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Carbon Ledger Table */}
      <div className="env-section glass-panel-strong rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-[15px] font-bold text-white">Carbon Ledger</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">Transaction-level emissions database</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <MdFilterAlt size={14} />
              <span className="font-bold uppercase tracking-wider">Filter:</span>
            </div>
            <div className="flex gap-1.5 p-1 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              {["All", "Scope 1", "Scope 2", "Scope 3"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterScope(s)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer
                    ${filterScope === s 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'}
                  `}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.04] bg-[#0c0e16]/50">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="py-4 pl-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity</th>
                <th className="py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scope</th>
                <th className="py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</th>
                <th className="py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-4">kgCO2e</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-4 pl-4 text-slate-500 font-medium whitespace-nowrap">{e.date}</td>
                  <td className="py-4 text-slate-300 font-semibold">{e.department}</td>
                  <td className="py-4 text-slate-200 font-bold">{e.activity_type}</td>
                  <td className="py-4 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[80px] text-[10px] font-bold px-2.5 py-1 rounded-lg border ${getScopeBg(e.scope)} shadow-sm`}>
                      {e.scope}
                    </span>
                  </td>
                  <td className="py-4 text-right text-slate-400 font-medium">
                    {e.quantity.toLocaleString()} <span className="text-[10px] uppercase font-bold text-slate-600 ml-0.5">{e.unit}</span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <span className="font-bold text-white bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.04]">
                      {e.kgco2e.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    No carbon entries found for this scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#06080f]/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.08] glass-panel-strong p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white">Log Carbon Entry</h3>
                <p className="text-[12px] text-slate-400 mt-1">Add a verified emission record to the ERP ledger</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/[0.05] transition cursor-pointer active:scale-95">
                <MdClose size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEntry} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                  <select value={newDept} onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all">
                    {deptList.map((d: any) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Scope Class</label>
                  <select value={newScope} onChange={(e) => setNewScope(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all">
                    <option value="Scope 1">Scope 1 - Direct</option>
                    <option value="Scope 2">Scope 2 - Indirect</option>
                    <option value="Scope 3">Scope 3 - Supply Chain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Activity</label>
                <input type="text" value={newActivity} onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="e.g. Flight travel LHR to JFK"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
                  <input type="number" step="any" value={newQty} onChange={(e) => setNewQty(e.target.value)}
                    placeholder="1200" className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Unit</label>
                  <input type="text" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="km" className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Emission Factor</label>
                  <input type="number" step="any" value={newFactor} onChange={(e) => setNewFactor(e.target.value)}
                    placeholder="0.18" className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Evidence</label>
                  <input type="text" value={newEvidence} onChange={(e) => setNewEvidence(e.target.value)}
                    placeholder="receipt.pdf" className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e16]/80 px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/[0.06]">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-2.5 text-[13px] font-bold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
