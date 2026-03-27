import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Search, Bell, LogOut, LayoutGrid, List, SlidersHorizontal,
  MapPin, Star, ShieldCheck, Phone, Eye, ChevronDown, Users,
  Zap, Droplets, Wrench, Settings, Hammer, Paintbrush, Sparkles,
  Laptop, Truck, X, Briefcase, MessageSquare, Zap as HireIcon
} from 'lucide-react';
import WorkerProfileModal from '../components/WorkerProfileModal';
import ChatPanel from '../components/ChatPanel';
import QuickHireModal from '../components/QuickHireModal';
import WorkerMap from '../components/WorkerMap';
import { API_URL } from '../config';

// ─── Constants ──────────────────────────────────────────────────────────────
const skillKeywords = {
  electrical: 'electric', plumbing: 'plumb', welding: 'weld',
  mechanical: 'mechanic', construction: 'construct', painting: 'paint',
  cleaning: 'clean', installation: 'install', transport: 'transport', general: 'general',
};

const SKILLS = [
  { id: 'all',          label: 'All Skills',    icon: null },
  { id: 'electrical',   label: 'Electrical',    icon: Zap },
  { id: 'plumbing',     label: 'Plumbing',       icon: Droplets },
  { id: 'welding',      label: 'Welding',        icon: Wrench },
  { id: 'mechanical',   label: 'Mechanical',     icon: Settings },
  { id: 'construction', label: 'Construction',   icon: Hammer },
  { id: 'painting',     label: 'Painting',       icon: Paintbrush },
  { id: 'cleaning',     label: 'Cleaning',       icon: Sparkles },
  { id: 'installation', label: 'Installation',   icon: Laptop },
  { id: 'transport',    label: 'Transport',      icon: Truck },
  { id: 'general',      label: 'General Labor',  icon: Users },
];

const skillIconMap = {
  electric: Zap, plumb: Droplets, weld: Wrench, mechanic: Settings,
  construct: Hammer, mason: Hammer, paint: Paintbrush, clean: Sparkles,
  install: Laptop, transport: Truck, carpenter: Hammer, general: Users, labor: Users,
};

