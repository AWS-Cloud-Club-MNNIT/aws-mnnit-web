"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { CloudArrowUp, TerminalWindow, Brain, Lightning, CheckCircle, ArrowRight } from "@phosphor-icons/react"

interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  theme: string;
  features: string[];
}

const services: Service[] = [
  {
    id: "compute",
    number: "01",
    title: "Cloud Computing",
    description: "Learn how to architect scalable systems on AWS. Master EC2, S3, and modern cloud infrastructure.",
    icon: <CloudArrowUp weight="duotone" className="w-24 h-24" />,
    theme: "from-[#7C3AED] to-[#A78BFA] text-[#A78BFA]",
    features: [
      "Architect scalable systems on AWS",
      "Master EC2, S3, and VPC deployments",
      "Implement high availability and load balancing",
      "Optimize infrastructure costs and performance"
    ]
  },
  {
    id: "devops",
    number: "02",
    title: "DevOps",
    description: "Build automated pipelines and master containerization with Docker, Kubernetes, and GitHub Actions.",
    icon: <TerminalWindow weight="duotone" className="w-24 h-24" />,
    theme: "from-[#7C3AED] to-[#5B21B6] text-[#7C3AED]",
    features: [
      "Build CI/CD pipelines with GitHub Actions",
      "Containerize applications using Docker",
      "Orchestrate containers with Kubernetes",
      "Infrastructure as Code with Terraform"
    ]
  },
  {
    id: "backend",
    number: "03",
    title: "Backend Systems",
    description: "Design robust APIs and database architectures. Explore Node.js, Python, and serverless logic.",
    icon: <Lightning weight="duotone" className="w-24 h-24" />,
    theme: "from-[#A78BFA] to-[#7C3AED] text-[#A78BFA]",
    features: [
      "Design robust REST and GraphQL APIs",
      "Architect serverless functions with AWS Lambda",
      "Manage relational and NoSQL databases",
      "Implement secure authentication patterns"
    ]
  },
  {
    id: "ml",
    number: "04",
    title: "Machine Learning",
    description: "Bring AI to the cloud. Deploy and scale ML models using AWS SageMaker and intelligent services.",
    icon: <Brain weight="duotone" className="w-24 h-24" />,
    theme: "from-[#7C3AED] to-[#4C1D95] text-[#7C3AED]",
    features: [
      "Deploy models with AWS SageMaker",
      "Build intelligent AI-driven applications",
      "Scale inference pipelines globally",
      "Integrate LLMs and Generative AI APIs"
    ]
  },
]

