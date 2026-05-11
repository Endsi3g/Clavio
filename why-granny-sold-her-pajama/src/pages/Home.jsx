import React from 'react';
import Hero from '../components/sections/Hero';
import StartSection from '../components/sections/StartSection';
import FeaturesChess from '../components/sections/FeaturesChess';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import Stats from '../components/sections/Stats';
import Testimonials from '../components/sections/Testimonials';
import CtaFooter from '../components/sections/CtaFooter';

export default function Home() {
  return (
    <main className="bg-black relative w-full h-full">
      <Hero />
      <div className="relative z-10 bg-black w-full flex flex-col items-center">
        <StartSection />
        <FeaturesChess />
        <FeaturesGrid />
        <Stats />
        <Testimonials />
        <CtaFooter />
      </div>
    </main>
  );
}