import React from 'react';
import { motion } from 'motion/react';
import BlurText from '../BlurText';

const reviews = [
  {
    quote: "A complete rebuild in five days. The result outperformed everything we'd spent months building before.",
    name: "Sarah Chen",
    role: "CEO, Luminary"
  },
  {
    quote: "Conversions up 4x. That's not a typo. The design just works differently when it's built on real data.",
    name: "Marcus Webb",
    role: "Head of Growth, Arcline"
  },
  {
    quote: "They didn't just design our site. They defined our brand. World-class doesn't begin to cover it.",
    name: "Elena Voss",
    role: "Brand Director, Helix"
  }
];

export default function Testimonials() {
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
              <iconify-icon icon="solar:quote-left-bold-duotone" width="32" className="text-white/20 mb-4"></iconify-icon>
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
  );
}