function getSkillIcon(skillsStr) {
  const lower = (skillsStr || '').toLowerCase();
  for (const [key, Icon] of Object.entries(skillIconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return Briefcase;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white/60 backdrop-blur rounded-3xl border border-white/80 overflow-hidden animate-pulse">
      <div className="h-1 bg-gradient-to-r from-violet-200 to-indigo-200" />
      <div className="p-5 space-y-4">
        <div className="flex gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-100" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-gray-100 rounded-xl w-3/4" />
            <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
          </div>
        </div>
        <div className="h-10 bg-gray-50 rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-9 bg-gray-100 rounded-2xl" />
          <div className="h-9 bg-violet-50 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Worker Card (with Chat + Call + Hire actions) ──────────────────────────
function WorkerCard({ worker, onViewProfile, onChat, onHire }) {
  const skillIcon = getSkillIcon(worker.skills);
  const skillName = worker.skills?.split(',')[0]?.trim() || 'General Labor';
  const rating = worker.rating || 4.5;
  const photoUrl = worker.work_photos
    ? (worker.work_photos.startsWith('http') ? worker.work_photos : `${API_URL}${worker.work_photos}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent((worker.user?.first_name || 'W') + '+' + (worker.user?.last_name || ''))}&background=EDE9FE&color=6D28D9&size=200&bold=true`;

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-100/60 hover:border-violet-100 flex flex-col cursor-pointer">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative shrink-0">
            <img src={photoUrl} alt={worker.user?.first_name || 'Worker'}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-md" />
            {worker.is_verified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">✓</span>
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-gray-900 text-sm truncate">{worker.user?.first_name} {worker.user?.last_name}</h3>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-violet-50 text-violet-700">
                {React.createElement(skillIcon, { className: "w-3 h-3" })}{skillName}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-400">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{worker.location || 'Location not set'}</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-xl">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-amber-700">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {[
            { label: 'Experience', value: `${worker.experience_years || 0}yr` },
            { label: 'Jobs Done', value: worker.jobs_completed || 0 },
            { label: 'Rate/day', value: `₹${worker.expected_wage || 'N/A'}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-2xl p-2.5 text-center">
              <div className="text-sm font-bold text-gray-900">{value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Actions — 3 buttons */}
        <div className="mt-auto grid grid-cols-3 gap-1.5">
          <button onClick={() => onViewProfile(worker)}
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-2xl border border-gray-200 text-gray-500 text-[10px] font-semibold hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all">
            <Eye className="w-3.5 h-3.5" /> Profile
          </button>
          <button onClick={() => onChat(worker)}
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-2xl border border-indigo-100 text-indigo-600 text-[10px] font-semibold hover:bg-indigo-50 transition-all">
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
          <button onClick={() => onHire(worker)}
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-2xl text-white text-[10px] font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95">
            <HireIcon className="w-3.5 h-3.5" /> Hire
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function EnterpriseDashboard() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [businessName, setBusinessName] = useState('');
  const [enterpriseId, setEnterpriseId] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isProfileOpen, setIsProfileOpen]   = useState(false);
  const [chatWorker, setChatWorker] = useState(null);
  const [hireWorker, setHireWorker] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy]     = useState('rating');
  const [activeSkill, setActiveSkill] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'map'
  const [enterpriseData, setEnterpriseData] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };
      const [wRes, eRes] = await Promise.all([
        axios.get(`${API_URL}/api/workers/`, { headers }),
        axios.get(`${API_URL}/api/enterprises/`, { headers }),
      ]);
      setWorkers(wRes.data);
      if (eRes.data.length > 0) {
        setBusinessName(eRes.data[0].business_name);
        setEnterpriseId(eRes.data[0].id);
        setEnterpriseData(eRes.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = useMemo(() => {
    let result = workers.filter(w => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = `${w.user?.first_name || ''} ${w.user?.last_name || ''}`.toLowerCase();
        if (!name.includes(q) && !(w.skills || '').toLowerCase().includes(q) && !(w.location || '').toLowerCase().includes(q)) return false;
      }
      if (activeSkill !== 'all') {
        const kw = skillKeywords[activeSkill] || activeSkill;
        if (!(w.skills || '').toLowerCase().includes(kw)) return false;
      }
      return true;
    });
    if (sortBy === 'rating')     result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'experience') result.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
    if (sortBy === 'wage')       result.sort((a, b) => (a.expected_wage || 0) - (b.expected_wage || 0));
    return result;
  }, [workers, activeSkill, searchQuery, sortBy]);

  const stats = [
    { label: 'Total Workers',    value: workers.length,                          icon: Users,      color: 'from-violet-500 to-purple-600' },
    { label: 'Verified',         value: workers.filter(w => w.is_verified).length, icon: ShieldCheck, color: 'from-emerald-400 to-teal-500' },
    { label: 'Categories',       value: '10+',                                   icon: Briefcase,  color: 'from-blue-500 to-indigo-600' },
    { label: 'Avg. Rating',      value: workers.length ? (workers.reduce((s, w) => s + (w.rating || 0), 0) / workers.length).toFixed(1) : '—', icon: Star, color: 'from-amber-400 to-orange-500' },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", background: '#F3F0FF' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
        style={{ background: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>LW</div>
          <div>
            <div className="text-white font-black text-sm tracking-tight">LocalWorks</div>
            <div className="text-violet-300 text-[10px] font-semibold tracking-widest uppercase">Enterprise</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/40 hover:text-white lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Business Info */}
        <div className="px-5 py-4 mx-4 mt-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base mb-2"
            style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>
            {(businessName || 'B').charAt(0).toUpperCase()}
          </div>
          <div className="text-white font-bold text-sm truncate">{businessName || 'My Business'}</div>
          <div className="text-violet-300 text-xs mt-0.5">Enterprise Account</div>
        </div>

        {/* Main Navigation */}
        <div className="px-4 py-2 space-y-1">
          <p className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-3 px-2">Main Menu</p>
          <button onClick={() => setActiveTab('browse')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${activeTab === 'browse' ? 'text-white bg-white/10' : 'text-violet-300 hover:text-white hover:bg-white/10'}`}>
            <LayoutGrid className="w-4 h-4" /> Browse Workers
          </button>
          <button onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${activeTab === 'map' ? 'text-white bg-white/10' : 'text-violet-300 hover:text-white hover:bg-white/10'}`}>
            <MapPin className="w-4 h-4" /> Map View
          </button>
        </div>

        {/* Skill Filters */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-3 px-2">Browse by Skill</p>
          <div className="space-y-1">
            {SKILLS.map(({ id, label, icon: Icon }) => {
              const active = activeSkill === id;
              return (
                <button key={id} onClick={() => { setActiveSkill(id); setActiveTab('browse'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${active ? 'text-white shadow-lg' : 'text-violet-300 hover:text-white hover:bg-white/10'}`}
                  style={active ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(109,40,217,0.7))' } : {}}>
                  {Icon ? React.createElement(Icon, { className: "w-4 h-4 shrink-0" }) : <span className="w-4 h-4 shrink-0 inline-block" />}
                  {label}
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-violet-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-violet-100/50 shadow-sm shadow-violet-50">
          <div className="flex items-center gap-4 px-4 sm:px-6 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-violet-50">
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search workers, skills, location..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all" />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-500" />
              </button>

              {/* Sort */}
              <div className="relative hidden sm:block">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl text-gray-600 outline-none focus:border-violet-400 cursor-pointer">
                  <option value="rating">⭐ Top Rated</option>
                  <option value="experience">🏆 Most Exp.</option>
                  <option value="wage">💰 Best Rate</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
                {[['grid', LayoutGrid], ['list', List]].map(([mode, ModeIcon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    {React.createElement(ModeIcon, { className: "w-4 h-4" })}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
            style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 40%, #2563EB 100%)' }}>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #60A5FA, transparent)' }} />

            <h1 className="text-white text-2xl sm:text-3xl font-black mb-1 relative z-10">
              Find Skilled Workers <span className="text-violet-300">Near You</span>
            </h1>
            <p className="text-violet-200 text-sm font-medium max-w-lg mb-5 relative z-10">
              Verified local professionals — electricians, plumbers, welders & more — ready to hire instantly.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3 relative z-10">
              {stats.map(({ label, value, icon: StatIcon, color }) => (
                <div key={label} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
                    {React.createElement(StatIcon, { className: "w-4 h-4 text-white" })}
                  </div>
                  <div>
                    <div className="text-white font-black text-base leading-none">{value}</div>
                    <div className="text-violet-300 text-[10px] font-semibold mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {loading ? 'Loading workers…' : `${filteredWorkers.length} Worker${filteredWorkers.length !== 1 ? 's' : ''} Found`}
              </h2>
              {!loading && searchQuery && (
                <p className="text-sm text-gray-400 mt-0.5">Results for "<span className="text-violet-600 font-semibold">{searchQuery}</span>"</p>
              )}
            </div>
            {!loading && filteredWorkers.length === 0 && workers.length > 0 && (
              <button onClick={() => { setActiveSkill('all'); setSearchQuery(''); }}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow hover:shadow-lg transition-all">
                Clear Filters
              </button>
            )}
          </div>

          {/* Worker Grid / List / Map */}
          {activeTab === 'map' ? (
            <WorkerMap 
              workers={filteredWorkers} 
              enterprise={enterpriseData} 
              onChat={w => setChatWorker(w)}
              onHire={w => setHireWorker(w)}
            />
          ) : loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredWorkers.length > 0 ? (
            <div className={viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-3'}>
              {filteredWorkers.map(worker => (
                <WorkerCard key={worker.id} worker={worker}
                  onViewProfile={w => { setSelectedWorker(w); setIsProfileOpen(true); }}
                  onChat={w => setChatWorker(w)}
                  onHire={w => setHireWorker(w)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 text-4xl"
                style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }}>🔍</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No workers found</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                {workers.length === 0
                  ? 'No approved workers yet. Check back soon!'
                  : 'Try different filters or clear your search.'}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Profile Modal */}
      <WorkerProfileModal worker={selectedWorker} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}
        onChat={w => { setIsProfileOpen(false); setChatWorker(w); }}
        onHire={w => { setIsProfileOpen(false); setHireWorker(w); }} />

      {/* Chat Panel */}
      {chatWorker && (
        <ChatPanel worker={chatWorker} enterpriseId={enterpriseId} onClose={() => setChatWorker(null)} />
      )}

      {/* Quick Hire Modal */}
      {hireWorker && (
        <QuickHireModal worker={hireWorker} onClose={() => setHireWorker(null)} />
      )}
    </div>
  );
}
