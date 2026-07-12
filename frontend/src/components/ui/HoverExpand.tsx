"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ESGModuleItem {
  id: string;
  title: string;
  score: string;
  color: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
}

export const HoverExpandModules = ({
  items,
  className,
  onItemSelect,
}: {
  items: ESGModuleItem[];
  className?: string;
  onItemSelect: (id: string) => void;
}) => {
  const [activeItem, setActiveItem] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn("relative w-full max-w-5xl mx-auto px-1", className)}
    >
      <div className="flex w-full flex-col gap-3">
        {items.map((item, index) => {
          const isActive = activeItem === index;
          return (
            <motion.div
              key={item.id}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300",
                isActive 
                  ? "border-white/20 bg-zinc-950/80 shadow-[0_0_30px_rgba(16,185,129,0.05)]" 
                  : "border-white/5 bg-zinc-900/30 hover:border-white/10 hover:bg-zinc-900/50"
              )}
              initial={{ height: "4.5rem" }}
              animate={{
                height: isActive ? "16rem" : "4.5rem",
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                setActiveItem(index);
                onItemSelect(item.id);
              }}
              onMouseEnter={() => setActiveItem(index)}
            >
              {/* Subtle background glow for the active module */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    exit={{ opacity: 0 }}
                    className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", item.bgGradient)}
                  />
                )}
              </AnimatePresence>

              {/* Header area - always visible */}
              <div className="h-[4.5rem] flex items-center justify-between px-6 md:px-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2.5 rounded-xl border transition-colors",
                    isActive ? "border-emerald-500/20 bg-emerald-500/10" : "border-white/10 bg-white/5"
                  )}>
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">
                      {item.category}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn("text-xl md:text-2xl font-black tracking-tight", item.color)}>
                    {item.score}
                  </span>
                  {/* Small Chevron indicator */}
                  <motion.svg
                    animate={{ rotate: isActive ? 90 : 0 }}
                    className="w-4 h-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </div>
              </div>

              {/* Body area - expands downwards */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="px-6 md:px-8 pb-6 relative z-10 flex flex-col justify-between h-[11rem]"
                  >
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-xs font-semibold text-emerald-400/80 hover:text-emerald-400 transition-colors flex items-center gap-1">
                        Click card to launch audit interface
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Live Tracking Active
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
