'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function InteractiveDemo() {
  return (
    <section className="relative w-full py-32 flex flex-col items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black pointer-events-none z-0" />
      
      <div className="relative z-10 text-center mb-16 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-full px-4 py-1.5 mb-6 inline-block"
        >
          <span className="text-white text-xs font-medium font-body uppercase tracking-wider">
            Live Interactive Demo
          </span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-heading italic text-white tracking-tight"
        >
          Experience the Mobile App
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-white/60 mt-4 font-body max-w-xl mx-auto"
        >
          Interact directly with the live Expo build of the Clavio Mobile Ecosystem right here in your browser.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
        className="relative z-10 w-[375px] h-[812px] bg-black rounded-[50px] border-[12px] border-[#1f2937] shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)' }}
      >
        <iframe 
          src="/mobile-demo/index.html" 
          className="w-full h-full"
          title="Clavio Mobile Interactive Demo"
        />
        {/* iPhone Notch Overlay */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center pointer-events-none">
          <div className="w-40 h-6 bg-[#1f2937] rounded-b-3xl"></div>
        </div>
      </motion.div>
    </section>
  )
}
