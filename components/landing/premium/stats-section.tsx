'use client'

import React from 'react'
import { motion } from 'framer-motion'

const stats = [
  { value: "0 to Post", label: "In Under 5 Minutes" },
  { value: "10x", label: "Content Velocity" },
  { value: "100%", label: "Local AI Privacy" },
  { value: "∞", label: "Cross-Platform Scale" }
]

export function StatsSection() {
  return (
    <section className="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden">
      
      {/* Background Video (Desaturated) */}
      <video
        src="https://cdn.coverr.co/videos/coverr-dark-abstract-background-6282/1080p.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-20 saturate-0"
      />

      {/* Gradient Fades */}
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="liquid-glass rounded-3xl p-10 md:p-16 w-full backdrop-blur-xl border border-white/5"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center space-y-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-white/60 font-body font-light text-sm tracking-wide uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </section>
  )
}
