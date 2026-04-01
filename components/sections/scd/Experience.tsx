"use client";

import { motion } from "framer-motion";
import { MicrophoneStage, RocketLaunch, UsersThree } from "@phosphor-icons/react";

export function Experience() {
  const experiences = [
    {
      icon: <MicrophoneStage weight="duotone" className="w-8 h-8" />,
      title: "Expert Keynotes",
      desc: "Hear directly from AWS Heroes and senior cloud architects on the future of the industry.",
      color: "from-blue-500/10 to-transparent",
      iconColor: "text-blue-400"
    },
    {
      icon: <RocketLaunch weight="duotone" className="w-8 h-8" />,
      title: "Live Build Sessions",
      desc: "Code alongside experts deploying serverless applications and ML models in real-time.",
      color: "from-[#FF9900]/10 to-transparent",
      iconColor: "text-[#FF9900]"
    },
    {
      icon: <UsersThree weight="duotone" className="w-8 h-8" />,
      title: "Networking Hub",
      desc: "Connect with recruiters from top tech companies and brilliant student developers.",
      color: "from-[#A78BFA]/10 to-transparent",
      iconColor: "text-[#A78BFA]"
    },
  ];

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-bold text-[#A78BFA] uppercase tracking-[0.2em] mb-4">
            The Experience
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            What to Expect
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {experiences.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="group relative h-full bg-[#0D0F16]/50 backdrop-blur-sm border border-white/[0.05] hover:border-white/20 transition-all duration-500 overflow-hidden rounded-[2rem] p-10 flex flex-col items-start text-left hover:-translate-y-1 shadow-2xl shadow-black/50"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className={`w-16 h-16 rounded-2xl bg-[#090C15]/80 border border-white/5 flex items-center justify-center ${item.iconColor} mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                {item.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                {item.title}
              </h3>
              
              <p className="text-[#8892B0] text-base leading-relaxed relative z-10">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
