'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BlurText } from './blur-text'

export function FeaturesChess() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col gap-24 md:gap-32">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-full px-4 py-1.5 mb-6"
        >
          <span className="text-white text-xs font-medium font-body uppercase tracking-wider">
            Capabilities
          </span>
        </motion.div>
        
        <BlurText 
          text="Pro features. Zero complexity." 
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] justify-center text-white"
        />
      </div>

      {/* Row 1 */}
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-6"
        >
          <h3 className="text-3xl md:text-4xl font-heading italic text-white tracking-tight leading-tight">
            Ideas that write themselves.<br />Built to engage.
          </h3>
          <p className="text-white/60 font-body font-light text-lg leading-relaxed max-w-md">
            Every script is intentional. Our AI studies what works across thousands of viral posts, then builds your content to outperform them all.
          </p>
          <button className="liquid-glass-strong hover:bg-white/5 transition-colors rounded-full px-6 py-3 text-white font-medium text-sm mt-4">
            Learn more
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full"
        >
          <div className="liquid-glass rounded-2xl p-2 w-full aspect-video md:aspect-[4/3] overflow-hidden group relative">
            {/* Using a placeholder gradient or image for the "Gif" */}
            <div className="w-full h-full bg-slate-900 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 mix-blend-screen"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white/20 font-heading text-4xl italic">Ideation Engine</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-6 lg:pl-10"
        >
          <h3 className="text-3xl md:text-4xl font-heading italic text-white tracking-tight leading-tight">
            Render while you sleep.<br />Automatically.
          </h3>
          <p className="text-white/60 font-body font-light text-lg leading-relaxed max-w-md">
            Your workflow evolves on its own. Clavio automatically renders video assets, extracts clips, and queues them for publishing. No manual editing. Ever.
          </p>
          <button className="liquid-glass-strong hover:bg-white/5 transition-colors rounded-full px-6 py-3 text-white font-medium text-sm mt-4">
            See how it works
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full"
        >
          <div className="liquid-glass rounded-2xl p-2 w-full aspect-video md:aspect-[4/3] overflow-hidden group relative">
            <div className="w-full h-full bg-slate-900 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-600/20 mix-blend-screen"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white/20 font-heading text-4xl italic">Video Processing</div>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  )
}
