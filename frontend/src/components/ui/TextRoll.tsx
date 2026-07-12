"use client";

import { motion } from "framer-motion";
import React from "react";

const STAGGER = 0.025; // Slightly faster stagger for longer sentences

export const TextRoll: React.FC<{
  children: string;
  className?: string;
  center?: boolean;
}> = ({ children, className = "", center = false }) => {
  const words = children.split(" ");
  const totalLetters = children.replace(/\s/g, "").length;

  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={`relative inline-flex flex-wrap gap-x-[0.22em] gap-y-[0.05em] ${className}`}
      style={{
        lineHeight: 0.95,
      }}
    >
      {words.map((word, wordIndex) => {
        // Calculate cumulative character index for stagger delay calculation
        let prevCharsCount = 0;
        for (let idx = 0; idx < wordIndex; idx++) {
          prevCharsCount += words[idx].length;
        }

        return (
          <span
            key={wordIndex}
            className="relative inline-block overflow-hidden whitespace-nowrap"
            style={{ height: "1.05em", verticalAlign: "bottom" }}
          >
            {/* First layer (original text) */}
            <span className="inline-block">
              {word.split("").map((l, i) => {
                const charIndex = prevCharsCount + i;
                const delay = center
                  ? STAGGER * Math.abs(charIndex - (totalLetters - 1) / 2)
                  : STAGGER * charIndex;

                return (
                  <motion.span
                    variants={{
                      initial: { y: 0 },
                      hovered: { y: "-125%" }, // Increased translation to completely push out of view
                    }}
                    transition={{
                      ease: "easeInOut",
                      duration: 0.35,
                      delay,
                    }}
                    className="inline-block"
                    key={i}
                  >
                    {l}
                  </motion.span>
                );
              })}
            </span>

            {/* Second layer (rolling text on hover) */}
            <span className="absolute inset-0 inline-block whitespace-nowrap">
              {word.split("").map((l, i) => {
                const charIndex = prevCharsCount + i;
                const delay = center
                  ? STAGGER * Math.abs(charIndex - (totalLetters - 1) / 2)
                  : STAGGER * charIndex;

                return (
                  <motion.span
                    variants={{
                      initial: { y: "125%" }, // Increased translation to keep completely hidden initially
                      hovered: { y: 0 },
                    }}
                    transition={{
                      ease: "easeInOut",
                      duration: 0.35,
                      delay,
                    }}
                    className="inline-block"
                    key={i}
                  >
                    {l}
                  </motion.span>
                );
              })}
            </span>
          </span>
        );
      })}
    </motion.span>
  );
};
