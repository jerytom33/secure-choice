'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { submitGeneralLead } from '@/lib/actions';

export default function GeneralForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    pincode: '',
    state: '',
    insurance_type: 'Motor'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const insuranceTypes = ['Motor (Car/Bike)', 'Home / House', 'Business / Shop', 'Commercial Property', 'Marine / Transit', 'Other'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.contact.trim()) {
      newErrors.contact = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,15}$/.test(formData.contact.replace(/\s+/g, ''))) {
      newErrors.contact = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    if (!formData.state.trim()) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.debug('GeneralForm: handleSubmit invoked', formData);
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await submitGeneralLead(formData);
      if (result.success) {
        setIsSuccess(true);
        setFormData({
          name: '',
          contact: '',
          email: '',
          address: '',
          pincode: '',
          state: '',
          insurance_type: 'Motor'
        });
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="general-form" className="relative py-20 bg-[#FDB833] text-brand-dark overflow-hidden border-t-2 border-brand-dark/10 pb-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <div className="mb-10 text-left border-l-8 border-brand-dark pl-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase font-display">
            General Insurance
          </h2>
          <p className="text-sm font-bold text-brand-dark/80 mt-1 uppercase tracking-wider">
            Lead Generation and Inquiry Form
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-brand-dark text-white rounded-[30px] p-8 md:p-12 text-center shadow-2xl animate-scaleUp">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 mb-6">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold font-display">Details Received Successfully!</h3>
            <p className="mt-4 text-sm text-gray-400 max-w-xl mx-auto">
              Thank you for choosing Secure Choice. Our dedicated General Insurance consultant will analyze your details and contact you at the earliest possible.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-8 bg-brand-gold text-brand-dark px-8 py-3 rounded-full text-sm font-bold hover:scale-105 transition-all"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-brand-dark/5 p-6 sm:p-10 rounded-[35px] border border-brand-dark/10 shadow-sm">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/20 p-6 sm:p-8 rounded-[30px] border border-brand-dark/5">

              {/* Type of Insurance */}
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold mb-1.5 uppercase text-brand-dark/80">
                  What is to be insured? (Select Requirement)
                </label>
                <select
                  value={formData.insurance_type}
                  onChange={(e) => setFormData({ ...formData, insurance_type: e.target.value })}
                  className="w-full rounded-full border border-brand-dark/10 bg-white py-2.5 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-dark"
                >
                  {insuranceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proposer Name */}
              <div>
                <label className="block text-xs font-extrabold mb-1.5 uppercase text-brand-dark/80">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className={`w-full rounded-full border bg-white py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-dark ${errors.name ? 'border-red-500' : 'border-brand-dark/10'
                    }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600 font-bold">{errors.name}</p>}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-extrabold mb-1.5 uppercase text-brand-dark/80">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Enter phone number"
                  className={`w-full rounded-full border bg-white py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-dark ${errors.contact ? 'border-red-500' : 'border-brand-dark/10'
                    }`}
                />
                {errors.contact && <p className="mt-1 text-xs text-red-600 font-bold">{errors.contact}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-extrabold mb-1.5 uppercase text-brand-dark/80">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className={`w-full rounded-full border bg-white py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-dark ${errors.email ? 'border-red-500' : 'border-brand-dark/10'
                    }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600 font-bold">{errors.email}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-extrabold mb-1.5 uppercase text-brand-dark/80">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Flat/Street name"
                  className={`w-full rounded-full border bg-white py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-dark ${errors.address ? 'border-red-500' : 'border-brand-dark/10'
                    }`}
                />
                {errors.address && <p className="mt-1 text-xs text-red-600 font-bold">{errors.address}</p>}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-extrabold mb-1.5 uppercase text-brand-dark/80">
                  Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="600001"
                  className={`w-full rounded-full border bg-white py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-dark ${errors.pincode ? 'border-red-500' : 'border-brand-dark/10'
                    }`}
                />
                {errors.pincode && <p className="mt-1 text-xs text-red-600 font-bold">{errors.pincode}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-extrabold mb-1.5 uppercase text-brand-dark/80">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Tamil Nadu"
                  className={`w-full rounded-full border bg-white py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-dark ${errors.state ? 'border-red-500' : 'border-brand-dark/10'
                    }`}
                />
                {errors.state && <p className="mt-1 text-xs text-red-600 font-bold">{errors.state}</p>}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col items-center gap-4 pt-4 border-t border-brand-dark/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-brand-dark hover:opacity-95 text-white rounded-full px-12 py-4 text-sm font-bold shadow-lg transition-transform hover:scale-102 active:scale-98 flex items-center justify-center min-w-[200px]"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'SUBMIT DETAILS'
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-brand-dark/70 font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Our Financial Consultant will Contact you at the Earliest.</span>
              </div>
            </div>

          </form>
        )}
      </div>
    </section>
  );
}
