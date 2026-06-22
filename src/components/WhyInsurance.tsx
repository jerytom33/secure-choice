'use client';

import React from 'react';
import { 
  HeartHandshake, 
  Users, 
  HeartPulse, 
  Award, 
  Target, 
  Smile, 
  LifeBuoy 
} from 'lucide-react';

export default function WhyInsurance() {
  const benefits = [
    {
      title: 'Protect After Retirement',
      description: 'Post-retirement planning is essential for sustaining your lifestyle and ensuring long-term financial independence.',
      icon: HeartHandshake,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Financial Security for Loved Ones',
      description: 'Provide an essential safety net to protect your family from unexpected life events and sudden loss of income.',
      icon: Users,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Comprehensive Health Cover',
      description: 'Gain access to top-tier medical care without worrying about out-of-pocket costs or exhausting savings.',
      icon: HeartPulse,
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'Safeguard Wealth for Heirs',
      description: 'Secure your family\'s legacy by purchasing long-term assets and facilitating smooth wealth transition.',
      icon: Award,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Goal-Tracked Consultations',
      description: 'We align insurance plans with your life milestones, including child education, marriage, and home buying.',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Absolute Peace of Mind',
      description: 'Live confidently knowing that you and your family are completely protected against unforeseen challenges.',
      icon: Smile,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Hassle-Free Claim Support',
      description: 'Expert guidance through the documentation and filing stages to ensure your claims are processed smoothly.',
      icon: LifeBuoy,
      color: 'from-yellow-500 to-amber-600',
    },
  ];

  return (
    <section id="why-insurance" className="relative py-24 bg-brand-dark border-t border-white/5">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="glow-orb glow-orb-primary absolute top-[30%] right-[10%] h-[350px] w-[350px] opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Title Header */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display">
            Why <span className="sunset-text">Insurance Matters</span>
          </h2>
          <p className="mt-4 text-base text-gray-400">
            Insurance is not just a policy; it is a foundation of security for your dreams, your assets, and your family's future.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className={`flex flex-col p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:scale-102 hover:shadow-xl hover:shadow-brand-orange/5 group text-left ${
                  index === 6 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.color} text-white shadow-md mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed flex-grow">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-16 p-8 rounded-3xl bg-white/5 border border-white/10 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-left hover:border-brand-orange/20 transition-all">
          <div>
            <h4 className="text-lg font-bold text-white">Protect Today, Secure Tomorrow!</h4>
            <p className="text-sm text-gray-400 mt-1">Choose the right insurance policy that safeguards you and your loved ones from uncertainty.</p>
          </div>
          <a
            href="#services"
            className="sunset-gradient rounded-full px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 hover:scale-103 transition-all inline-block text-center shrink-0 w-full sm:w-auto"
          >
            Select a Service Form
          </a>
        </div>

      </div>
    </section>
  );
}
