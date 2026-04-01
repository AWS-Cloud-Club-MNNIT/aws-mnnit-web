"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, BookOpenText } from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"

const blogs = [
  {
    title: "Deploying Next.js to AWS Amplify: A Complete Guide",
    excerpt: "Learn how to use AWS Amplify Gen 2 to seamlessly host your full-stack Next.js applications.",
    date: "March 15, 2026",
    tag: "Next.js",
    color: "bg-black text-white px-3 py-1",
  },
  {
    title: "Mastering DynamoDB Single-Table Design",
    excerpt: "Break away from relational mental models and scale seamlessly with NoSQL data modeling.",
    date: "February 28, 2026",
    tag: "Database",
    color: "bg-blue-900 text-blue-100 px-3 py-1",
  },
  {
    title: "Zero to Hero with GitHub Actions & AWS ECR",
    excerpt: "Automate your container builds and push them securely to Amazon Elastic Container Registry.",
    date: "February 10, 2026",
    tag: "DevOps",
    color: "bg-aws-orange text-white px-3 py-1",
  },
]

export function Blog() {
  const router = useRouter();

  return (
    <section id="blogs" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sm font-bold text-[#A78BFA] uppercase tracking-[0.2em] mb-4"
            >
              Resources & Insights
            </motion.h2>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]"
            >
              Latest from the <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Blog.</span>
            </motion.h3>
          </div>
          <motion.button 
            onClick={() => router.push('/blogs')}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white font-semibold text-sm"
          >
            Read all posts 
            <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {blogs.map((blog, index) => {
            const isFeatured = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                className={isFeatured ? "md:col-span-7" : "md:col-span-5"}
              >
                <Card 
                  onClick={() => router.push('/coming-soon')}
                  className="group relative h-full bg-[#0D0F16]/50 backdrop-blur-sm border-white/[0.05] hover:border-[#A78BFA]/30 transition-all duration-500 cursor-pointer overflow-hidden rounded-[2rem]"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/0 via-[#7C3AED]/0 to-[#7C3AED]/0 group-hover:from-[#7C3AED]/5 group-hover:to-transparent transition-all duration-700" />
                  
                  <CardContent className={`p-8 md:p-10 lg:p-12 flex flex-col h-full relative z-10 ${isFeatured ? 'justify-center' : ''}`}>
                    <div className="flex items-center justify-between mb-8">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 group-hover:border-[#A78BFA]/20 group-hover:bg-[#A78BFA]/10 group-hover:text-[#A78BFA] transition-all duration-300`}>
                        {blog.tag}
                      </span>
                      <BookOpenText weight="duotone" className="w-8 h-8 text-white/20 group-hover:text-[#A78BFA] transition-all duration-500 transform group-hover:rotate-12" />
                    </div>
                    
                    <h4 className={`${isFeatured ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'} font-bold text-white mb-6 leading-tight group-hover:text-[#A78BFA] transition-colors duration-300`}>
                      {blog.title}
                    </h4>
                    
                    <p className={`text-[#8892B0] mb-10 text-base leading-relaxed ${isFeatured ? 'max-w-md' : ''}`}>
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/[0.05]">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                        {blog.date}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                        <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
