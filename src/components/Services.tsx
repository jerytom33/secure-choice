'use client';

import React from 'react';
import { Heart, ShieldAlert, Car } from 'lucide-react';

export default function Services() {
  const services = [
    {
      title: 'HEALTH INSURANCE',
      description: 'Coverage for medical expenses for complete peace of mind.',
      image: '/assets/Download health insurance image for free.jfif',
      formId: '#health-form',
      icon: Heart,
      iconColor: 'text-red-500',
    },
    {
      title: 'LIFE INSURANCE',
      description: 'Financial protection for your family\'s future and goals.',
      image: '/assets/Father shaking hands with insurance agent _ Free Vector.jfif',
      formId: '#life-form',
      icon: ShieldAlert,
      iconColor: 'text-blue-500',
    },
    {
      title: 'GENERAL INSURANCE',
      description: 'Safeguard your valuable assets like motor, car, house, and business.',
      image: '/assets/Insurance Plan , Investment.jfif',
      formId: '#general-form',
      icon: Car,
      iconColor: 'text-amber-500',
    },
  ];

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, formId: string) => {
    e.preventDefault();
    const element = document.querySelector(formId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="services" className="relative py-24 bg-brand-dark/95 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Title Block */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display">
            Services We <span className="sunset-text">Provide</span>
          </h2>
          <p className="mt-4 text-base text-gray-400">
            Click on any service card below to immediately jump to its customized consultation and inquiry form.
          </p>
        </div>

        {/* Services Grid (Styled Peach/Yellow Card aesthetic matching Canva) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <a
                key={service.title}
                href={service.formId}
                onClick={(e) => handleCardClick(e, service.formId)}
                className="group flex flex-col items-center bg-[#FDB833] rounded-[40px] p-6 text-brand-dark shadow-2xl transition-all hover:scale-103 hover:shadow-brand-orange/10 cursor-pointer border-4 border-transparent hover:border-white/20"
              >
                {/* Image Wrap */}
                <div className="w-full aspect-[4/3] rounded-[30px] overflow-hidden bg-white/30 border border-brand-dark/10 shadow-inner mb-6 relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback placeholder if image is missing
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-brand-dark/90 backdrop-blur-md p-2.5 rounded-2xl text-white shadow-md">
                    <Icon className={`h-5 w-5 ${service.iconColor}`} />
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="text-xl font-black tracking-wider font-display mb-2">
                  {service.title}
                </h3>
                
                {/* Service Description */}
                <p className="text-sm font-semibold text-brand-dark/80 px-2 leading-relaxed text-center mb-4">
                  {service.description}
                </p>

                {/* Bottom interactive indicator */}
                <div className="mt-auto bg-brand-dark text-[#FDB833] rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider group-hover:bg-brand-dark/90 transition-colors">
                  Fill Form ↓
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