function TrackCard({ service, setActiveTab, isLast }: { service: Service, setActiveTab: (id: string) => void, isLast: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Track when this card's container is actively intersecting the viewport center
  const { scrollYProgress: inViewProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  useMotionValueEvent(inViewProgress, "change", (latest) => {
    if (latest > 0 && latest < 1) {
      setActiveTab(service.id)
    }
  })

  // Track scroll for stacking animation - scale down when the next card starts covering it
  // For the last card, use a tighter offset so the effect fires within its shorter margin
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: isLast ? ["start 0.2", "end start"] : ["start start", "end start"]
  })

  const scale = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0.92])
  const yOffset = useTransform(scrollYProgress, [0, 0.7, 1], [0, 0, -20])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0.8])
  const filter = useTransform(
    scrollYProgress,
    [0, 0.7, 1],
    ["blur(0px) brightness(1)", "blur(0px) brightness(1)", "blur(8px) brightness(0.4)"]
  )

  return (
    <div
      ref={containerRef}
      id={`track-${service.id}`}
      className={`sticky top-[140px] md:top-[180px] w-full flex items-center justify-center pt-4 md:pt-0 ${isLast ? 'mb-[30vh]' : 'mb-[60vh] md:mb-[80vh]'}`}
    >
      <motion.div
        style={{ scale, y: yOffset, opacity: cardOpacity, filter, transformOrigin: 'top center' }}
        className="w-full max-w-6xl mx-auto bg-[#090C15] border border-white/[0.03] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-[0_-30px_60px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

          {/* Left Content */}
          <div className="flex-1 w-full order-2 lg:order-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/40 font-mono text-sm mb-8">
              {service.number}
            </div>

            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {service.title}
            </h3>

            <p className="text-lg text-[#8892B0] mb-10 leading-relaxed max-w-xl">
              {service.description}
            </p>

            <ul className="space-y-5">
              {service.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-4">
                  <CheckCircle weight="fill" className={`w-6 h-6 mt-0.5 text-white/60`} />
                  <span className="text-base text-[#8892B0] font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/tracks" className="mt-10 group inline-flex items-center cursor-pointer block w-fit">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8892B0] group-hover:text-white transition-colors duration-300 uppercase tracking-widest">
                Explore Track <ArrowRight weight="bold" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </div>
            </Link>
          </div>

          {/* Right Content - Visual Representation */}
          <div className="flex-1 w-full order-1 lg:order-2 h-[300px] md:h-[400px] lg:h-[450px]">
            <div className="relative w-full h-full rounded-[2rem] flex items-center justify-center group bg-[#16172B] border border-white/[0.02] overflow-hidden">
              {/* Background Gradient Blob */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br ${service.theme} opacity-5 blur-[100px] rounded-full transition-transform duration-1000 group-hover:scale-110`} />

              {/* The main icon container */}
              <div className="relative z-10 w-40 h-40 md:w-56 md:h-56 rounded-[2rem] bg-[#0C0E17] border border-white/[0.02] flex items-center justify-center shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-3">
                <div className="text-white/80">
                  {service.icon}
                </div>
              </div>

              {/* Decorative floating elements to mimic standard dashboard cards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="absolute top-10 left-8 md:left-12 w-28 md:w-36 h-12 md:h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center px-5 gap-4 shadow-lg backdrop-blur-xl"
              >
                <div className="flex-1 h-1.5 bg-white/20 rounded-full" />
                <div className="w-5 h-5 rounded-full bg-white/20" />
              </motion.div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="absolute bottom-10 right-8 md:right-12 w-44 md:w-52 h-16 md:h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-center px-6 gap-3 shadow-lg backdrop-blur-xl"
              >
                <div className="w-1/2 h-1.5 bg-white/20 rounded-full" />
                <div className="w-3/4 h-1.5 bg-white/10 rounded-full" />
              </motion.div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}

export function Services() {
  const [activeTab, setActiveTab] = React.useState(services[0].id)

  return (
    <section id="services" className="relative bg-background pt-12">

      {/* Scrollable container with sticky tabs */}
      <div className="relative">

        {/* Sticky Top Navigation */}
        <div className="sticky top-[70px] lg:top-20 z-50 w-full bg-background/95 backdrop-blur-xl py-4 border-b border-white/[0.05] hidden md:block shadow-sm">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex items-center justify-center gap-2 lg:gap-4 overflow-x-auto no-scrollbar">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    // We scroll slightly above the card to ensure it sticks properly and the tab highlights
                    const el = document.getElementById(`track-${s.id}`);
                    if (el) {
                      const offset = window.innerWidth >= 768 ? 180 : 140;
                      const y = el.getBoundingClientRect().top + window.scrollY - offset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-300 ${activeTab === s.id
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="container mx-auto px-6 max-w-6xl mt-16 mb-12">
          <h2 className="text-sm font-bold text-[#A78BFA] uppercase tracking-widest mb-3">Community Tracks</h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">What You&apos;ll Learn</h3>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
            We focus on hands-on learning, building real projects, and mastering the technologies that power modern cloud ecosystems.
          </p>
        </div>

        {/* The Stacking Cards Container */}
        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative pb-20">
          {services.map((service, index) => (
            <TrackCard
              key={service.id}
              service={service}
              setActiveTab={setActiveTab}
              isLast={index === services.length - 1}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
