'use client';

import React from 'react';
import { MapPin, Mail, Phone, Clock, CalendarRange } from 'lucide-react';

interface ContactProps {
  onOpenConsultation: () => void;
}

export default function Contact({ onOpenConsultation }: ContactProps) {
  const contactInfo = {
    address: '118 Vaishnavam, Sree Ram Nagar, Karamana, Trivandrum - 695002.',
    email: 'balasubramani@securechoice.in',
    phones: ['+91 8953824852', '+91 9454557492'],
    hours: 'Monday - Saturday: 9:00 AM - 7:00 PM'
  };

  return (
    <section id="contact" className="relative py-24 bg-brand-dark overflow-hidden border-t border-white/5">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0">
        <div className="glow-orb glow-orb-primary absolute bottom-[-10%] left-[20%] h-[350px] w-[350px] opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Details Column */}
          <div className="lg:col-span-6 flex flex-col gap-8 text-left">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display">
                Contact <span className="sunset-text">Us</span>
              </h2>
              <p className="mt-4 text-base text-gray-400">
                Have questions about custom policy choices or need assistance with insurance claims? Drop by our office or call us directly.
              </p>
            </div>

            {/* Details Cards */}
            <div className="space-y-4">

              {/* Address */}
              <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-orange/20 transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange/25 text-brand-orange">
                  <MapPin className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Main Office</h4>
                  <p className="text-sm text-white mt-1 leading-relaxed">{contactInfo.address}</p>
                </div>
              </div>

              {/* Email */}
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-pink/20 transition-all group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-pink/25 text-brand-pink">
                  <Mail className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Email Address</h4>
                  <p className="text-sm text-white mt-1 group-hover:text-brand-pink transition-colors">{contactInfo.email}</p>
                </div>
              </a>

              {/* Phone */}
              <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/20 transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gold/25 text-brand-gold">
                  <Phone className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Phone Number</h4>
                  <div className="flex flex-col gap-1 mt-1">
                    {contactInfo.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/\s+/g, '')}`}
                        className="text-sm text-white hover:text-brand-gold transition-colors inline-block"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/15 transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Clock className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Consulting Hours</h4>
                  <p className="text-sm text-white mt-1">{contactInfo.hours}</p>
                </div>
              </div>

            </div>

            {/* Schedule Button */}
            <div className="mt-2 text-left">
              <button
                onClick={onOpenConsultation}
                className="sunset-gradient flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-98 cursor-pointer focus:outline-none"
              >
                <CalendarRange className="h-5 w-5" />
                Schedule a Consultation
              </button>
            </div>
          </div>

          {/* Wooden blocks image column */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-md w-full aspect-square rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10" />
              <img
                src="/assets/Insurance Plan , Investment.jfif"
                alt="Insurance Planning Blocks"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <span className="sunset-gradient text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                  Planning
                </span>
                <h4 className="text-xl font-bold text-white mt-3">Comprehensive Asset Coverage</h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Protecting your health, securing your family, and covering your assets under one single, verified advisory framework.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
