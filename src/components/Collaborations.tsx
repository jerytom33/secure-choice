'use client';

import React from 'react';
import { Award, UserCheck, Landmark } from 'lucide-react';

export default function Collaborations() {
  const partners = [
    {
      name: 'Axis Max Life Insurance',
      image: '/assets/Axis Max Life Launches Nifty 500 Multifactor 50 Index Pension Fund for long-term retirement wealt___.jfif',
      fallbackText: 'AXIS MAX LIFE INSURANCE'
    },
    {
      name: 'Care Health Insurance',
      image: '/assets/Care Health - Customer App Apk Download.jfif',
      fallbackText: 'CARE HEALTH INSURANCE'
    },
    {
      name: 'ICICI Lombard General Insurance',
      image: '/assets/ICICI_logo.jpeg', // We will render this or standard fallback
      fallbackText: 'ICICI Lombard GENERAL INSURANCE'
    }
  ];

  return (
    <section id="collaborations" className="relative py-24 bg-brand-dark/95 border-t border-white/5 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0">
        <div className="glow-orb glow-orb-secondary absolute top-[10%] left-[-10%] h-[300px] w-[300px] opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Title Block */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display">
            Our <span className="sunset-text">Collaborations</span>
          </h2>
          <p className="mt-4 text-base text-gray-400">
            We partner with the industry's leading insurance providers to bring you the best coverage rates and reliable claim support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Consultant Profile Card Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative max-w-sm w-full bg-white/5 rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col items-center text-center group hover:border-brand-orange/30 transition-all">

              {/* Photo Frame */}
              <div className="h-44 w-44 rounded-full overflow-hidden border-4 border-brand-orange/30 shadow-lg mb-6 relative group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/assets/IMG-20250906-WA0022.jpg"
                  alt="Balasubramani S."
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Title Info */}
              <h3 className="text-xl font-extrabold text-white font-display tracking-wide">
                BALASUBRAMANI S.
              </h3>
              <p className="text-xs font-bold text-brand-orange uppercase tracking-widest mt-1">
                Founder & Lead Consultant
              </p>

              <hr className="w-16 border-white/10 my-4" />

              <p className="text-xs text-gray-400 leading-relaxed mb-6 px-2">
                Bringing over a decade of financial expertise to protect your family.
              </p>

              {/* Credentials list */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 text-left border border-white/5 text-xs text-gray-350">
                  <Landmark className="h-4 w-4 text-brand-orange shrink-0" />
                  <span>Deep experience with Axis Max Life and Care Health Insurances plans</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 text-left border border-white/5 text-xs text-gray-350">
                  <Award className="h-4 w-4 text-brand-pink shrink-0" />
                  <span>Licensed Axis Max Life & Care Health Consultant</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 text-left border border-white/5 text-xs text-gray-350">
                  <UserCheck className="h-4 w-4 text-brand-gold shrink-0" />
                  <span>Over 1,000+ satisfied clients across Kerala</span>
                </div>
              </div>

            </div>
          </div>

          {/* Collaborator Logos Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full">
            <h4 className="text-lg font-black tracking-wider uppercase font-display text-left text-gray-300 mb-2">
              Authorized Insurance Partners
            </h4>

            {partners.map((partner, index) => (
              <div
                key={partner.name}
                className="flex items-center justify-between bg-white rounded-3xl p-4 md:p-6 shadow-lg border border-gray-250 transition-all hover:scale-101 select-none"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-brand-dark/5 flex items-center justify-center font-bold text-brand-dark text-xs">
                    0{index + 1}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-brand-dark text-sm leading-tight md:text-base">
                      {partner.name}
                    </h5>
                    <p className="text-[10px] md:text-xs text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
                      Direct Claim Assistance Available
                    </p>
                  </div>
                </div>

                {/* Logo Image */}
                <div className="w-32 md:w-40 h-12 flex items-center justify-center overflow-hidden relative rounded-xl bg-gray-50 border border-gray-100 p-1">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      // If image fails to load, display stylized fallback text matching partner branding
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'text-[10px] md:text-xs font-black text-center text-brand-dark uppercase tracking-tighter px-1';
                        fallback.innerText = partner.fallbackText;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
