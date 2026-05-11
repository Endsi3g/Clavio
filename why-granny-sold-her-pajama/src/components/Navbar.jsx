import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3 flex items-center justify-between pointer-events-none">
      {/* Logo */}
      <div className="pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10">
        <iconify-icon icon="solar:box-minimalistic-linear" width="24" height="24" className="text-white"></iconify-icon>
      </div>

      {/* Center Links (Desktop) */}
      <div className="pointer-events-auto hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1">
        {['Home', 'Services', 'Work', 'Process', 'Pricing'].map((item) => (
          <Link
            key={item}
            to="/"
            className="px-4 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors"
          >
            {item}
          </Link>
        ))}
        <button className="bg-white text-black hover:bg-white/90 transition-colors rounded-full px-3.5 py-1.5 text-sm font-medium flex items-center gap-1.5 ml-2">
          Get Started
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Mobile Menu Spacer/Trigger Placeholder */}
      <div className="md:hidden pointer-events-auto liquid-glass rounded-full p-3 flex items-center justify-center">
         <iconify-icon icon="solar:hamburger-menu-linear" width="24" height="24" className="text-white"></iconify-icon>
      </div>
    </nav>
  );
}