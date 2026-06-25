'use client';

import React from 'react';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'WhatsApp', href: 'https://wa.me/8953824852', icon: MessageCircle, color: 'hover:text-[#25D366]' },
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook, color: 'hover:text-[#1877F2]' },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram, color: 'hover:text-[#E1306C]' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin, color: 'hover:text-[#0A66C2]' }
  ];

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Why Insurance', href: '#why-insurance' },
    { name: 'Contact Us', href: '#contact' }
  ];

  return (
    <footer className="relative bg-brand-dark/98 border-t border-white/5 py-12 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8 mb-8">

          {/* Brand Info */}
          <div className="md:col-span-5 text-left">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg font-extrabold tracking-widest font-display sunset-text uppercase">
                Secure Choice
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              We specialize in Health, Life, and General Insurance consultancy. Empowering families and businesses across Kerala with customized policy decisions and dedicated claim settlement assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 text-left md:text-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-center">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="md:col-span-3 text-left md:text-right">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 md:mb-4">Follow Us</h4>
            <div className="flex gap-4 md:justify-end">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:scale-105 transition-all ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-left w-full text-[11px] text-gray-500">
          <p>© {currentYear} Secure Choice Insurance. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
