'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BlurText } from './blur-text'

export function CtaFooter() {
  return (
    <section className="relative w-full min-h-[800px] flex flex-col items-center justify-end overflow-hidden pt-32">
      
      {/* Background Video */}
      <video
        src="https://cdn.coverr.co/videos/coverr-stars-in-the-night-sky-5264/1080p.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
      />

      {/* Gradient Fades */}
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto w-full mb-20">
        
        <BlurText 
          text="Ready to scale your content?" 
          className="text-5xl md:text-6xl lg:text-7xl font-heading italic tracking-tight leading-[0.85] justify-center text-white mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-white/60 font-body font-light text-lg mb-10 max-w-xl mx-auto"
        >
          No complex workflows. No manual scheduling. Just pure creative momentum powered by local AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/signup" className="liquid-glass-strong hover:scale-105 transition-transform duration-300 rounded-full px-8 py-3.5 text-white font-medium text-sm w-full sm:w-auto text-center border border-white/20">
            Start Creating
          </Link>
          <Link href="/login" className="bg-white text-black hover:bg-white/90 transition-colors duration-300 rounded-full px-8 py-3.5 font-medium text-sm w-full sm:w-auto text-center">
            Sign In
          </Link>
        </motion.div>
      </div>

      {/* Footer Bar */}
      <div className="relative z-10 w-full border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-body font-light">
            © 2026 Clavio OS. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <Link 
                key={item} 
                href="/" 
                className="text-white/40 hover:text-white transition-colors text-xs font-body font-light"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
