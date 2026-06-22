'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import WhyInsurance from '@/components/WhyInsurance';
import Services from '@/components/Services';
import HealthForm from '@/components/HealthForm';
import LifeForm from '@/components/LifeForm';
import GeneralForm from '@/components/GeneralForm';
import Collaborations from '@/components/Collaborations';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ConsultationModal from '@/components/ConsultationModal';

export default function Home() {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const openConsultation = () => setIsConsultationOpen(true);
  const closeConsultation = () => setIsConsultationOpen(false);

  return (
    <div className="relative min-h-screen bg-brand-dark flex flex-col">
      {/* Navigation */}
      <Navbar onOpenConsultation={openConsultation} />

      {/* Floating CTA Widgets */}
      <WhatsAppButton />

      {/* Shared consultation modal overlay */}
      <ConsultationModal isOpen={isConsultationOpen} onClose={closeConsultation} />

      {/* Page Content */}
      <main className="flex-grow">
        {/* 1. Hero Section */}
        <Hero onOpenConsultation={openConsultation} />

        {/* 2. About Us Section */}
        <About />

        {/* 3. Why Insurance Matters */}
        <WhyInsurance />

        {/* 4. Services We Provide */}
        <Services />

        {/* 5. Health Insurance Form */}
        <HealthForm />

        {/* 6. Life Insurance Form */}
        <LifeForm />

        {/* 7. General Insurance Form */}
        <GeneralForm />

        {/* 8. Collaborations Section */}
        <Collaborations />

        {/* 9. Contact Us Section */}
        <Contact onOpenConsultation={openConsultation} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
