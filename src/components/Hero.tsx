'use client';

import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';

interface HeroProps {
  onOpenConsultation: () => void;
}

export default function Hero({ onOpenConsultation }: HeroProps) {
  return (
    <section
      id="home"
      className="relative flex min-h-[90vh] flex-col items-center justify-center pt-24 pb-16 bg-brand-dark overflow-hidden"
    >
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="glow-orb glow-orb-primary absolute top-[20%] left-[10%] h-[350px] w-[350px] md:h-[500px] md:w-[500px] opacity-25 animate-pulse" />
        <div className="glow-orb glow-orb-secondary absolute top-[15%] right-[10%] h-[350px] w-[350px] md:h-[500px] md:w-[500px] opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 flex flex-col items-center gap-6">

        {/* Subtle Tagline */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wider text-brand-orange uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          Financial Consultancy & Advisory
        </div>

        {/* Logo */}
        <div className="mt-4 flex items-center justify-center gap-4 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-wider font-display sunset-text leading-none uppercase">
              Secure Choice
            </h2>
            <p className="text-xs text-gray-400 font-medium tracking-widest mt-1">
              Your Trust is Our Commitment
            </p>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-display max-w-4xl leading-tight">
          Your Financial Journey Starts with a <span className="sunset-text font-black">Simple Conversation.</span>
        </h1>

        {/* Subtitle description */}
        <p className="mt-4 max-w-2xl text-base text-gray-300 md:text-lg">
          Protecting your family's future, safeguarding your health, and securing your hard-earned assets. Get tailored financial advice from Thiruvananthapuram's trusted consultancy.
        </p>

        {/* Main Call to Action */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <button
            onClick={onOpenConsultation}
            className="sunset-gradient w-full sm:w-auto flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-98 cursor-pointer focus:outline-none"
          >
            <Calendar className="h-5 w-5" />
            Request Consultation
          </button>

          <a
            href="#services"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Explore Services
          </a>
        </div>

      </div>
    </section>
  );
}
