"use client"

import * as React from "react"
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
  return (
    <section id="blogs" className="py-24 bg-background border-t border-white/[0.05]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">Resources</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Latest from the Blog.</h3>
          </div>
          <button className="text-white/60 hover:text-white font-medium flex items-center gap-2 transition-colors">
            Read all posts <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
               <Card className="group h-full bg-card/20 border-white/[0.05] hover:border-white/20 transition-all cursor-pointer">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-xs font-bold rounded-full ${blog.color}`}>
                      {blog.tag}
                    </span>
                    <BookOpenText className="w-6 h-6 text-white/30 group-hover:text-secondary transition-colors" />
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">
                    {blog.title}
                  </h4>
                  <p className="text-white/50 mb-8 flex-1 text-sm leading-relaxed">
                    {blog.excerpt}
                  </p>
                  
                  <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mt-auto border-t border-white/[0.05] pt-4">
                    {blog.date}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
