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
  Eye,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Trash2,
  StickyNote,
  ArrowUpDown
} from 'lucide-react';
import { getLeads, logoutAdmin, checkAdminSession, updateLeadStatus, updateLeadNotes, deleteLead } from '@/lib/actions';
import type { LeadType } from '@/lib/actions';

type Tab = 'overview' | 'health' | 'life' | 'general' | 'consultation';
type SortField = 'created_at' | 'status' | 'name';
type SortOrder = 'asc' | 'desc';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [leads, setLeads] = useState<{ health: any[]; life: any[]; general: any[]; consultation: any[] }>({ health: [], life: [], general: [], consultation: [] });
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    checkAdminSession().then((isAuth) => {
      setIsAuthenticated(isAuth);
      if (!isAuth) { router.push('/admin/login'); }
      else { fetchLeads(); }
    });
  }, [router]);

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      setLeads({ health: data.health || [], life: data.life || [], general: data.general || [], consultation: data.consultation || [] });
    } catch (err) { console.error('Error fetching leads:', err); }
    finally { setIsLoading(false); }
  };

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

  const handleLogout = async () => { await logoutAdmin(); router.push('/admin/login'); };
  const toggleRow = (id: string) => setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  // ─── CRUD Handlers ──────────────────────────────────────────────────────────

  const handleStatusChange = async (type: LeadType, id: string, newStatus: string) => {
    const result = await updateLeadStatus(type, id, newStatus);
    if (result.success) {
      showToast(`Status updated to ${newStatus}`, 'success');
      setLeads(prev => ({
        ...prev,
        [type]: prev[type].map((item: any) => item.id === id ? { ...item, status: newStatus } : item)
      }));
    } else {
      showToast(result.error || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (type: LeadType, id: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action can be undone by an admin.')) return;
    const result = await deleteLead(type, id);
    if (result.success) {
      showToast('Lead deleted successfully', 'success');
      setLeads(prev => ({
        ...prev,
        [type]: prev[type].filter((item: any) => item.id !== id)
      }));
    } else {
      showToast(result.error || 'Failed to delete', 'error');
    }
  };

  const handleSaveNotes = async (type: LeadType, id: string) => {
    const result = await updateLeadNotes(type, id, notesValue);
    if (result.success) {
      showToast('Notes saved', 'success');
      setLeads(prev => ({
        ...prev,
        [type]: prev[type].map((item: any) => item.id === id ? { ...item, notes: notesValue } : item)
      }));
      setEditingNotes(null);
    } else {
      showToast(result.error || 'Failed to save notes', 'error');
    }
  };

  // ─── CSV Export ──────────────────────────────────────────────────────────────

  const exportToCSV = (type: 'health' | 'life' | 'general' | 'consultation') => {
    const dataToExport = leads[type];
    if (dataToExport.length === 0) { showToast('No data to export', 'error'); return; }
    let csvContent = '';
    if (type === 'health') {
      csvContent += 'Name,Contact,Email,Address,State,Status,Members,Created At\n';
      dataToExport.forEach((item: any) => { csvContent += `"${item.name}","${item.contact}","${item.email}","${item.address || ''}","${item.state || ''}","${item.status}",${Array.isArray(item.family_members) ? item.family_members.length : 0},"${item.created_at}"\n`; });
    } else if (type === 'life') {
      csvContent += 'Name,Contact,Email,DOB,Profession,Income,Status,Created At\n';
      dataToExport.forEach((item: any) => { csvContent += `"${item.name}","${item.contact}","${item.email}","${item.dob || ''}","${item.profession || ''}","${item.annual_income || ''}","${item.status}","${item.created_at}"\n`; });
    } else if (type === 'general') {
      csvContent += 'Name,Contact,Email,Address,State,Insurance Type,Status,Created At\n';
      dataToExport.forEach((item: any) => { csvContent += `"${item.name}","${item.contact}","${item.email}","${item.address || ''}","${item.state || ''}","${item.insurance_type}","${item.status}","${item.created_at}"\n`; });
    } else {
      csvContent += 'Name,Email,Phone,Preferred Date,Message,Status,Created At\n';
      dataToExport.forEach((item: any) => { csvContent += `"${item.name}","${item.email}","${item.phone}","${item.preferred_date || ''}","${item.message || ''}","${item.status}","${item.created_at}"\n`; });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // ─── Filtering & Sorting ─────────────────────────────────────────────────────

  const getFilteredAndSorted = (list: any[]) => {
    let filtered = list.filter((item: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (item.name || '').toLowerCase().includes(q) || (item.email || '').toLowerCase().includes(q) || (item.contact || item.phone || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    filtered.sort((a: any, b: any) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'created_at') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
      else { aVal = String(aVal).toLowerCase(); bVal = String(bVal).toLowerCase(); }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return filtered;
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  // ─── Metrics ─────────────────────────────────────────────────────────────────

  const totalHealth = leads.health.length;
  const totalLife = leads.life.length;
  const totalGeneral = leads.general.length;
  const totalConsultations = leads.consultation.length;
  const totalLeads = totalHealth + totalLife + totalGeneral + totalConsultations;

  // ─── Status Badge Component ──────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      'Processing': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      'Converted': 'bg-green-500/15 text-green-400 border-green-500/30',
      'Rejected': 'bg-red-500/15 text-red-400 border-red-500/30',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${colors[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
        {status}
      </span>
    );
  };

  // ─── Status Action Buttons ───────────────────────────────────────────────────

  const StatusButtons = ({ type, id, currentStatus }: { type: LeadType; id: string; currentStatus: string }) => {
    const statuses = ['Pending', 'Processing', 'Converted', 'Rejected'];
    const btnColors: Record<string, string> = {
      'Pending': 'hover:bg-yellow-500/20 text-yellow-400',
      'Processing': 'hover:bg-blue-500/20 text-blue-400',
      'Converted': 'hover:bg-green-500/20 text-green-400',
      'Rejected': 'hover:bg-red-500/20 text-red-400',
    };
    return (
      <div className="flex flex-wrap gap-1.5">
        {statuses.map(s => (
          <button
            key={s}
            disabled={currentStatus === s}
            onClick={() => handleStatusChange(type, id, s)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 transition-all active:scale-95 ${currentStatus === s ? 'bg-white/10 text-white cursor-default opacity-60' : btnColors[s] + ' hover:border-white/20'}`}
          >
            {s}
          </button>
        ))}
      </div>
    );
  };

  // ─── Lead Table Row Component ────────────────────────────────────────────────

  const LeadRow = ({ lead, type, columns }: { lead: any; type: LeadType; columns: { key: string; label: string }[] }) => (
    <React.Fragment>
      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        <td className="p-3 text-center">
          <button onClick={() => toggleRow(lead.id)} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            {expandedRows[lead.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
        {columns.map(col => (
          <td key={col.key} className="p-3 text-xs text-gray-300">
            {col.key === 'status' ? <StatusBadge status={lead[col.key]} /> :
             col.key === 'family_members' ? <span className="text-red-400 font-bold">{Array.isArray(lead[col.key]) ? lead[col.key].length : 0}</span> :
             col.key === 'created_at' ? new Date(lead[col.key]).toLocaleDateString() :
             <span className="font-semibold">{lead[col.key] || '—'}</span>}
          </td>
        ))}
        <td className="p-3">
          <button onClick={() => handleDelete(type, lead.id)} className="p-1.5 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>

      {/* Expanded Row with Status Buttons + Notes */}
      {expandedRows[lead.id] && (
        <tr className="bg-white/[0.01]">
          <td colSpan={columns.length + 2} className="p-5 border-b border-white/5">
            <div className="space-y-4">
              {/* Status Actions */}
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Change Status</span>
                <StatusButtons type={type} id={lead.id} currentStatus={lead.status} />
              </div>

              {/* Notes */}
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Admin Notes</span>
                {editingNotes === lead.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      className="flex-1 rounded-full border border-white/10 bg-white/5 py-2 px-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                      placeholder="Add notes about this lead..."
                    />
                    <button onClick={() => handleSaveNotes(type, lead.id)} className="px-4 py-2 rounded-full bg-brand-orange text-white text-xs font-bold hover:opacity-90">Save</button>
                    <button onClick={() => setEditingNotes(null)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-300 italic">{lead.notes || 'No notes added yet.'}</p>
                    <button onClick={() => { setEditingNotes(lead.id); setNotesValue(lead.notes || ''); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-500 hover:text-white">
                      <StickyNote className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Extra Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {lead.address && <div><span className="text-gray-500 block text-[10px] uppercase font-bold">Address</span><span className="text-gray-200">{lead.address}, {lead.pincode}</span></div>}
                {lead.dob && <div><span className="text-gray-500 block text-[10px] uppercase font-bold">DOB</span><span className="text-gray-200">{lead.dob}</span></div>}
                {lead.profession && <div><span className="text-gray-500 block text-[10px] uppercase font-bold">Profession</span><span className="text-gray-200">{lead.profession}</span></div>}
                {lead.annual_income && <div><span className="text-gray-500 block text-[10px] uppercase font-bold">Income</span><span className="text-gray-200">₹{lead.annual_income}</span></div>}
                {lead.message && <div className="col-span-2"><span className="text-gray-500 block text-[10px] uppercase font-bold">Message</span><span className="text-gray-200">{lead.message}</span></div>}
                <div><span className="text-gray-500 block text-[10px] uppercase font-bold">Lead ID</span><span className="text-gray-400 font-mono text-[10px]">{lead.id}</span></div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );

  // ─── Generic Table Component ─────────────────────────────────────────────────

  const LeadTable = ({ type, columns }: { type: LeadType; columns: { key: string; label: string }[] }) => {
    const filtered = getFilteredAndSorted(leads[type]);
    return (
      <div className="overflow-x-auto rounded-3xl bg-[#121212] border border-white/5">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] select-none">
              <th className="p-3 w-10" />
              {columns.map(col => (
                <th key={col.key} className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort(col.key as SortField)}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key && <ArrowUpDown className="h-3 w-3 text-brand-orange" />}
                  </div>
                </th>
              ))}
              <th className="p-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((lead: any) => <LeadRow key={lead.id} lead={lead} type={type} columns={columns} />)
            ) : (
              <tr><td colSpan={columns.length + 2} className="p-12 text-center text-xs text-gray-500 italic">No leads match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-xl border animate-fadeIn ${toast.type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d0d0d] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-extrabold tracking-wider font-display sunset-text uppercase leading-none">Secure Choice</h1>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5 block">Admin Dashboard</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-xs font-bold border border-white/10 rounded-full px-4 py-2 text-gray-300 hover:text-white transition-all active:scale-95">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </header>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-56 bg-[#0a0a0a] border-r border-white/5 p-4 flex flex-col gap-1.5 shrink-0">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-2 block">Navigation</span>
          {([
            { tab: 'overview', label: 'Overview', icon: LayoutDashboard, count: totalLeads, color: '' },
            { tab: 'health', label: 'Health', icon: Heart, count: totalHealth, color: 'text-red-500' },
            { tab: 'life', label: 'Life', icon: ShieldAlert, count: totalLife, color: 'text-blue-500' },
            { tab: 'general', label: 'General', icon: Car, count: totalGeneral, color: 'text-amber-500' },
            { tab: 'consultation', label: 'Consultation', icon: CalendarRange, count: totalConsultations, color: 'text-emerald-500' },
          ] as const).map(({ tab, label, icon: Icon, count, color }) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setStatusFilter('All'); }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-brand-orange/15 text-brand-orange' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
              <Icon className={`h-4 w-4 ${activeTab === tab ? '' : color}`} />
              {label} ({count})
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6 md:p-8 flex flex-col gap-6 bg-brand-dark text-left">
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold font-display">Analytics Overview</h2>
                    <p className="text-xs text-gray-400 mt-1">Real-time lead metrics</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { label: 'Total', count: totalLeads, icon: Users, color: 'text-brand-orange' },
                      { label: 'Health', count: totalHealth, icon: Heart, color: 'text-red-500' },
                      { label: 'Life', count: totalLife, icon: ShieldAlert, color: 'text-blue-500' },
                      { label: 'General', count: totalGeneral, icon: Car, color: 'text-amber-500' },
                      { label: 'Consult', count: totalConsultations, icon: CalendarRange, color: 'text-emerald-500' },
                    ].map(({ label, count, icon: Icon, color }) => (
                      <div key={label} className="bg-[#121212] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase">{label}</span>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <span className="text-3xl font-black font-display">{count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status breakdown */}
                  <div className="bg-[#121212] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-300 mb-4">Status Distribution</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {['Pending', 'Processing', 'Converted', 'Rejected'].map(status => {
                        const count = [...leads.health, ...leads.life, ...leads.general, ...leads.consultation].filter((l: any) => l.status === status).length;
                        return (
                          <div key={status} className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                            <StatusBadge status={status} />
                            <p className="text-2xl font-black mt-2">{count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* LIST VIEWS */}
              {activeTab !== 'overview' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold font-display uppercase tracking-wide">
                        {activeTab === 'health' && 'Health Insurance Leads'}
                        {activeTab === 'life' && 'Life Insurance Leads'}
                        {activeTab === 'general' && 'General Insurance Leads'}
                        {activeTab === 'consultation' && 'Consultation Requests'}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">{getFilteredAndSorted(leads[activeTab]).length} results</p>
                    </div>
                    <button onClick={() => exportToCSV(activeTab)} className="flex items-center gap-2 bg-brand-orange hover:opacity-90 text-xs font-bold rounded-full px-5 py-2.5 text-white active:scale-95 transition-all self-start">
                      <Download className="h-4 w-4" /> Export CSV
                    </button>
                  </div>

                  {/* Filters Row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-3 h-4 w-4 text-gray-500" />
                      <input type="text" placeholder="Search by name, email, or phone..."
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                    </div>
                    {/* Status Filter Pills */}
                    <div className="flex gap-1.5 flex-wrap">
                      {['All', 'Pending', 'Processing', 'Converted', 'Rejected'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                          className={`px-4 py-2.5 rounded-full text-[10px] font-bold border transition-all ${statusFilter === s ? 'bg-brand-orange/15 text-brand-orange border-brand-orange/30' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data Table */}
                  {activeTab === 'health' && <LeadTable type="health" columns={[{ key: 'name', label: 'Name' }, { key: 'contact', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'state', label: 'State' }, { key: 'family_members', label: 'Members' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Date' }]} />}
                  {activeTab === 'life' && <LeadTable type="life" columns={[{ key: 'name', label: 'Name' }, { key: 'contact', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'profession', label: 'Profession' }, { key: 'annual_income', label: 'Income' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Date' }]} />}
                  {activeTab === 'general' && <LeadTable type="general" columns={[{ key: 'name', label: 'Name' }, { key: 'contact', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'insurance_type', label: 'Type' }, { key: 'state', label: 'State' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Date' }]} />}
                  {activeTab === 'consultation' && <LeadTable type="consultation" columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'preferred_date', label: 'Pref. Date' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Date' }]} />}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
