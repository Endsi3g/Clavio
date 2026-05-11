'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BlurText } from './blur-text'
import Link from 'next/link'

export function StartSection() {
  return (
    <section className="relative w-full min-h-[700px] flex items-center justify-center py-32 overflow-hidden">
      {/* Background Video */}
      <video
        src="https://cdn.coverr.co/videos/coverr-dark-waves-5244/1080p.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
      />

      {/* Gradient Fades */}
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-full px-4 py-1.5 mb-8"
        >
          <span className="text-white text-xs font-medium font-body uppercase tracking-wider">
            The Process
          </span>
        </motion.div>

        <BlurText 
          text="You dream it. Clavio ships it." 
          className="text-5xl md:text-6xl lg:text-7xl font-heading italic tracking-tight leading-[0.9] justify-center text-white mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-white/60 font-body font-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Share your vision. Our AI handles the rest: hooks, scripts, video rendering, and multi-platform publishing. All in minutes, not days.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link href="/signup" className="liquid-glass-strong hover:scale-105 transition-transform duration-300 rounded-full px-8 py-4 text-white font-medium text-sm inline-flex">
            Get Started
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
