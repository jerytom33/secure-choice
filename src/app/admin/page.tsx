'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Heart,
  ShieldAlert,
  Car,
  CalendarRange,
  Search,
  Download,
  LogOut,
  HelpCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  LayoutDashboard
} from 'lucide-react';
import { getLeads, logoutAdmin, checkAdminSession } from '@/lib/actions';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Leads data
  const [leads, setLeads] = useState<{
    health: any[];
    life: any[];
    general: any[];
    consultation: any[];
  }>({
    health: [],
    life: [],
    general: [],
    consultation: []
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'life' | 'general' | 'consultation'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Authenticate admin session
    checkAdminSession().then((isAuth) => {
      setIsAuthenticated(isAuth);
      if (!isAuth) {
        router.push('/admin/login');
      } else {
        // Fetch lead data
        getLeads()
          .then((data) => {
            setLeads({
              health: data.health || [],
              life: data.life || [],
              general: data.general || [],
              consultation: data.consultation || []
            });
          })
          .catch((err) => {
            console.error('Error fetching leads:', err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    });
  }, [router]);

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="flex min-h-screen bg-brand-dark items-center justify-center text-white">
        <svg className="animate-spin h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/admin/login');
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // CSV Exporter
  const exportToCSV = (type: 'health' | 'life' | 'general' | 'consultation') => {
    const dataToExport = leads[type];
    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }

    let csvContent = '';

    if (type === 'health') {
      csvContent += 'ID,Name,Contact,Email,Address,Pincode,State,Family Members Count,Created At\n';
      dataToExport.forEach((item) => {
        const familyCount = Array.isArray(item.family_members) ? item.family_members.length : 0;
        csvContent += `"${item.id}","${item.name}","${item.contact}","${item.email}","${item.address || ''}","${item.pincode || ''}","${item.state || ''}",${familyCount},"${item.created_at}"\n`;
      });
    } else if (type === 'life') {
      csvContent += 'ID,Name,Contact,Email,DOB,Profession,Annual Income,Existing Policies,Created At\n';
      dataToExport.forEach((item) => {
        csvContent += `"${item.id}","${item.name}","${item.contact}","${item.email}","${item.dob || ''}","${item.profession || ''}","${item.annual_income || ''}","${item.existing_policies || ''}","${item.created_at}"\n`;
      });
    } else if (type === 'general') {
      csvContent += 'ID,Name,Contact,Email,Address,Pincode,State,Insurance Type,Created At\n';
      dataToExport.forEach((item) => {
        csvContent += `"${item.id}","${item.name}","${item.contact}","${item.email}","${item.address || ''}","${item.pincode || ''}","${item.state || ''}","${item.insurance_type}","${item.created_at}"\n`;
      });
    } else if (type === 'consultation') {
      csvContent += 'ID,Name,Email,Phone,Preferred Date,Message,Status,Created At\n';
      dataToExport.forEach((item) => {
        csvContent += `"${item.id}","${item.name}","${item.email}","${item.phone}","${item.preferred_date || ''}","${item.message || ''}","${item.status}","${item.created_at}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lead metrics calculations
  const totalHealth = leads.health.length;
  const totalLife = leads.life.length;
  const totalGeneral = leads.general.length;
  const totalConsultations = leads.consultation.length;
  const totalLeads = totalHealth + totalLife + totalGeneral + totalConsultations;

  // Filter lists based on Search
  const getFilteredList = (list: any[]) => {
    return list.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const contact = (item.contact || item.phone || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query) || contact.includes(query);
    });
  };

  const filteredHealth = getFilteredList(leads.health);
  const filteredLife = getFilteredList(leads.life);
  const filteredGeneral = getFilteredList(leads.general);
  const filteredConsultation = getFilteredList(leads.consultation);

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {/* Header bar */}
      <header className="border-b border-white/10 bg-[#0d0d0d] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src=" " alt="Secure Choice" className="h-8 w-auto" />
          <div>
            <h1 className="text-lg font-extrabold tracking-wider font-display sunset-text uppercase leading-none">
              Secure Choice
            </h1>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1 block">
              Dashboard Control Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-xs font-bold border border-white/10 rounded-full px-4 py-2 text-gray-300 hover:text-white transition-all active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <div className="flex-grow flex flex-col md:flex-row">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-[#0a0a0a] border-r border-white/5 p-4 flex flex-col gap-2 shrink-0 text-left">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-2 block">
            Navigation
          </span>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'overview'
                ? 'bg-brand-orange/15 text-brand-orange border-l-4 border-brand-orange'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            Analytics Overview
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'health'
                ? 'bg-brand-orange/15 text-brand-orange border-l-4 border-brand-orange'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
          >
            <Heart className="h-4.5 w-4.5 text-red-500" />
            Health Insurance ({totalHealth})
          </button>

          <button
            onClick={() => setActiveTab('life')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'life'
                ? 'bg-brand-orange/15 text-brand-orange border-l-4 border-brand-orange'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
          >
            <ShieldAlert className="h-4.5 w-4.5 text-blue-500" />
            Life Insurance ({totalLife})
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'general'
                ? 'bg-brand-orange/15 text-brand-orange border-l-4 border-brand-orange'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
          >
            <Car className="h-4.5 w-4.5 text-amber-500" />
            General Insurance ({totalGeneral})
          </button>

          <button
            onClick={() => setActiveTab('consultation')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'consultation'
                ? 'bg-brand-orange/15 text-brand-orange border-l-4 border-brand-orange'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
          >
            <CalendarRange className="h-4.5 w-4.5 text-emerald-500" />
            Consultation Requests ({totalConsultations})
          </button>
        </aside>

        {/* Dashboard Area */}
        <main className="flex-grow p-6 md:p-8 flex flex-col gap-8 bg-brand-dark relative z-10 text-left">

          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">

                  {/* Title Block */}
                  <div>
                    <h2 className="text-2xl font-extrabold font-display">Analytics Dashboard</h2>
                    <p className="text-xs text-gray-400 mt-1">Real-time statistics of secure leads generated through landing forms.</p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-brand-orange/20 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Leads</span>
                        <Users className="h-4.5 w-4.5 text-brand-orange" />
                      </div>
                      <span className="text-3xl font-black font-display text-white">{totalLeads}</span>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-red-500/20 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Health</span>
                        <Heart className="h-4.5 w-4.5 text-red-500" />
                      </div>
                      <span className="text-3xl font-black font-display text-white">{totalHealth}</span>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-blue-500/20 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Life</span>
                        <ShieldAlert className="h-4.5 w-4.5 text-blue-500" />
                      </div>
                      <span className="text-3xl font-black font-display text-white">{totalLife}</span>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">General</span>
                        <Car className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                      <span className="text-3xl font-black font-display text-white">{totalGeneral}</span>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Consultations</span>
                        <CalendarRange className="h-4.5 w-4.5 text-emerald-500" />
                      </div>
                      <span className="text-3xl font-black font-display text-white">{totalConsultations}</span>
                    </div>

                  </div>

                  {/* SVG Charts section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Donut Chart (Breakdown) */}
                    <div className="lg:col-span-5 bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-between">
                      <div className="w-full text-left mb-4">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-300 font-display">Lead Breakdown</h3>
                        <p className="text-[10px] text-gray-500">Percentage distribution of captured leads by product.</p>
                      </div>

                      {totalLeads > 0 ? (
                        <div className="relative flex items-center justify-center h-48 w-48">
                          {/* SVG Donut */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1d1d1d" strokeWidth="4" />
                            {/* Health circle */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4"
                              strokeDasharray={`${(totalHealth / totalLeads) * 100} ${100 - (totalHealth / totalLeads) * 100}`}
                              strokeDashoffset="0"
                            />
                            {/* Life circle */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4"
                              strokeDasharray={`${(totalLife / totalLeads) * 100} ${100 - (totalLife / totalLeads) * 100}`}
                              strokeDashoffset={-((totalHealth / totalLeads) * 100)}
                            />
                            {/* General circle */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4"
                              strokeDasharray={`${(totalGeneral / totalLeads) * 100} ${100 - (totalGeneral / totalLeads) * 100}`}
                              strokeDashoffset={-(((totalHealth + totalLife) / totalLeads) * 100)}
                            />
                            {/* Consultations circle */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4"
                              strokeDasharray={`${(totalConsultations / totalLeads) * 100} ${100 - (totalConsultations / totalLeads) * 100}`}
                              strokeDashoffset={-(((totalHealth + totalLife + totalGeneral) / totalLeads) * 100)}
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-2xl font-black font-display">{totalLeads}</span>
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Total</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-xs text-gray-500 font-semibold">
                          No data to plot charts
                        </div>
                      )}

                      <div className="w-full grid grid-cols-2 gap-2 mt-6 text-xs font-semibold">
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="h-3 w-3 rounded bg-red-500 inline-block shrink-0" />
                          <span>Health ({totalLeads > 0 ? Math.round((totalHealth / totalLeads) * 100) : 0}%)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="h-3 w-3 rounded bg-blue-500 inline-block shrink-0" />
                          <span>Life ({totalLeads > 0 ? Math.round((totalLife / totalLeads) * 100) : 0}%)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="h-3 w-3 rounded bg-amber-500 inline-block shrink-0" />
                          <span>General ({totalLeads > 0 ? Math.round((totalGeneral / totalLeads) * 100) : 0}%)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="h-3 w-3 rounded bg-emerald-500 inline-block shrink-0" />
                          <span>Consult ({totalLeads > 0 ? Math.round((totalConsultations / totalLeads) * 100) : 0}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Bar Chart (Lead Volumes) */}
                    <div className="lg:col-span-7 bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                      <div className="w-full text-left mb-4">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-300 font-display">Inquiry Volumes</h3>
                        <p className="text-[10px] text-gray-500">Comparison of inquiries received across different products.</p>
                      </div>

                      {totalLeads > 0 ? (
                        <div className="h-48 flex items-end justify-between px-6 pb-2 border-b border-white/10">
                          {/* Health Bar */}
                          <div className="flex flex-col items-center gap-2 w-16">
                            <span className="text-xs font-bold text-red-400">{totalHealth}</span>
                            <div
                              className="w-8 bg-red-500 rounded-t-lg transition-all duration-1000"
                              style={{ height: `${(totalHealth / Math.max(totalHealth, totalLife, totalGeneral, totalConsultations, 1)) * 110 + 10}px` }}
                            />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Health</span>
                          </div>

                          {/* Life Bar */}
                          <div className="flex flex-col items-center gap-2 w-16">
                            <span className="text-xs font-bold text-blue-400">{totalLife}</span>
                            <div
                              className="w-8 bg-blue-500 rounded-t-lg transition-all duration-1000"
                              style={{ height: `${(totalLife / Math.max(totalHealth, totalLife, totalGeneral, totalConsultations, 1)) * 110 + 10}px` }}
                            />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Life</span>
                          </div>

                          {/* General Bar */}
                          <div className="flex flex-col items-center gap-2 w-16">
                            <span className="text-xs font-bold text-amber-400">{totalGeneral}</span>
                            <div
                              className="w-8 bg-amber-500 rounded-t-lg transition-all duration-1000"
                              style={{ height: `${(totalGeneral / Math.max(totalHealth, totalLife, totalGeneral, totalConsultations, 1)) * 110 + 10}px` }}
                            />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">General</span>
                          </div>

                          {/* Consultation Bar */}
                          <div className="flex flex-col items-center gap-2 w-16">
                            <span className="text-xs font-bold text-emerald-400">{totalConsultations}</span>
                            <div
                              className="w-8 bg-emerald-500 rounded-t-lg transition-all duration-1000"
                              style={{ height: `${(totalConsultations / Math.max(totalHealth, totalLife, totalGeneral, totalConsultations, 1)) * 110 + 10}px` }}
                            />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Consult</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-xs text-gray-500 font-semibold">
                          No leads captured yet. Add some leads on public forms!
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* LIST VIEWS (HEALTH, LIFE, GENERAL, CONSULTATION) */}
              {activeTab !== 'overview' && (
                <div className="space-y-6 animate-fadeIn">

                  {/* Section Title & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold font-display uppercase tracking-wide">
                        {activeTab === 'health' && 'Health Insurance Leads'}
                        {activeTab === 'life' && 'Life Insurance Leads'}
                        {activeTab === 'general' && 'General Insurance Leads'}
                        {activeTab === 'consultation' && 'Consultation Requests'}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Viewing{' '}
                        {activeTab === 'health' && filteredHealth.length}
                        {activeTab === 'life' && filteredLife.length}
                        {activeTab === 'general' && filteredGeneral.length}
                        {activeTab === 'consultation' && filteredConsultation.length}{' '}
                        results
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => exportToCSV(activeTab)}
                        className="flex items-center gap-2 bg-brand-orange hover:opacity-95 text-xs font-bold rounded-full px-5 py-2.5 shadow-md active:scale-95 transition-all text-white"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Search bar controls */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search leads by name, email, or contact number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange transition-all"
                    />
                  </div>

                  {/* Data Tables */}
                  <div className="overflow-hidden rounded-3xl bg-[#121212] border border-white/5 shadow-xl">

                    {/* HEALTH LEADS TABLE */}
                    {activeTab === 'health' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/2 bg-white/2 select-none font-bold uppercase text-gray-400">
                              <th className="p-4 w-12" />
                              <th className="p-4">Name</th>
                              <th className="p-4">Contact</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">State</th>
                              <th className="p-4">Members</th>
                              <th className="p-4">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredHealth.length > 0 ? (
                              filteredHealth.map((lead) => (
                                <React.Fragment key={lead.id}>
                                  <tr className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                    <td className="p-4 text-center">
                                      <button
                                        onClick={() => toggleRow(lead.id)}
                                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                                      >
                                        {expandedRows[lead.id] ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                                      </button>
                                    </td>
                                    <td className="p-4 font-bold text-white">{lead.name}</td>
                                    <td className="p-4 font-semibold text-gray-300">{lead.contact}</td>
                                    <td className="p-4 text-gray-300">{lead.email}</td>
                                    <td className="p-4 text-gray-400">{lead.state}</td>
                                    <td className="p-4">
                                      <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full font-extrabold text-[10px]">
                                        {Array.isArray(lead.family_members) ? lead.family_members.length : 0} members
                                      </span>
                                    </td>
                                    <td className="p-4 text-gray-450">{new Date(lead.created_at).toLocaleDateString()}</td>
                                  </tr>

                                  {/* Expanded details container */}
                                  {expandedRows[lead.id] && (
                                    <tr className="bg-white/1">
                                      <td colSpan={7} className="p-6 border-b border-white/5">
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div>
                                              <span className="font-bold text-gray-400 block uppercase text-[10px]">Address Details</span>
                                              <p className="text-gray-200 mt-1 font-semibold">{lead.address || 'Not Provided'}, {lead.pincode}</p>
                                            </div>
                                            <div>
                                              <span className="font-bold text-gray-400 block uppercase text-[10px]">Lead ID</span>
                                              <p className="text-gray-400 mt-1 font-mono text-[10px]">{lead.id}</p>
                                            </div>
                                          </div>

                                          {/* Family list */}
                                          <div>
                                            <span className="font-bold text-gray-400 block uppercase text-[10px] mb-2">Insured Family Members</span>
                                            {Array.isArray(lead.family_members) && lead.family_members.length > 0 ? (
                                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {lead.family_members.map((member: any, mIdx: number) => (
                                                  <div key={mIdx} className="bg-white/5 rounded-2xl p-3 border border-white/5 text-left text-xs">
                                                    <span className="font-bold text-white block">{member.name}</span>
                                                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1">
                                                      <span>Relation: {member.relation}</span>
                                                      <span>DOB: {member.dob}</span>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <p className="text-gray-500 text-xs italic">No family members specified</p>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="p-12 text-center text-xs text-gray-500 italic">No leads match search query</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* LIFE LEADS TABLE */}
                    {activeTab === 'life' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/2 select-none font-bold uppercase text-gray-400">
                              <th className="p-4" />
                              <th className="p-4">Name</th>
                              <th className="p-4">Contact</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">DOB</th>
                              <th className="p-4">Profession</th>
                              <th className="p-4">Income</th>
                              <th className="p-4">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLife.length > 0 ? (
                              filteredLife.map((lead) => (
                                <React.Fragment key={lead.id}>
                                  <tr className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                    <td className="p-4 text-center">
                                      <button
                                        onClick={() => toggleRow(lead.id)}
                                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                                      >
                                        {expandedRows[lead.id] ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                                      </button>
                                    </td>
                                    <td className="p-4 font-bold text-white">{lead.name}</td>
                                    <td className="p-4 font-semibold text-gray-300">{lead.contact}</td>
                                    <td className="p-4 text-gray-300">{lead.email}</td>
                                    <td className="p-4 text-gray-450">{lead.dob}</td>
                                    <td className="p-4 text-gray-350">{lead.profession}</td>
                                    <td className="p-4">
                                      <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-extrabold text-[10px]">
                                        {lead.annual_income}
                                      </span>
                                    </td>
                                    <td className="p-4 text-gray-450">{new Date(lead.created_at).toLocaleDateString()}</td>
                                  </tr>
                                  {expandedRows[lead.id] && (
                                    <tr className="bg-white/1">
                                      <td colSpan={8} className="p-6 border-b border-white/5 text-xs text-left">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div>
                                            <span className="font-bold text-gray-400 block uppercase text-[10px]">Existing Policies</span>
                                            <p className="text-gray-200 mt-1 font-semibold">{lead.existing_policies || 'None'}</p>
                                          </div>
                                          <div>
                                            <span className="font-bold text-gray-400 block uppercase text-[10px]">Lead ID</span>
                                            <p className="text-gray-400 mt-1 font-mono text-[10px]">{lead.id}</p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="p-12 text-center text-xs text-gray-500 italic">No leads match search query</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* GENERAL LEADS TABLE */}
                    {activeTab === 'general' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/2 select-none font-bold uppercase text-gray-400">
                              <th className="p-4" />
                              <th className="p-4">Name</th>
                              <th className="p-4">Contact</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Insurance Requirement</th>
                              <th className="p-4">State</th>
                              <th className="p-4">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredGeneral.length > 0 ? (
                              filteredGeneral.map((lead) => (
                                <React.Fragment key={lead.id}>
                                  <tr className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                    <td className="p-4 text-center">
                                      <button
                                        onClick={() => toggleRow(lead.id)}
                                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                                      >
                                        {expandedRows[lead.id] ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                                      </button>
                                    </td>
                                    <td className="p-4 font-bold text-white">{lead.name}</td>
                                    <td className="p-4 font-semibold text-gray-300">{lead.contact}</td>
                                    <td className="p-4 text-gray-300">{lead.email}</td>
                                    <td className="p-4">
                                      <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full font-extrabold text-[10px]">
                                        {lead.insurance_type}
                                      </span>
                                    </td>
                                    <td className="p-4 text-gray-350">{lead.state}</td>
                                    <td className="p-4 text-gray-450">{new Date(lead.created_at).toLocaleDateString()}</td>
                                  </tr>
                                  {expandedRows[lead.id] && (
                                    <tr className="bg-white/1">
                                      <td colSpan={7} className="p-6 border-b border-white/5 text-xs text-left">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div>
                                            <span className="font-bold text-gray-400 block uppercase text-[10px]">Residential Address</span>
                                            <p className="text-gray-200 mt-1 font-semibold">{lead.address || 'Not Provided'}, {lead.pincode}</p>
                                          </div>
                                          <div>
                                            <span className="font-bold text-gray-400 block uppercase text-[10px]">Lead ID</span>
                                            <p className="text-gray-400 mt-1 font-mono text-[10px]">{lead.id}</p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="p-12 text-center text-xs text-gray-500 italic">No leads match search query</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* CONSULTATION TABLE */}
                    {activeTab === 'consultation' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/2 select-none font-bold uppercase text-gray-400">
                              <th className="p-4" />
                              <th className="p-4">Name</th>
                              <th className="p-4">Contact Phone</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Preferred Date</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredConsultation.length > 0 ? (
                              filteredConsultation.map((lead) => (
                                <React.Fragment key={lead.id}>
                                  <tr className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                    <td className="p-4 text-center">
                                      <button
                                        onClick={() => toggleRow(lead.id)}
                                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                                      >
                                        {expandedRows[lead.id] ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                                      </button>
                                    </td>
                                    <td className="p-4 font-bold text-white">{lead.name}</td>
                                    <td className="p-4 font-semibold text-gray-300">{lead.phone}</td>
                                    <td className="p-4 text-gray-300">{lead.email}</td>
                                    <td className="p-4 text-gray-450">{lead.preferred_date}</td>
                                    <td className="p-4">
                                      <span className="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full font-extrabold text-[10px]">
                                        {lead.status}
                                      </span>
                                    </td>
                                    <td className="p-4 text-gray-450">{new Date(lead.created_at).toLocaleDateString()}</td>
                                  </tr>
                                  {expandedRows[lead.id] && (
                                    <tr className="bg-white/1">
                                      <td colSpan={7} className="p-6 border-b border-white/5 text-xs text-left">
                                        <div className="space-y-2">
                                          <div>
                                            <span className="font-bold text-gray-400 block uppercase text-[10px]">Consultation Message</span>
                                            <p className="text-gray-200 mt-1 font-semibold whitespace-pre-wrap leading-relaxed">{lead.message || 'No message provided.'}</p>
                                          </div>
                                          <div>
                                            <span className="font-bold text-gray-400 block uppercase text-[10px]">Request ID</span>
                                            <p className="text-gray-400 mt-1 font-mono text-[10px]">{lead.id}</p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="p-12 text-center text-xs text-gray-500 italic">No leads match search query</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
