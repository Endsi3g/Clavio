'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { BlurText } from './blur-text'

const reviews = [
  {
    quote: "A complete rebuild of our content pipeline in five days. The result outperformed everything we'd spent months building before.",
    name: "Sarah Chen",
    role: "Creator, TechDaily"
  },
  {
    quote: "Views up 4x. That's not a typo. The retention just works differently when your edits are automated.",
    name: "Marcus Webb",
    role: "Head of Content, Arcline"
  },
  {
    quote: "It didn't just save us time. It defined our brand cadence. World-class doesn't begin to cover it.",
    name: "Elena Voss",
    role: "Agency Director, Helix"
  }
]

export function TestimonialsSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
      
      <div className="flex flex-col items-center text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-full px-4 py-1.5 mb-6"
        >
          <span className="text-white text-xs font-medium font-body uppercase tracking-wider">
            What They Say
          </span>
        </motion.div>
        
        <BlurText 
          text="Don't take our word for it." 
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] justify-center text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.15, duration: 0.6 }}
            className="liquid-glass rounded-2xl p-8 flex flex-col justify-between h-full"
          >
            <div className="mb-8">
              <Quote className="w-8 h-8 text-white/20 mb-4" />
              <p className="text-white/80 font-body font-light text-lg italic leading-relaxed">
                "{review.quote}"
              </p>
            </div>
            
            <div className="mt-auto">
              <div className="text-white font-body font-medium text-sm">
                {review.name}
              </div>
              <div className="text-white/50 font-body font-light text-xs mt-0.5">
                {review.role}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  )
}
