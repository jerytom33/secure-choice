'use client';

import React from 'react';
import { Target, ShieldCheck, Heart } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="relative py-24 bg-brand-dark/95 overflow-hidden border-t border-white/5">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="glow-orb glow-orb-secondary absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Image Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative max-w-md w-full aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img
                src="/assets/Copy of Health Insurance Flyer Poster.jfif"
                alt="Protecting Family"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="flex items-center gap-2 text-brand-orange mb-1">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-bold tracking-wider uppercase font-display">Trusted Partner</span>
                </div>
                <p className="text-xl font-bold text-white">Your protection is our priority.</p>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display">
              About <span className="sunset-text">Secure Choice</span>
            </h2>

            <p className="text-gray-300 text-base leading-relaxed">
              Secure Choice is a premier financial consultancy firm dedicated to helping individuals, families, and businesses choose the right insurance policies and plan their financial future. Our mission is to provide expert, unbiased guidance and tailored financial services that protect your loved ones and preserve your hard-earned assets.
            </p>

            <p className="text-gray-300 text-base leading-relaxed">
              Led by <strong className="text-white">Balasubramani S.</strong> an experienced financial consultant and advisor with a proven track record, we offer extensive expertise. Having previously collaborated with top-tier insurance organizations like Care Health, Axis Max Life, and ICICI Lombard, our advisory ensures you receive the highest standard of service and reliable claim support.
            </p>

            {/* Micro Cards/Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-orange/30 transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/25 text-brand-orange">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Our Mission</h4>
                  <p className="text-xs text-gray-400 mt-1">To simplify complex financial decisions and secure lives through custom coverage.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-pink/30 transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-pink/25 text-brand-pink">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Core Value</h4>
                  <p className="text-xs text-gray-400 mt-1">Providing honest, client-first advice, putting your financial well-being above all.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
