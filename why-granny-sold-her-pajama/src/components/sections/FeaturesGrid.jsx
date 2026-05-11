import React from 'react';
import { motion } from 'motion/react';
import { Zap, Palette, BarChart3, Shield } from 'lucide-react';
import BlurText from '../BlurText';

const features = [
  {
    icon: Zap,
    title: "Days, Not Months",
    desc: "Concept to launch at a pace that redefines fast. Because waiting isn't a strategy."
  },
  {
    icon: Palette,
    title: "Obsessively Crafted",
    desc: "Every detail considered. Every element refined. Design so precise, it feels inevitable."
  },
  {
    icon: BarChart3,
    title: "Built to Convert",
    desc: "Layouts informed by data. Decisions backed by performance. Results you can measure."
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "Enterprise-grade protection comes standard. SSL, DDoS mitigation, compliance. All included."
  }
];

export default function FeaturesGrid() {
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
            Why Us
          </span>
        </motion.div>
        
        <BlurText 
          text="The difference is everything." 
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] justify-center text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="liquid-glass rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="liquid-glass-strong rounded-full w-12 h-12 flex items-center justify-center mb-6">
              <feature.icon className="w-5 h-5 text-white/90" strokeWidth={1.5} />
            </div>
            <h4 className="text-xl font-heading italic tracking-tight text-white mb-3">
              {feature.title}
            </h4>
            <p className="text-white/60 font-body font-light text-sm leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

    </section>
  );
}