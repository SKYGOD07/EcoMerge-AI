"use client";
import React from "react";
import { motion } from "framer-motion";

export const LampContainer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`relative flex flex-col items-center w-full z-0 pt-10 ${className}`}
    >
      {/* === Lamp light effect === */}
      <div className="relative w-full h-[200px] flex items-start justify-center overflow-visible">
        
        {/* Scale wrapper for the conic V-beams */}
        <div className="absolute top-0 left-0 right-0 h-full flex items-start justify-center scale-y-125 overflow-visible">
          {/* Left beam with direct alpha mask and origin-top scaling */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="absolute top-[30px] right-1/2 h-[300px] w-[30rem] origin-top"
            style={{
              background: `conic-gradient(from 70deg at center top, #10b981, transparent 50%)`,
              WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 100% 0%, black, transparent)',
              maskImage: 'radial-gradient(ellipse 100% 100% at 100% 0%, black, transparent)',
            }}
          />
          
          {/* Right beam with direct alpha mask and origin-top scaling */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="absolute top-[30px] left-1/2 h-[300px] w-[30rem] origin-top"
            style={{
              background: `conic-gradient(from 290deg at center top, transparent 50%, #10b981)`,
              WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black, transparent)',
              maskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black, transparent)',
            }}
          />
        </div>

        {/* Ambient glow behind the light source */}
        <div className="absolute top-[20px] left-1/2 -translate-x-1/2 z-20 w-[500px] h-[200px] rounded-full bg-emerald-500/20 blur-[80px]" />

        {/* Concentrated light source glow */}
        <motion.div
          initial={{ width: "8rem", opacity: 0.3 }}
          whileInView={{ width: "20rem", opacity: 0.7 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute top-[25px] left-1/2 -translate-x-1/2 z-30 h-[60px] rounded-full bg-emerald-400/40 blur-[40px]"
        />
      </div>

      {/* Children content (headings) placed directly below the lamp source */}
      <div className="relative z-50 flex flex-col items-center px-5 w-full -mt-[140px]">
        {children}
      </div>
    </div>
  );
};
