"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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
  MdDescription
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
    <div className="bg-[#0c0e16] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || '#fff' }}>
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          <span className="text-slate-500 text-xs ml-1">{p.name || ''}</span>
        </p>
      ))}
    </div>
  );
};

export default function EnvironmentalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  const { data: carbon, isLoading } = useQuery({
    queryKey: ["carbonSummary"],
    queryFn: () => apiService.getCarbonSummary(),
  });

  const [entries, setEntries] = useState<CarbonEntry[]>([
    { id: "1", department: "Operations", activity_type: "Diesel Generator", scope: "Scope 1", quantity: 850, unit: "litres", emission_factor: 2.68, kgco2e: 2278.0, date: "2026-07-10", evidence: "invoice_2024_03.pdf" },
    { id: "2", department: "Administration", activity_type: "Grid Electricity", scope: "Scope 2", quantity: 4200, unit: "kWh", emission_factor: 0.85, kgco2e: 3570.0, date: "2026-07-09", evidence: "utility_bill_admin.pdf" },
    { id: "3", department: "Operations", activity_type: "Employee Commute", scope: "Scope 3", quantity: 12400, unit: "km", emission_factor: 0.18, kgco2e: 2232.0, date: "2026-07-08", evidence: "commute_survey.xlsx" },
    { id: "4", department: "People", activity_type: "Office Paper", scope: "Scope 3", quantity: 120, unit: "kg", emission_factor: 0.95, kgco2e: 114.0, date: "2026-07-05", evidence: "paper_receipt.pdf" },
    { id: "5", department: "Operations", activity_type: "Natural Gas Heating", scope: "Scope 1", quantity: 620, unit: "m³", emission_factor: 2.03, kgco2e: 1258.6, date: "2026-07-01", evidence: "gas_bill_q2.pdf" },
  ]);

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
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".env-card", 
          { opacity: 0, y: 25, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" }
        );
        gsap.fromTo(".env-section",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.3 }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <div className="h-14 w-14 rounded-2xl border-2 border-white/5 bg-white/[0.02] flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
        <p className="text-slate-600 text-xs font-medium mt-5 tracking-wider uppercase">Calculating emissions...</p>
      </div>
    );
  }

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity || !newQty || !newFactor) {
      messageApi.error("Please fill in all required fields");
      return;
    }

    const qty = parseFloat(newQty);
    const factor = parseFloat(newFactor);
    const kg = qty * factor;

    const entry: CarbonEntry = {
      id: (entries.length + 1).toString(),
      department: newDept,
      activity_type: newActivity,
      scope: newScope,
      quantity: qty,
      unit: newUnit,
      emission_factor: factor,
      kgco2e: parseFloat(kg.toFixed(1)),
      date: new Date().toISOString().split("T")[0],
      evidence: newEvidence || "receipt_pending.pdf"
    };

    setEntries([entry, ...entries]);
    setIsModalOpen(false);
    messageApi.success("Carbon entry logged successfully");
    setNewActivity("");
    setNewQty("");
    setNewFactor("");
    setNewEvidence("");
  };

  const filteredEntries = filterScope === "All" ? entries : entries.filter(e => e.scope === filterScope);

  const scopeData = [
    { name: "Scope 1", value: carbon?.scope_1 || 320.4, color: "#10b981" },
    { name: "Scope 2", value: carbon?.scope_2 || 410.8, color: "#06b6d4" },
    { name: "Scope 3", value: carbon?.scope_3 || 549.3, color: "#8b5cf6" },
  ];

  const totalEmissions = carbon?.total_kgco2e || 1280.5;

  const scopeIcons: Record<string, React.ReactNode> = {
    "Scope 1": <MdFactory size={14} />,
    "Scope 2": <MdElectricBolt size={14} />,
    "Scope 3": <MdDirectionsCar size={14} />,
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {contextHolder}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-2">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-white leading-tight">Environmental Ledger</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">Carbon accounting across Scope 1, 2, 3 with audit-ready tracking</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-[12px] font-semibold text-white shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <MdAdd size={16} />
          <span>Log Carbon Entry</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Emissions */}
        <div className="env-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden transition-all duration-300 hover:border-emerald-500/15">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-emerald-500/[0.03] blur-2xl group-hover:bg-emerald-500/[0.06] transition-all duration-500"></div>
          <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">Total Emissions</span>
          <div className="mt-3 flex items-end gap-1.5">
            <span className="text-[32px] font-extrabold text-white leading-none">{totalEmissions.toLocaleString()}</span>
            <span className="text-slate-600 text-[11px] font-bold mb-1">kgCO2e</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-400">
            <MdTrendingDown size={13} />
            <span className="text-[11px] font-bold">-8.3% vs prior cycle</span>
          </div>
        </div>

        {/* Scope Cards */}
        {scopeData.map((s, i) => (
          <div key={s.name} className={`env-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden transition-all duration-300 hover:border-white/10`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">{s.name}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                {scopeIcons[s.name]}
              </div>
            </div>
            <div className="mt-3 flex items-end gap-1.5">
              <span className="text-[32px] font-extrabold text-white leading-none">{s.value.toLocaleString()}</span>
              <span className="text-slate-600 text-[11px] font-bold mb-1">kgCO2e</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(s.value / totalEmissions) * 100}%`, backgroundColor: s.color }}></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500">{((s.value / totalEmissions) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Scope breakdown donut */}
        <div className="env-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-2">
          <h3 className="text-[13px] font-semibold text-white mb-5">Scope Contribution</h3>
          <div className="h-52 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={scopeData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {scopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2.5">
            {scopeData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span className="text-slate-400 font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{s.value.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-600 font-bold">{((s.value / totalEmissions) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dept scope allocation stacked bar */}
        <div className="env-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[13px] font-semibold text-white">Department Allocation</h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">Scope allocation across business units</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Operations", Scope1: 180, Scope2: 240, Scope3: 190 },
                  { name: "Admin", Scope1: 60, Scope2: 120, Scope3: 130 },
                  { name: "People", Scope1: 80.4, Scope2: 50.8, Scope3: 229.3 },
                  { name: "Logistics", Scope1: 140, Scope2: 95, Scope3: 180 },
                ]}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Scope1" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Scope2" stackId="a" fill="#06b6d4" />
                <Bar dataKey="Scope3" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Carbon Ledger Table */}
      <div className="env-section rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-[13px] font-semibold text-white">Carbon Ledger</h3>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Transaction-level emissions database</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <MdFilterAlt size={13} />
              <span className="font-medium">Scope:</span>
            </div>
            <div className="flex gap-1">
              {["All", "Scope 1", "Scope 2", "Scope 3"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterScope(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer
                    ${filterScope === s ? 'bg-white/[0.08] text-white border border-white/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] border border-transparent'}
                  `}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.04] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 pl-3">Date</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Activity</th>
                <th className="pb-3 text-center">Scope</th>
                <th className="pb-3 text-right">Quantity</th>
                <th className="pb-3 text-right">Factor</th>
                <th className="pb-3 text-right">kgCO2e</th>
                <th className="pb-3 text-center pr-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3.5 pl-3 text-slate-500 font-medium">{e.date}</td>
                  <td className="text-slate-300 font-medium">{e.department}</td>
                  <td className="text-slate-200 font-semibold">{e.activity_type}</td>
                  <td className="text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg
                      ${e.scope === "Scope 1" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                        e.scope === "Scope 2" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15" :
                        "bg-violet-500/10 text-violet-400 border border-violet-500/15"
                      }`}>
                      {e.scope}
                    </span>
                  </td>
                  <td className="text-right text-slate-400">{e.quantity.toLocaleString()} <span className="text-[9px] uppercase font-bold text-slate-600">{e.unit}</span></td>
                  <td className="text-right text-slate-500 font-mono text-[11px]">{e.emission_factor}</td>
                  <td className="text-right text-white font-bold">{e.kgco2e.toLocaleString()}</td>
                  <td className="text-center pr-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-2 py-0.5">
                      <MdCheckCircle size={11} />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0c0e16] p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Log Carbon Entry</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Add a verified emission record to the ERP ledger</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-1 transition cursor-pointer">
                <MdClose size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select value={newDept} onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white outline-none focus:border-emerald-500/40 transition">
                    <option value="Operations">Operations</option>
                    <option value="Administration">Administration</option>
                    <option value="People">People / HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Scope Class</label>
                  <select value={newScope} onChange={(e) => setNewScope(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white outline-none focus:border-emerald-500/40 transition">
                    <option value="Scope 1">Scope 1 - Direct</option>
                    <option value="Scope 2">Scope 2 - Indirect</option>
                    <option value="Scope 3">Scope 3 - Supply Chain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Activity</label>
                <input type="text" value={newActivity} onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="e.g. Flight travel LHR to JFK"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" required />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quantity</label>
                  <input type="number" step="any" value={newQty} onChange={(e) => setNewQty(e.target.value)}
                    placeholder="1200" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Unit</label>
                  <input type="text" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="km" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Emission Factor</label>
                  <input type="number" step="any" value={newFactor} onChange={(e) => setNewFactor(e.target.value)}
                    placeholder="0.18" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Evidence</label>
                  <input type="text" value={newEvidence} onChange={(e) => setNewEvidence(e.target.value)}
                    placeholder="receipt.pdf" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-white/[0.04]">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/[0.08] px-4 py-2 text-[12px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-[12px] font-semibold text-white hover:brightness-110 transition cursor-pointer">
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
