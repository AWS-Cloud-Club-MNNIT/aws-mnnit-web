"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const rows = 8;
const cols = 6;
const totalCells = rows * cols;

interface Agent {
  id: number;
  path: number[];
  dir: "UP" | "DOWN" | "LEFT" | "RIGHT";
  color: string;
  lifespan: number;
  age: number;
}

const colors = [
  "from-[#5B21B6] to-[#7C3AED]", // Purple
  "from-[#4C1D95] to-[#6D28D9]", // Darker purple
  "from-[#7C3AED] to-[#8B5CF6]", // Vibrant purple
  "from-[#3B82F6] to-[#8B5CF6]", // Blue-purple blend
];

// Helper to spawn a packet from the screen edges (like network traffic entering the grid)
const createAgent = (id: number): Agent => {
  const isHorizontal = Math.random() > 0.5;
  let startRow = 0;
  let startCol = 0;
  let dir: "UP" | "DOWN" | "LEFT" | "RIGHT" = "DOWN";

  if (isHorizontal) {
    startRow = Math.floor(Math.random() * rows);
    if (Math.random() > 0.5) {
      startCol = 0;
      dir = "RIGHT";
    } else {
      startCol = cols - 1;
      dir = "LEFT";
    }
  } else {
    startCol = Math.floor(Math.random() * cols);
    if (Math.random() > 0.5) {
      startRow = 0;
      dir = "DOWN";
    } else {
      startRow = rows - 1;
      dir = "UP";
    }
  }

  return {
    id,
    path: [startRow * cols + startCol],
    dir,
    color: colors[Math.floor(Math.random() * colors.length)],
    lifespan: Math.floor(Math.random() * 8) + 4, // Lives for 4 to 11 moves before safely dissolving
    age: 0,
  };
};

export function AnimatedGrid() {
  const [agents, setAgents] = useState<Agent[]>(() => 
    Array.from({ length: 4 }).map((_, i) => createAgent(i + 1))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prevAgents) => 
        prevAgents.map((agent) => {
          // If the packet has lived its natural lifespan, respawn it!
          if (agent.age >= agent.lifespan) {
            return createAgent(agent.id);
          }

          const { path, age } = agent;
          let { dir } = agent;
          const pos = path[0];
          const row = Math.floor(pos / cols);
          const col = pos % cols;
          
          // Randomly turn 20% of the time to create organic meandering
          if (Math.random() < 0.20) {
            const turnOptions = (dir === "UP" || dir === "DOWN") ? ["LEFT", "RIGHT"] as const : ["UP", "DOWN"] as const;
            dir = turnOptions[Math.floor(Math.random() * 2)];
          }
          
          let nextRow = row;
          let nextCol = col;
          
          if (dir === "UP") nextRow = row > 0 ? row - 1 : row;
          else if (dir === "DOWN") nextRow = row < rows - 1 ? row + 1 : row;
          else if (dir === "LEFT") nextCol = col > 0 ? col - 1 : col;
          else if (dir === "RIGHT") nextCol = col < cols - 1 ? col + 1 : col;
          
          // If it hits an absolute edge boundary, despawn perfectly instead of bouncing awkwardly
          if (nextRow === row && nextCol === col) {
            return createAgent(agent.id);
          }
          
          const nextPos = nextRow * cols + nextCol;
          return { ...agent, path: [nextPos, ...path].slice(0, 4), dir, age: age + 1 }; // Age and shift tail
        })
      );
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full max-w-none ml-auto border-l border-white/5 dark:border-white/5 opacity-80 lg:opacity-100">
      <div 
        className="absolute inset-0 grid border-l border-t border-white/10 dark:border-white/10 pointer-events-none"
        style={{ 
          gridTemplateColumns: 'minmax(0, 1.2fr) repeat(5, minmax(0, 1fr))',
          gridTemplateRows: 'minmax(0, 1.2fr) repeat(7, minmax(0, 1fr))'
        }}
      >
        {Array.from({ length: totalCells }).map((_, i) => {
          // Figure out if this cell is part of any agent's path
          let activeLevel = -1;
          let cellColor = "";
          for (const agent of agents) {
            const idx = agent.path.indexOf(i);
            if (idx !== -1) {
              // Standard CSS z-index/painters algo rule applies, use the topmost agent layer
              if (activeLevel === -1 || idx < activeLevel) {
                activeLevel = idx;
                cellColor = agent.color;
              }
            }
          }
          
          // Determine opacity based on tail position: head is 100%, tail fades out
          const targetOpacity = activeLevel === -1 ? 0 : [1, 0.6, 0.3, 0.1][activeLevel];

          return (
            <div key={i} className="border-r border-b border-white/10 dark:border-white/10 relative overflow-hidden bg-transparent">
               {/* Smooth dynamic fading trail layer */}
               <motion.div
                 initial={false}
                 animate={{ opacity: targetOpacity }}
                 transition={{ duration: 1.2, ease: "linear" }}
                 className={`absolute inset-0 z-10 bg-linear-to-br ${cellColor || "from-[#5B21B6] to-[#7C3AED]"}`}
               />
                
               {/* AWS Logo inside cell index 47 (Row 7, Col 5 0-indexed - very bottom right) */}
                {i === 47 && (
                  <div className="absolute inset-0 z-20 flex items-end justify-end p-2">
                    <div className="relative w-24 h-24 flex items-center justify-center group/logo">
                        <Image
                          src="/AWS.png"
                          alt="AWS Logo"
                          width={80}
                          height={80}
                          className="object-contain transition-all duration-500 group-hover/logo:scale-110"
                          style={{ filter: 'none' }}
                          priority
                        />
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
