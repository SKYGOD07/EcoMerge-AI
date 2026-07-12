"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import EulerLogo from "@/assets/Euler-Img.svg";
import { TextRoll } from "@/components/ui/TextRoll";
import { ContainerScroll } from "@/components/ui/ContainerScroll";
import { LampContainer } from "@/components/ui/Lamp";
import { 
  MdCo2, 
  MdPeople, 
  MdGavel, 
  MdEmojiEvents, 
  MdArrowForward,
  MdClose,
  MdCheckCircle,
  MdStar,
  MdLayers,
  MdInsertChartOutlined,
  MdVerifiedUser
} from "react-icons/md";

// -- Spotlight Card Component for Premium Glassmorphic Hover Effects --
function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-3xl transition-colors hover:border-white/20 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
}

interface ESGMetricCard {
  id: string;
  title: string;
  category: string;
  score: string;
  color: string;
  bgGlow: string;
  icon: React.ReactNode;
  description: string;
  details: {
    kpi1: string;
    kpi1Val: string;
    kpi2: string;
    kpi2Val: string;
    kpi3: string;
    kpi3Val: string;
    highlight: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const cards: ESGMetricCard[] = [
    {
      id: "env",
      title: "Environmental ledger",
      category: "Carbon Accounting",
      score: "82",
      color: "text-emerald-400",
      bgGlow: "from-emerald-500/20 to-transparent",
      icon: <MdCo2 size={32} className="text-emerald-400" />,
      description: "Real-time carbon emissions accounting with automated telemetry conversions, emission factors config, and audit-ready tracking.",
      details: {
        kpi1: "Total Emissions",
        kpi1Val: "1,280.5 kgCO2e",
        kpi2: "Reduction Progress",
        kpi2Val: "74% of Target",
        kpi3: "Active Goals",
        kpi3Val: "3 Departments",
        highlight: "Automated calculations capture emissions directly from linked ERP purchases."
      }
    },
    {
      id: "soc",
      title: "Social responsibility",
      category: "CSR & Engagement",
      score: "74",
      color: "text-indigo-400",
      bgGlow: "from-indigo-500/20 to-transparent",
      icon: <MdPeople size={32} className="text-indigo-400" />,
      description: "Corporate responsibility logging and volunteer tracking combined with GRI-compliant employee diversity dashboards.",
      details: {
        kpi1: "Volunteer Work",
        kpi1Val: "1,190 Hours",
        kpi2: "Outreach Campaigns",
        kpi2Val: "4 Live Campaigns",
        kpi3: "Inclusion Metric",
        kpi3Val: "46% Female Benchmark",
        highlight: "CSR participations support proof-of-evidence checks and feed into employee XP."
      }
    },
    {
      id: "gov",
      title: "Corporate governance",
      category: "Policies & Compliance",
      score: "88",
      color: "text-pink-400",
      bgGlow: "from-pink-500/20 to-transparent",
      icon: <MdGavel size={32} className="text-pink-400" />,
      description: "Centralized policy acknowledgement registry, automated compliance audits, and overdue violation trackers.",
      details: {
        kpi1: "Active Policies",
        kpi1Val: "3 Registered v1/v2",
        kpi2: "Audit Score Avg",
        kpi2Val: "91.5 / 100",
        kpi3: "Compliance Issues",
        kpi3Val: "1 High Severity Open",
        highlight: "System flags and alerts owners automatically on deadlines and overdue policies."
      }
    }
  ];

  const selectedClass = cards.find(c => c.id === selectedCardId);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Dynamic Animated Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-[#030303] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-lg bg-emerald-500/30 rounded-full"></div>
              <Image 
                src={EulerLogo} 
                alt="EcoSphere Logo" 
                className="w-9 h-9 relative z-10 animate-spin-slow"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white cursor-default">
              <TextRoll>EcoSphere</TextRoll>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => router.push("/dashboard/overview")}
                className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-slate-200 active:scale-95 cursor-pointer"
              >
                <TextRoll>Dashboard</TextRoll>
                <MdArrowForward className="transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <Link 
                href="/login"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <TextRoll>Sign In</TextRoll>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero & Scroll Tilt Mockup Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-10">
        <ContainerScroll
          titleComponent={
            <LampContainer className="-mt-20">
              <motion.h1 
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="max-w-5xl text-5xl font-black tracking-tighter text-white sm:text-7xl md:text-8xl flex flex-col items-center gap-2"
              >
                <div className="cursor-default pb-2">
                  <TextRoll center>Sustainability,</TextRoll>
                </div>
                <div className="bg-gradient-to-br from-emerald-400 via-teal-200 to-indigo-400 bg-clip-text text-transparent cursor-default pb-2">
                  <TextRoll center>Engineered.</TextRoll>
                </div>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 font-medium leading-relaxed"
              >
                Unify carbon accounting, compliance audits, and employee engagement into one enterprise-grade platform. Data-driven ESG for the modern era.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={() => router.push(user ? "/dashboard/overview" : "/login")}
                  className="group relative flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)] cursor-pointer"
                >
                  <TextRoll>Launch Sandbox</TextRoll>
                  <MdArrowForward className="transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href="#metrics"
                  className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10 cursor-pointer"
                >
                  <TextRoll>Explore Platform</TextRoll>
                </a>
              </motion.div>
            </LampContainer>
          }
        >
          <div className="w-full h-full flex flex-col overflow-hidden relative shadow-inner shadow-white/5 bg-black">
            {/* Mockup Header */}
            <div className="h-12 border-b border-white/10 flex items-center px-6 gap-2 bg-white/5 backdrop-blur-md">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
            </div>
            {/* Mockup Body - Realistic Dashboard Representation */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-48 border-r border-white/10 bg-black/40 p-4 flex flex-col gap-4">
                <div className="h-8 rounded-lg bg-white/10 flex items-center px-3 gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <div className="h-3 w-16 bg-white/30 rounded"></div>
                </div>
                <div className="h-px w-full bg-white/10 my-2"></div>
                <div className="flex flex-col gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-8 rounded-lg flex items-center px-3 gap-3 transition-colors ${i === 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                      <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                      <div className={`h-2.5 w-20 rounded ${i === 0 ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-br from-white/[0.02] to-transparent overflow-y-auto">
                {/* Top Nav */}
                <div className="flex justify-between items-center h-8">
                  <div className="h-4 w-32 bg-white/20 rounded"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-24 bg-white/5 rounded-full border border-white/10"></div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"></div>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="h-28 rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl"></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ESG Score</div>
                    <div>
                      <div className="text-3xl font-black text-white mb-1 tracking-tighter">92.4</div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                        <div className="text-xs text-emerald-400 font-medium">+4.2% YoY</div>
                      </div>
                    </div>
                  </div>
                  <div className="h-28 rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between backdrop-blur-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total CO2e</div>
                    <div>
                      <div className="text-3xl font-black text-white mb-1 tracking-tighter">1,240 <span className="text-sm font-medium text-slate-500">t</span></div>
                      <div className="text-xs text-slate-400 font-medium">Tracking under target</div>
                    </div>
                  </div>
                  <div className="h-28 rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Quests</div>
                    <div>
                      <div className="text-3xl font-black text-white mb-1 tracking-tighter">15</div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                        <div className="text-xs text-indigo-400 font-medium">85% Participation</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Chart Area */}
                <div className="flex-1 min-h-[200px] rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5 pointer-events-none"></div>
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="text-sm font-bold text-white tracking-wide">Emissions Forecast</div>
                    <div className="h-6 w-24 bg-white/10 rounded-full border border-white/5"></div>
                  </div>
                  {/* Fake Chart Bars */}
                  <div className="flex-1 flex items-end justify-between gap-4 relative z-10 border-b border-white/10 pb-2">
                    {[40, 70, 45, 90, 65, 80, 50, 100].map((h, i) => (
                      <div key={i} className="w-full bg-gradient-to-t from-emerald-500/40 to-emerald-400/10 rounded-t-md relative group transition-all duration-300 hover:from-emerald-400 hover:to-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] cursor-pointer" style={{ height: `${h}%` }}>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* Interactive ESG Modules */}
      <section id="metrics" className="relative z-10 mx-auto max-w-7xl px-6 pb-32 pt-48">
        <div className="mb-16 cursor-default">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl pb-1">
            <TextRoll>Audit-Ready Modules.</TextRoll>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl">
            Click on any module to explore the detailed breakdown of our ESG tracking architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              key={card.id}
            >
              <SpotlightCard>
                <motion.div
                  layoutId={`card-${card.id}`}
                  onClick={() => setSelectedCardId(card.id)}
                  className="cursor-pointer p-8 flex flex-col h-full min-h-[320px]"
                >
                  <div className="mb-8 flex items-start justify-between">
                    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-xl">
                      {card.icon}
                    </div>
                    <span className={`text-2xl font-black ${card.color}`}>
                      {card.score}
                    </span>
                  </div>
                  
                  <div className="mt-auto pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {card.category}
                    </span>
                    <h3 className="mt-2 text-2xl font-bold text-white tracking-tight cursor-default pb-1">
                      <TextRoll>{card.title}</TextRoll>
                    </h3>
                    <p className="mt-4 text-sm text-slate-400 leading-relaxed font-medium">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento Box Gamification Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-32">
        <div className="mb-16 cursor-default">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl pb-1">
            <TextRoll>Built for Engagement.</TextRoll>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl">
            Gamify sustainability. Drive team participation through challenges, leaderboards, and real rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Bento Feature */}
          <SpotlightCard className="col-span-1 md:col-span-8 p-8 flex flex-col md:flex-row items-center gap-8 min-h-[380px]">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                <MdEmojiEvents size={16} /> ESG Gamification
              </span>
              <h3 className="text-3xl font-bold text-white tracking-tight cursor-default pb-1">
                <TextRoll>Turn Sustainability into a Team Achievement</TextRoll>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Reward eco-friendly habits with levels, XP, and badges. Staff earn points by completing sustainability challenges or participating in company-organized CSR campaigns.
              </p>
              <div className="flex gap-6 pt-4 border-t border-white/5">
                <div>
                  <span className="text-2xl font-bold text-white">4 Live</span>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1">Active Quests</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">100%</span>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1">Reward Backed</span>
                </div>
              </div>
            </div>
            
            {/* Visual Abstract representation of a challenge */}
            <div className="w-full md:w-[300px] shrink-0 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl relative">
              <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                <MdStar size={24} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full">Environmental</span>
                <span className="text-sm font-bold text-emerald-400">+200 XP</span>
              </div>
              <h4 className="font-bold text-white text-base">Green Commute</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Walk or cycle instead of driving for 5 consecutive days.</p>
              <div className="w-full bg-white/5 rounded-full h-2 mt-6 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "60%" }}
                  transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                ></motion.div>
              </div>
              <div className="mt-2 text-[10px] text-right font-medium text-slate-400">3 / 5 Days</div>
            </div>
          </SpotlightCard>

          {/* Side Bento 1 */}
          <SpotlightCard className="col-span-1 md:col-span-4 p-8 flex flex-col min-h-[380px]">
            <div className="rounded-xl bg-white/5 w-12 h-12 flex items-center justify-center mb-6 ring-1 ring-white/10">
              <MdLayers className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight cursor-default pb-1">
              <TextRoll>Seamless ERP Integration</TextRoll>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connect your existing supply chain databases. We extract raw purchasing data and instantly calculate CO2 equivalents using our global emission factor library.
            </p>
          </SpotlightCard>

          {/* Side Bento 2 */}
          <SpotlightCard className="col-span-1 md:col-span-4 p-8 flex flex-col">
            <div className="rounded-xl bg-white/5 w-12 h-12 flex items-center justify-center mb-6 ring-1 ring-white/10">
              <MdInsertChartOutlined className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight cursor-default pb-1">
              <TextRoll>GRI Ready Reporting</TextRoll>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Export comprehensive reports mapped to leading global frameworks (GRI, SASB) with a single click.
            </p>
          </SpotlightCard>

          {/* Side Bento 3 */}
          <SpotlightCard className="col-span-1 md:col-span-8 p-8 flex flex-col justify-center overflow-hidden relative">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-md">
              <h3 className="text-3xl font-bold text-white mb-4 tracking-tight cursor-default pb-1">
                <TextRoll>Trust & Verification.</TextRoll>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Every metric is backed by uploadable proof-of-evidence documents. Assign compliance audits and track their resolution status in real time.
              </p>
              <button 
                onClick={() => router.push(user ? "/dashboard/governance" : "/login")}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <MdVerifiedUser size={18} />
                Explore Governance Features
              </button>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Maximize Card Detail View Overlay */}
      <AnimatePresence>
        {selectedCardId && selectedClass && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop Blur Layer */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xl cursor-pointer"
              onClick={() => setSelectedCardId(null)}
            ></div>

            {/* Modal Content */}
            <motion.div
              layoutId={`card-${selectedCardId}`}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl"
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              {/* Subtle Inner Glow */}
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${selectedClass.bgGlow} opacity-20`}></div>

              <div className="p-8 sm:p-10">
                <button
                  onClick={() => setSelectedCardId(null)}
                  className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <MdClose size={22} />
                </button>

                <div className="flex items-center gap-5 mb-8">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    {selectedClass.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {selectedClass.category}
                    </span>
                    <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">
                      {selectedClass.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-black/50 p-6 mb-8 ring-1 ring-white/5 backdrop-blur-md">
                  <span className="text-sm font-medium text-slate-400">Audited Module Score</span>
                  <span className={`text-4xl font-black ${selectedClass.color}`}>
                    {selectedClass.score}
                  </span>
                </div>

                <p className="text-base text-slate-300 leading-relaxed mb-8">
                  {selectedClass.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/5 backdrop-blur-md">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{selectedClass.details.kpi1}</span>
                    <span className="block text-lg font-bold text-white mt-2">{selectedClass.details.kpi1Val}</span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/5 backdrop-blur-md">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{selectedClass.details.kpi2}</span>
                    <span className="block text-lg font-bold text-white mt-2">{selectedClass.details.kpi2Val}</span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/5 backdrop-blur-md">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{selectedClass.details.kpi3}</span>
                    <span className="block text-lg font-bold text-white mt-2">{selectedClass.details.kpi3Val}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-start gap-4">
                  <MdCheckCircle className="text-emerald-400 mt-0.5 shrink-0" size={20} />
                  <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
                    {selectedClass.details.highlight}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030303] py-12 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src={EulerLogo} alt="Logo" className="w-5 h-5 opacity-50 grayscale" />
            <p className="font-medium">© 2026 EcoSphere ESG. All Rights Reserved.</p>
          </div>
          <div className="flex gap-8 font-medium">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Auditor login</Link>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
