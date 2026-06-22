'use client';

import React, { useState } from 'react';
import { X, Calendar, Phone, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitConsultationRequest } from '@/lib/actions';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferred_date: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10+ digits)';
    }
    if (!formData.preferred_date) newErrors.preferred_date = 'Preferred date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const result = await submitConsultationRequest(formData);
      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', preferred_date: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#121212] border border-white/10 p-6 text-white shadow-2xl transition-all sm:p-8 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {submitStatus === 'success' ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-green-500/20 p-3 text-green-400 mb-4 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Consultation Scheduled!</h3>
            <p className="mt-2 text-sm text-gray-400 px-4">
              Thank you for reaching out. A financial consultant from Secure Choice will review your details and connect with you shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-gray-150 transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-white font-display">
                Request Consultation
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Provide your details below to schedule a one-on-one session with our financial advisors.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {submitStatus === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Something went wrong. Please try again later.</span>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full rounded-full border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all ${
                      errors.name ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className={`w-full rounded-full border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all ${
                      errors.email ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={`w-full rounded-full border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all ${
                      errors.phone ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
              </div>

              {/* Preferred Date Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className={`w-full rounded-full border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all dark:[color-scheme:dark] ${
                      errors.preferred_date ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                </div>
                {errors.preferred_date && (
                  <p className="mt-1 text-xs text-red-400">{errors.preferred_date}</p>
                )}
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Message / Special Requirements (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what insurance products or questions you have..."
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="sunset-gradient mt-2 w-full rounded-full py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-98 focus:outline-none flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Schedule Consultation'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
