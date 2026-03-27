import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, ShieldCheck, Video, BookOpen, Building2,
  LogOut, Users, Clock, CheckCircle, XCircle, Star, TrendingUp,
  Plus, Trash2, Edit3, ChevronRight, X, AlertTriangle, RefreshCw
} from 'lucide-react';
import { API_URL } from '../config';

// ─── helpers ────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Token ${token()}` });

const STATUS_PILL = {
  PENDING:  'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  RESUBMIT: 'bg-blue-100 text-blue-800',
};
const METHOD_ICON = { VIDEO: '🎬', IMAGE: '🖼️', AUDIO: '🎙️', QUIZ: '📝' };

// ─── Sidebar nav items ───────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',      label: 'Overview',            icon: LayoutDashboard },
  { id: 'profiles',      label: 'Profile Verification', icon: ShieldCheck },
  { id: 'submissions',   label: 'Task Submissions',     icon: Video },
  { id: 'courses',       label: 'Course Management',    icon: BookOpen },
  { id: 'enterprises',   label: 'Enterprises',          icon: Building2 },
];

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — Overview
// ════════════════════════════════════════════════════════════════════════════
function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const h = { headers: authHeaders() };
        const [workers, enterprises, verifications, courses] = await Promise.all([
          axios.get(`${API_URL}/api/workers/`, h),
          axios.get(`${API_URL}/api/enterprises/`, h),
          axios.get(`${API_URL}/api/verifications/`, h),
          axios.get(`${API_URL}/api/courses/`, h),
        ]);
        const ws = workers.data;
        const vs = verifications.data;
        setStats({
          totalWorkers:    ws.length,
          verifiedWorkers: ws.filter(w => w.is_verified).length,
          pendingProfiles: ws.filter(w => w.verification_status === 'PENDING').length,
          totalEnterprises: enterprises.data.length,
          totalSubmissions: vs.length,
          pendingSubmissions: vs.filter(v => v.status === 'PENDING').length,
          approvedSubmissions: vs.filter(v => v.status === 'APPROVED').length,
          totalCourses: courses.data.length,
          avgRating: ws.length
            ? (ws.reduce((s, w) => s + (w.rating || 0), 0) / ws.length).toFixed(1)
            : '—',
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const cards = stats ? [
    { label: 'Total Workers',      value: stats.totalWorkers,       icon: Users,        color: 'from-violet-500 to-purple-600', bg: 'from-violet-50 to-purple-50' },
    { label: 'Verified Workers',   value: stats.verifiedWorkers,    icon: CheckCircle,  color: 'from-emerald-500 to-teal-600',  bg: 'from-emerald-50 to-teal-50' },
    { label: 'Pending Profiles',   value: stats.pendingProfiles,    icon: Clock,        color: 'from-amber-500 to-orange-500',  bg: 'from-amber-50 to-orange-50' },
    { label: 'Enterprises',        value: stats.totalEnterprises,   icon: Building2,    color: 'from-blue-500 to-indigo-600',   bg: 'from-blue-50 to-indigo-50' },
    { label: 'Task Submissions',   value: stats.totalSubmissions,   icon: Video,        color: 'from-pink-500 to-rose-600',     bg: 'from-pink-50 to-rose-50' },
    { label: 'Pending Reviews',    value: stats.pendingSubmissions, icon: AlertTriangle, color: 'from-red-500 to-rose-600',     bg: 'from-red-50 to-rose-50' },
    { label: 'Courses Available',  value: stats.totalCourses,       icon: BookOpen,     color: 'from-cyan-500 to-blue-600',     bg: 'from-cyan-50 to-blue-50' },
    { label: 'Avg. Worker Rating', value: stats.avgRating,          icon: Star,         color: 'from-yellow-400 to-amber-500',  bg: 'from-yellow-50 to-amber-50' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-400 text-sm mt-1">Real-time snapshot of your MSME worker platform.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: TabIcon, color, bg }) => (
            <div key={label} className={`bg-gradient-to-br ${bg} border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
                {React.createElement(TabIcon, { className: "w-5 h-5 text-white" })}
              </div>
              <div className="text-2xl font-black text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 font-semibold mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Review Profiles',    emoji: '👤', tab: 'profiles' },
            { label: 'Review Submissions', emoji: '🎬', tab: 'submissions' },
            { label: 'Add Course',         emoji: '📚', tab: 'courses' },
            { label: 'View Enterprises',   emoji: '🏢', tab: 'enterprises' },
          ].map(({ label, emoji }) => (
            <div key={label}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 cursor-pointer transition-all group">
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-violet-700 text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2 — Profile Verification
// ════════════════════════════════════════════════════════════════════════════
function ProfileVerificationTab() {
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('PENDING');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProfiles(); }, [filter, fetchProfiles]);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/workers/?status=${filter}`, { headers: authHeaders() });
      setProfiles(res.data);
    } catch (e) { console.error(e); }
  }, [filter]);

  const handleAction = async (newStatus) => {
    if (!selected) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      fd.append('note', note);
      await axios.post(`${API_URL}/api/workers/${selected.id}/verify_profile/`, fd, { headers: authHeaders() });
      setProfiles(p => p.filter(x => x.id !== selected.id));
      setSelected(null); setNote('');
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-160px)]">
      {/* Left */}
      <div className="w-full lg:w-2/5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Profile Queue</h2>
          <button onClick={fetchProfiles} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {['PENDING','APPROVED','REJECTED','RESUBMIT'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setSelected(null); }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${filter === s ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {profiles.length === 0
            ? <p className="text-gray-400 text-sm text-center py-10">No profiles found.</p>
            : profiles.map(p => (
              <div key={p.id} onClick={() => { setSelected(p); setNote(''); }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selected?.id === p.id ? 'border-violet-400 bg-violet-50' : 'border-gray-100 hover:border-violet-200 bg-gray-50/50'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">{p.user.first_name} {p.user.last_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[p.verification_status]}`}>{p.verification_status}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">{p.location} · {p.level} · {p.experience_years}yr exp</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-y-auto">
        {selected ? (
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-gray-900">{selected.user.first_name} {selected.user.last_name}</h2>
                <p className="text-gray-500 text-sm">{selected.user.phone_number || 'No phone'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_PILL[selected.verification_status]}`}>{selected.verification_status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[['Location', selected.location],['Skills', selected.skills],['Experience', `${selected.experience_years} years`],['Expected Wage', `₹${selected.expected_wage}/day`]].map(([l,v]) => (
                <div key={l} className="bg-gray-50 p-3.5 rounded-xl">
                  <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{l}</div>
                  <div className="text-sm font-semibold text-gray-800">{v || 'N/A'}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-gray-800 text-sm mb-3 border-b pb-2">Uploaded Documents</h3>
              <div className="space-y-2">
                {[['ID Proof', selected.id_proof],['Certificates', selected.certificates],['Work Photos', selected.work_photos]].map(([l,u]) => (
                  <div key={l} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                    <span className="text-sm font-semibold text-gray-600">{l}</span>
                    {u ? <a href={u.startsWith('http') ? u : `${API_URL}${u}`} target="_blank" rel="noreferrer"
                        className="text-violet-600 hover:underline text-xs font-bold flex items-center gap-1">
                        View ↗</a>
                      : <span className="text-gray-400 text-xs italic">Not provided</span>}
                  </div>
                ))}
              </div>
            </div>

            {(filter === 'PENDING' || filter === 'RESUBMIT') && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-sm mb-3">Review Decision</h3>
                <textarea className="w-full p-3 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-300" rows="2"
                  placeholder="Optional notes for the worker..." value={note} onChange={e => setNote(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => handleAction('APPROVED')} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold disabled:opacity-50 transition-all">✓ Approve</button>
                  <button onClick={() => handleAction('RESUBMIT')} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold disabled:opacity-50 transition-all">↩ Resubmit</button>
                  <button onClick={() => handleAction('REJECTED')} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold disabled:opacity-50 transition-all">✗ Reject</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <div className="text-center"><div className="text-5xl mb-3">👈</div><p className="text-sm">Select a profile to review</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3 — Task Submissions
// ════════════════════════════════════════════════════════════════════════════
function TaskSubmissionsTab() {
  const [all, setAll] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchSubmissions(); }, []);

  useEffect(() => {
    setSubmissions(filterStatus === 'ALL' ? all : all.filter(s => s.status === filterStatus));
  }, [filterStatus, all]);

  const fetchSubmissions = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API_URL}/api/verifications/`, { headers: authHeaders() });
      setAll(res.data); setSubmissions(res.data);
    } catch (e) { setError(e.response?.data?.detail || e.message); }
    finally { setLoading(false); }
  };

  const handleReview = async (newStatus) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/api/verifications/${selected.id}/review_submission/`,
        { status: newStatus, admin_notes: notes }, { headers: authHeaders() });
      const updated = { ...selected, status: newStatus, admin_notes: notes };
      setAll(p => p.map(s => s.id === selected.id ? updated : s));
      setSelected(updated);
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setActionLoading(false); }
  };

  const getMediaUrl = p => !p ? null : p.startsWith('http') ? p : p.startsWith('/') ? p : `/${p}`;
  const fileUrl = getMediaUrl(selected?.submitted_file);
  const method = selected?.task_detail?.method || '';
  const isVideo = method === 'VIDEO' || /\.(mp4|webm|mov)$/i.test(fileUrl || '');
  const isAudio = method === 'AUDIO' || /\.(mp3|wav|ogg)$/i.test(fileUrl || '');
  const isImage = method === 'IMAGE' || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl || '');

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-160px)]">
      {/* Left list */}
      <div className="w-full lg:w-2/5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Task Submissions</h2>
          <button onClick={fetchSubmissions} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {['ALL','PENDING','APPROVED','REJECTED'].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setSelected(null); }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${filterStatus === s ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? <p className="text-gray-400 text-sm text-center py-10">Loading…</p>
            : error ? <p className="text-red-500 text-sm text-center py-10">{error}</p>
            : submissions.length === 0 ? <p className="text-gray-400 text-sm text-center py-10">No submissions found.</p>
            : submissions.map(sub => (
              <div key={sub.id} onClick={() => { setSelected(sub); setNotes(sub.admin_notes || ''); }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selected?.id === sub.id ? 'border-violet-400 bg-violet-50' : 'border-gray-100 hover:border-violet-200 bg-gray-50/50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900">{sub.worker_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[sub.status] || 'bg-gray-100 text-gray-600'}`}>{sub.status}</span>
                </div>
                <div className="text-xs text-gray-400">{METHOD_ICON[sub.task_detail?.method]} {sub.task_detail?.method} · {sub.task_detail?.course_name || sub.task_detail?.prompt_text?.slice(0,40)}</div>
                <div className="text-[10px] text-gray-300 mt-1">{new Date(sub.submitted_at).toLocaleString()}</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Right detail */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-y-auto">
        {selected ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-gray-900">{selected.worker_name}</h2>
                <p className="text-sm text-gray-400">{METHOD_ICON[selected.task_detail?.method]} {selected.task_detail?.method} submission</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_PILL[selected.status] || 'bg-gray-100 text-gray-600'}`}>{selected.status}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-1">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Task Prompt</div>
              <p className="text-sm font-medium text-gray-800">{selected.task_detail?.prompt_text}</p>
              <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(selected.submitted_at).toLocaleString()}</p>
            </div>

            {fileUrl && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Submitted File</p>
                {isVideo && <video controls className="w-full rounded-xl border max-h-64 bg-black"><source src={fileUrl} /></video>}
                {isAudio && <audio controls className="w-full rounded-xl"><source src={fileUrl} /></audio>}
                {isImage && <img src={fileUrl} alt="submission" className="w-full rounded-xl border max-h-64 object-contain bg-gray-50" />}
                {!isVideo && !isAudio && !isImage && (
                  <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-50 text-violet-700 font-bold rounded-xl hover:bg-violet-100 text-sm">
                    📎 View File ↗
                  </a>
                )}
              </div>
            )}

            {selected.status === 'PENDING' && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-sm mb-3">Review Decision</h3>
                <textarea className="w-full p-3 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-300" rows="2"
                  placeholder="Notes for the worker..." value={notes} onChange={e => setNotes(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => handleReview('APPROVED')} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold disabled:opacity-50">✓ Approve</button>
                  <button onClick={() => handleReview('REJECTED')} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold disabled:opacity-50">✗ Reject</button>
                </div>
              </div>
            )}
            {selected.admin_notes && (
              <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-700 border border-blue-100">
                <span className="font-bold">Admin Notes: </span>{selected.admin_notes}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <div className="text-center"><div className="text-5xl mb-3">🎬</div><p className="text-sm">Select a submission to review</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 4 — Course Management
// ════════════════════════════════════════════════════════════════════════════
function CourseManagementTab() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', category: '', video_url: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('courses'); // 'courses' | 'categories'
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const h = { headers: authHeaders() };
      const [catRes, courseRes] = await Promise.all([
        axios.get(`${API_URL}/api/course-categories/`, h),
        axios.get(`${API_URL}/api/courses/`, h),
      ]);
      setCategories(catRes.data);
      setCourses(courseRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addCourse = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await axios.post(`${API_URL}/api/courses/`, form, { headers: authHeaders() });
      setForm({ title: '', description: '', category: '', video_url: '' });
      load();
    } catch (e) { setError(JSON.stringify(e.response?.data || e.message)); }
    finally { setSaving(false); }
  };

  const addCategory = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await axios.post(`${API_URL}/api/course-categories/`, catForm, { headers: authHeaders() });
      setCatForm({ name: '', description: '' });
      load();
    } catch (e) { setError(JSON.stringify(e.response?.data || e.message)); }
    finally { setSaving(false); }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await axios.delete(`${API_URL}/api/courses/${id}/`, { headers: authHeaders() });
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Course Management</h2>
          <p className="text-gray-400 text-sm mt-1">Add training courses and categories for workers.</p>
        </div>
        <div className="flex gap-2">
          {['courses', 'categories'].map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${activeSection === s ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {activeSection === 'courses' ? (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Add course form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-violet-600" /> Add New Course</h3>
            <form onSubmit={addCourse} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category *</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Electrical Safety Basics"
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description *</label>
                <textarea required rows="3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Course description…"
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Video URL (optional)</label>
                <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/..."
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm disabled:opacity-50 hover:from-violet-700 hover:to-indigo-700 shadow transition-all">
                {saving ? 'Adding…' : '+ Add Course'}
              </button>
            </form>
          </div>

          {/* Course list */}
          <div className="lg:col-span-3 space-y-3">
            {loading ? <div className="text-gray-400 text-sm text-center py-10">Loading…</div>
              : courses.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">No courses yet. Add one!</div>
              : courses.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-start justify-between gap-3 hover:border-violet-200 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm truncate">{c.title}</span>
                      <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold shrink-0">{c.category_name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                    {c.video_url && <a href={c.video_url} target="_blank" rel="noreferrer" className="text-[11px] text-violet-600 hover:underline mt-1 inline-block">▶ Video Link</a>}
                  </div>
                  <button onClick={() => deleteCourse(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Add category form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-violet-600" /> Add Category</h3>
            <form onSubmit={addCategory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name *</label>
                <input required value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Safety Training"
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description *</label>
                <textarea required rows="3" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Category description…"
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm disabled:opacity-50 hover:from-violet-700 hover:to-indigo-700 shadow transition-all">
                {saving ? 'Adding…' : '+ Add Category'}
              </button>
            </form>
          </div>

          {/* Category list */}
          <div className="lg:col-span-3 space-y-3">
            {categories.length === 0
              ? <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">No categories yet.</div>
              : categories.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:border-violet-200 transition-all">
                  <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{c.description}</div>
                  <div className="text-[11px] text-violet-600 mt-1.5">{courses.filter(co => co.category === c.id || co.category_name === c.name).length} course(s)</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 5 — Enterprise Management
// ════════════════════════════════════════════════════════════════════════════
function EnterprisesTab() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/enterprises/`, { headers: authHeaders() });
        setEnterprises(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Registered Enterprises</h2>
        <p className="text-gray-400 text-sm mt-1">{enterprises.length} enterprise(s) registered on the platform.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : enterprises.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No enterprises registered yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enterprises.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 font-black text-lg">
                  {(e.business_name || 'B').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{e.business_name}</div>
                  <div className="text-xs text-gray-400">{e.user?.username || '—'}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                {e.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="text-gray-300">📍</span> {e.location}
                  </div>
                )}
                {e.user?.phone_number && (
                  <a href={`tel:${e.user.phone_number}`} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium">
                    <span>📞</span> {e.user.phone_number}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN AdminDashboard
// ════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const TABS = {
    overview:    <OverviewTab />,
    profiles:    <ProfileVerificationTab />,
    submissions: <TaskSubmissionsTab />,
    courses:     <CourseManagementTab />,
    enterprises: <EnterprisesTab />,
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", background: '#F5F3FF' }}>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="w-60 shrink-0 flex flex-col sticky top-0 h-screen"
        style={{ background: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 60%, #4C1D95 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>LW</div>
          <div>
            <div className="text-white font-black text-sm">LocalWorks</div>
            <div className="text-violet-400 text-[10px] font-semibold tracking-widest uppercase">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: NavIcon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${active ? 'text-white shadow-lg' : 'text-violet-300 hover:text-white hover:bg-white/10'}`}
                style={active ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.6), rgba(109,40,217,0.6))' } : {}}>
                {React.createElement(NavIcon, { className: "w-4 h-4 shrink-0" })}
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Admin badge */}
        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="text-white text-xs font-bold">Administrator</div>
            <div className="text-violet-400 text-[10px] mt-0.5">Full access</div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-violet-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6">
        {TABS[activeTab]}
      </main>
    </div>
  );
}
