"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { 
  MdSettings, 
  MdCorporateFare, 
  MdCategory, 
  MdToggleOn, 
  MdToggleOff, 
  MdAdd, 
  MdDelete,
  MdSave,
  MdNotifications
} from "react-icons/md";

const _isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (_isVercel ? '' : "http://localhost:8000");

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  employee_count: number;
  status: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface ESGConfig {
  org_name: string;
  env_weight: number;
  social_weight: number;
  gov_weight: number;
  enable_auto_emission: boolean;
  require_csr_evidence: boolean;
  enable_badge_auto_award: boolean;
  notify_compliance_issue: boolean;
  notify_approval_decision: boolean;
  notify_policy_reminder: boolean;
  notify_badge_unlock: boolean;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"depts" | "categories" | "config" | "notifications">("config");

  // Fetch departments
  const { data: depts = [], refetch: refetchDepts } = useQuery<Department[]>({
    queryKey: ["settings_departments"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/departments`);
      if (!res.ok) throw new Error("Failed to load departments");
      return res.json();
    }
  });

  // Fetch categories
  const { data: categories = [], refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ["settings_categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/settings/categories`);
      if (!res.ok) throw new Error("Failed to load categories");
      return res.json();
    }
  });

  // Fetch ESG config
  const { data: config, refetch: refetchConfig } = useQuery<ESGConfig>({
    queryKey: ["settings_config"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/settings/config`);
      if (!res.ok) throw new Error("Failed to load configuration");
      return res.json();
    }
  });

  // Local config form state
  const [localConfig, setLocalConfig] = useState<ESGConfig | null>(null);
  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  // Create/delete department states
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptHead, setDeptHead] = useState("");
  const [deptEmployees, setDeptEmployees] = useState("0");
  
  // Create category states
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState("csr");

  // Mutation to update settings config
  const updateConfigMutation = useMutation({
    mutationFn: async (updated: ESGConfig) => {
      const res = await fetch(`${API_BASE_URL}/api/settings/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      message.success("Platform configurations successfully updated!");
      refetchConfig();
    },
    onError: (err: any) => {
      message.error(err.message || "Failed to save settings");
    }
  });

  // Mutation to create department
  const createDeptMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE_URL}/api/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create department");
      }
      return res.json();
    },
    onSuccess: () => {
      message.success("Department registry added successfully!");
      refetchDepts();
      setShowDeptModal(false);
      setDeptName("");
      setDeptCode("");
      setDeptHead("");
      setDeptEmployees("0");
    },
    onError: (err: any) => {
      message.error(err.message || "Failed to create department");
    }
  });

  // Mutation to delete department
  const deleteDeptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/departments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete department");
      return res.json();
    },
    onSuccess: () => {
      message.success("Department registry removed.");
      refetchDepts();
    }
  });

  // Mutation to create category
  const createCatMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE_URL}/api/settings/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      message.success("Category tag registry saved.");
      refetchCategories();
      setCatName("");
    }
  });

  // Mutation to delete category
  const deleteCatMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/settings/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
      return res.json();
    },
    onSuccess: () => {
      message.success("Category tag deleted.");
      refetchCategories();
    }
  });

  const handleSaveConfig = () => {
    if (localConfig) {
      updateConfigMutation.mutate(localConfig);
    }
  };

  const handleToggleConfig = (key: keyof ESGConfig) => {
    if (localConfig) {
      setLocalConfig({
        ...localConfig,
        [key]: !localConfig[key]
      });
    }
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) {
      message.error("Name and code are required");
      return;
    }
    createDeptMutation.mutate({
      name: deptName,
      code: deptCode,
      head: deptHead,
      employee_count: parseInt(deptEmployees) || 0,
      status: "Active"
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) {
      message.error("Category name is required");
      return;
    }
    createCatMutation.mutate({
      name: catName,
      type: catType,
      status: "Active"
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure ESG weights, auto-calculators, notification workflows, and departments.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-white/5 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 pb-4 font-semibold transition cursor-pointer ${
            activeTab === "config" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <MdSettings size={18} />
          <span>ESG Config</span>
        </button>
        <button
          onClick={() => setActiveTab("depts")}
          className={`flex items-center gap-2 pb-4 font-semibold transition cursor-pointer ${
            activeTab === "depts" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <MdCorporateFare size={18} />
          <span>Departments</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 pb-4 font-semibold transition cursor-pointer ${
            activeTab === "categories" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <MdCategory size={18} />
          <span>Categories</span>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 pb-4 font-semibold transition cursor-pointer ${
            activeTab === "notifications" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"
          }`}
        >
          <MdNotifications size={18} />
          <span>Notifications</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "config" && localConfig && (
        <div className="space-y-6 max-w-2xl bg-slate-900/20 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
          <h3 className="text-base font-bold text-white mb-4">ESG Weighting Configuration</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Environmental weight</label>
              <input
                type="number"
                value={localConfig.env_weight}
                onChange={(e) => setLocalConfig({ ...localConfig, env_weight: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Social weight</label>
              <input
                type="number"
                value={localConfig.social_weight}
                onChange={(e) => setLocalConfig({ ...localConfig, social_weight: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Governance weight</label>
              <input
                type="number"
                value={localConfig.gov_weight}
                onChange={(e) => setLocalConfig({ ...localConfig, gov_weight: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <h3 className="text-base font-bold text-white pt-6 border-t border-white/5 mb-4">Automation Toggles</h3>
          
          <div className="space-y-4">
            {/* Auto Emission Calculation */}
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Auto Emission Calculation</h4>
                <p className="text-xs text-slate-500 mt-0.5">Automatically calculate carbon footprint entries when operational records are added.</p>
              </div>
              <button onClick={() => handleToggleConfig("enable_auto_emission")} className="text-emerald-400 hover:opacity-85 cursor-pointer">
                {localConfig.enable_auto_emission ? <MdToggleOn size={36} /> : <MdToggleOff size={36} className="text-slate-600" />}
              </button>
            </div>

            {/* CSR Evidence Enforcement */}
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Enforce Evidence Upload for CSR</h4>
                <p className="text-xs text-slate-500 mt-0.5">Require employees to upload supporting documents/photos to request CSR participation approval.</p>
              </div>
              <button onClick={() => handleToggleConfig("require_csr_evidence")} className="text-emerald-400 hover:opacity-85 cursor-pointer">
                {localConfig.require_csr_evidence ? <MdToggleOn size={36} /> : <MdToggleOff size={36} className="text-slate-600" />}
              </button>
            </div>

            {/* Auto Badge Awarding */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Auto Award Gamification Badges</h4>
                <p className="text-xs text-slate-500 mt-0.5">Automatically assign achievements when employees fulfill challenge requirements or hit XP goals.</p>
              </div>
              <button onClick={() => handleToggleConfig("enable_badge_auto_award")} className="text-emerald-400 hover:opacity-85 cursor-pointer">
                {localConfig.enable_badge_auto_award ? <MdToggleOn size={36} /> : <MdToggleOff size={36} className="text-slate-600" />}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
            >
              <MdSave size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && localConfig && (
        <div className="space-y-6 max-w-2xl bg-slate-900/20 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
          <h3 className="text-base font-bold text-white mb-4">Notification Event Triggers</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">New Compliance Issue Raised</h4>
                <p className="text-xs text-slate-500 mt-0.5">Notify the assigned owner immediately when a compliance gap is reported.</p>
              </div>
              <button onClick={() => handleToggleConfig("notify_compliance_issue")} className="text-emerald-400 hover:opacity-85 cursor-pointer">
                {localConfig.notify_compliance_issue ? <MdToggleOn size={36} /> : <MdToggleOff size={36} className="text-slate-600" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">CSR Activity & Challenge Approvals</h4>
                <p className="text-xs text-slate-500 mt-0.5">Send alerts to employees when their volunteer proof is approved or rejected by managers.</p>
              </div>
              <button onClick={() => handleToggleConfig("notify_approval_decision")} className="text-emerald-400 hover:opacity-85 cursor-pointer">
                {localConfig.notify_approval_decision ? <MdToggleOn size={36} /> : <MdToggleOff size={36} className="text-slate-600" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Policy Acknowledgement Reminders</h4>
                <p className="text-xs text-slate-500 mt-0.5">Notify employees when new policy documents require their sign-off.</p>
              </div>
              <button onClick={() => handleToggleConfig("notify_policy_reminder")} className="text-emerald-400 hover:opacity-85 cursor-pointer">
                {localConfig.notify_policy_reminder ? <MdToggleOn size={36} /> : <MdToggleOff size={36} className="text-slate-600" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Achievement Badge Unlocks</h4>
                <p className="text-xs text-slate-500 mt-0.5">Alert employees the moment they unlock a new gamification badge.</p>
              </div>
              <button onClick={() => handleToggleConfig("notify_badge_unlock")} className="text-emerald-400 hover:opacity-85 cursor-pointer">
                {localConfig.notify_badge_unlock ? <MdToggleOn size={36} /> : <MdToggleOff size={36} className="text-slate-600" />}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
            >
              <MdSave size={16} />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "depts" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Platform Departments</h3>
            <button
              onClick={() => setShowDeptModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition cursor-pointer"
            >
              <MdAdd size={16} />
              <span>Add Department</span>
            </button>
          </div>

          {/* Department Table */}
          <div className="rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-4">Name</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Department Head</th>
                  <th className="pb-3 text-right">Employees</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-center pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                {depts.map((d) => (
                  <tr key={d.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 pl-4 font-bold text-white">{d.name}</td>
                    <td><span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">{d.code}</span></td>
                    <td>{d.head || "Not Assigned"}</td>
                    <td className="text-right">{d.employee_count}</td>
                    <td className="text-center">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {d.status}
                      </span>
                    </td>
                    <td className="text-center pr-4">
                      <button
                        onClick={() => deleteDeptMutation.mutate(d.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded transition cursor-pointer"
                      >
                        <MdDelete size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Department Add Modal */}
          {showDeptModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-white mb-6">Add Department Registry</h3>
                <form onSubmit={handleAddDept} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Department Name</label>
                    <input
                      type="text"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. Quality Assurance"
                      className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Code</label>
                    <input
                      type="text"
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value)}
                      placeholder="e.g. QA"
                      className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Head of Department</label>
                    <input
                      type="text"
                      value={deptHead}
                      onChange={(e) => setDeptHead(e.target.value)}
                      placeholder="e.g. Emily Watson"
                      className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Employee Count</label>
                    <input
                      type="number"
                      value={deptEmployees}
                      onChange={(e) => setDeptEmployees(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowDeptModal(false)}
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                    >
                      Add Registry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 backdrop-blur-md h-fit">
            <h3 className="text-base font-bold text-white mb-4">Add Category Tag</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Energy Efficiency"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Module Type</label>
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                >
                  <option value="csr">Social (CSR Activity Category)</option>
                  <option value="challenge">Gamification (Challenge Category)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition cursor-pointer"
              >
                <MdAdd size={16} />
                <span>Save Tag</span>
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="md:col-span-2 bg-slate-900/20 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-4">Configured Categories</h3>
            
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3.5 border border-white/5 hover:border-white/10 transition">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{c.name}</h4>
                    <span className="inline-block text-[9px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full mt-1.5">
                      {c.type === "csr" ? "Social CSR Category" : "Gamification Challenge Category"}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteCatMutation.mutate(c.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition cursor-pointer"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              ))}

              {categories.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-8">No categories tagged. Create one on the left.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
