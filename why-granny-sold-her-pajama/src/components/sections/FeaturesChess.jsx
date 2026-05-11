import React from 'react';
import { motion } from 'motion/react';
import BlurText from '../BlurText';

export default function FeaturesChess() {
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
            Designed to convert.<br />Built to perform.
          </h3>
          <p className="text-white/60 font-body font-light text-lg leading-relaxed max-w-md">
            Every pixel is intentional. Our AI studies what works across thousands of top sites—then builds yours to outperform them all.
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
          <div className="liquid-glass rounded-2xl p-2 w-full aspect-video md:aspect-[4/3] overflow-hidden group">
            <img 
              src="https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif" 
              alt="Feature preview" 
              className="w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
            />
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
            It gets smarter.<br />Automatically.
          </h3>
          <p className="text-white/60 font-body font-light text-lg leading-relaxed max-w-md">
            Your site evolves on its own. AI monitors every click, scroll, and conversion—then optimizes in real time. No manual updates. Ever.
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
          <div className="liquid-glass rounded-2xl p-2 w-full aspect-video md:aspect-[4/3] overflow-hidden group">
            <img 
              src="https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif" 
              alt="Optimization preview" 
              className="w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
            />
          </div>
        </motion.div>
      </div>

    </section>
  );
}