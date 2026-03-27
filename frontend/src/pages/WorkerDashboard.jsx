import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  User, BookOpen, MessageSquare, Briefcase, LogOut, Send,
  ShieldCheck, Star, MapPin, Phone, ChevronRight, Loader2,
  CheckCircle, XCircle, Clock, UploadCloud, X
} from 'lucide-react';
import WorkerProfileComplete from './WorkerProfileComplete';
import { API_URL } from '../config';

const token = () => localStorage.getItem('token');
const authH = () => ({ Authorization: `Token ${token()}` });

// ─── Nav config ──────────────────────────────────────────────────────────────
const NAV = [
  { id: 'profile',   label: 'My Profile',    icon: User },
  { id: 'courses',   label: 'Training',       icon: BookOpen },
  { id: 'messages',  label: 'Messages',       icon: MessageSquare },
  { id: 'hire',      label: 'Hire Requests',  icon: Briefcase },
];

// ════════════════════════════════════════════════════════════════════════════
// Worker Chat Inbox  
// ════════════════════════════════════════════════════════════════════════════
function MessagesTab({ workerId }) {
  const [threads, setThreads] = useState([]);     // unique enterprises
  const [selected, setSelected] = useState(null); // { enterpriseId, name }
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const pollRef  = useRef(null);

  // Fetch all messages → group by enterprise
  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/`, { headers: authH() });
      const all = res.data;
      // Unique enterprises from messages
      const map = {};
      all.forEach(m => {
        const eid = m.enterprise;
        if (!map[eid]) map[eid] = { enterpriseId: eid, name: m.sender_role === 'ENTERPRISE' ? m.sender_name : '—', msgs: [] };
        map[eid].msgs.push(m);
        if (m.sender_role === 'ENTERPRISE') map[eid].name = m.sender_name;
      });
      const list = Object.values(map);
      setThreads(list);
      // If a thread is selected, refresh its messages
      if (selected) {
        const updated = list.find(t => t.enterpriseId === selected.enterpriseId);
        if (updated) setMsgs(updated.msgs);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) {
      const t = threads.find(t => t.enterpriseId === selected.enterpriseId);
      if (t) setMsgs(t.msgs);
    }
  }, [threads, selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const openThread = async (thread) => { 
    setSelected(thread); 
    setMsgs(thread.msgs);
    // Mark as read in backend
    try {
      await axios.post(`${API_URL}/api/messages/mark_read/`, {
        enterprise_id: thread.enterpriseId
      }, { headers: authH() });
      fetchAll(); // Refresh to clear badges locally
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/messages/`, {
        enterprise: selected.enterpriseId,
        worker: workerId,
        body: text.trim(),
      }, { headers: authH() });
      setText('');
      fetchAll();
    } catch (err) { alert('Send failed: ' + (err.response?.data?.detail || err.message)); }
    finally { setSending(false); }
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-140px)]">
      {/* Thread list */}
      <div className="w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-50">
          <h3 className="font-black text-gray-900">Inbox</h3>
          <p className="text-xs text-gray-400 mt-0.5">Messages from enterprises</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-24"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
          ) : threads.length === 0 ? (
            <div className="text-center text-gray-400 text-xs p-6">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              No messages yet
            </div>
          ) : threads.map(t => (
            <button key={t.enterpriseId} onClick={() => openThread(t)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-50 transition-all hover:bg-violet-50
                ${selected?.enterpriseId === t.enterpriseId ? 'bg-violet-50 border-l-2 border-l-violet-500' : ''}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shrink-0 text-sm"
                style={{ background: 'linear-gradient(135deg, #6D28D9, #4F46E5)' }}>
                {(t.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{t.name}</div>
                <div className="text-[11px] text-gray-400">{t.msgs.length} message(s)</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #4C1D95, #4F46E5)' }}>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-black">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-bold text-sm">{selected.name}</div>
                <div className="text-violet-300 text-[11px]">Enterprise</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
              {msgs.map(m => {
                const isMine = m.sender_role === 'WORKER';
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMine ? 'text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                    }`} style={isMine ? { background: 'linear-gradient(135deg, #6D28D9, #4F46E5)' } : {}}>
                      {m.body}
                      <div className={`text-[10px] mt-1 ${isMine ? 'text-violet-200' : 'text-gray-400'}`}>
                        {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMsg} className="flex items-center gap-2 p-4 bg-white border-t border-gray-100">
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Reply to enterprise…"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
              <button type="submit" disabled={sending || !text.trim()}
                className="p-2.5 rounded-2xl text-white disabled:opacity-40 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #6D28D9, #4F46E5)' }}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <MessageSquare className="w-12 h-12 mb-3" />
            <p className="text-sm font-medium">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Hire Requests Tab (Job Applications sent to this worker)
// ════════════════════════════════════════════════════════════════════════════
const JOB_STATUS_PILL = {
  APPLIED:  'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

function HireRequestsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/job-applications/${appId}/`, {
        status: newStatus
      }, { headers: authH() });
      // Refresh list
      const res = await axios.get(`${API_URL}/api/job-applications/`, { headers: authH() });
      setApplications(res.data);
    } catch (e) {
      alert('Failed to update status: ' + JSON.stringify(e.response?.data || e.message));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/job-applications/`, { headers: authH() });
        setApplications(res.data);
      } catch (e) { console.error('Fetch hire requests failed:', e.response?.data || e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Hire Requests</h2>
        <p className="text-gray-400 text-sm mt-1">Job offers sent to you by enterprises.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">No hire requests yet.</p>
          <p className="text-gray-300 text-xs mt-1">Enterprises can send you job offers from the business dashboard.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {applications.map(app => {
            const job = app.job_detail;
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all">
                {/* Job Title */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-black text-gray-900 text-base">{job?.title || 'Job Offer'}</h3>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${JOB_STATUS_PILL[app.status] || 'bg-gray-100 text-gray-600'}`}>
                    {app.status}
                  </span>
                </div>

                {/* Job details */}
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{job?.description}</p>

                <div className="space-y-1.5">
                  {job?.location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5 text-gray-300" /> {job.location}
                    </div>
                  )}
                  {job?.skill_required && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Briefcase className="w-3.5 h-3.5 text-gray-300" /> {job.skill_required}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-gray-300" /> {new Date(app.applied_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                {app.status === 'APPLIED' ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                      className="py-2.5 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                      className="py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]">
                      <CheckCircle className="w-3.5 h-3.5" /> Confirm
                    </button>
                  </div>
                ) : (
                  <>
                    {app.status === 'ACCEPTED' && (
                      <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 text-xs text-emerald-700 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Hire confirmed! Contact enterprise to start.
                      </div>
                    )}
                    {app.status === 'REJECTED' && (
                      <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-400 font-bold flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> You rejected this hire request.
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Profile Tab
// ════════════════════════════════════════════════════════════════════════════
function ProfileTab({ profile }) {
  if (!profile) return null;
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-gray-900">My Profile</h2>
        <p className="text-gray-400 text-sm mt-1">Your worker information visible to enterprises.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6D28D9, #4F46E5)' }}>
            {(profile.user?.first_name || 'W').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{profile.user?.first_name} {profile.user?.last_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {profile.is_verified
                ? <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>
                : <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Pending Verification</span>
              }
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">{profile.level}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Skills',      value: profile.skills || 'N/A' },
            { label: 'Experience',  value: `${profile.experience_years || 0} years` },
            { label: 'Location',    value: profile.location || 'N/A' },
            { label: 'Daily Rate',  value: `₹${profile.expected_wage || 'N/A'}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-0.5">{label}</div>
              <div className="text-sm font-bold text-gray-800 truncate">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Training + Verification Tab
// ════════════════════════════════════════════════════════════════════════════
function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const h = { headers: authH() };
      const [cr, tr] = await Promise.all([
        axios.get(`${API_URL}/api/courses/`, h),
        axios.get(`${API_URL}/api/verification-tasks/`, h),
      ]);
      setCourses(cr.data);
      setTasks(tr.data);
    })();
  }, []);

  const handleUpload = async () => {
    if (!selectedTask || !file) { setUploadStatus('Please select a task and file.'); return; }
    setUploading(true); setUploadStatus('');
    const fd = new FormData();
    fd.append('task', selectedTask);
    fd.append('submitted_file', file);
    try {
      await axios.post(`${API_URL}/api/verifications/`, fd, {
        headers: { ...authH(), 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus('✅ Uploaded! Pending admin review.');
      setFile(null); setSelectedTask('');
    } catch { setUploadStatus('❌ Upload failed. Try again.'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Training & Verification</h2>
        <p className="text-gray-400 text-sm mt-1">Complete courses and submit verification tasks.</p>
      </div>

      {/* Courses */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Available Courses</h3>
        {courses.length === 0
          ? <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">No courses available yet.</div>
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-violet-200 hover:shadow-md transition-all">
                <div className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg inline-block mb-2">{c.category_name}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{c.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-2">{c.description}</p>
                {c.video_url && (
                  <a href={c.video_url} target="_blank" rel="noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800">
                    ▶ Watch Video
                  </a>
                )}
              </div>
            ))}
          </div>
        }
      </div>

      {/* Submit verification */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><UploadCloud className="w-4 h-4 text-violet-600" /> Submit Verification</h3>
        {tasks.length === 0
          ? <p className="text-sm text-gray-400">No tasks available. Admin will create tasks linked to courses.</p>
          : <div className="space-y-3 max-w-md">
            <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option value="">— Select a task —</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.method}: {t.prompt_text}</option>)}
            </select>
            <input type="file" onChange={e => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-violet-50 file:text-violet-700 file:font-semibold" />
            <button onClick={handleUpload} disabled={uploading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #6D28D9, #4F46E5)' }}>
              {uploading ? 'Uploading…' : 'Upload Verification File'}
            </button>
            {uploadStatus && <p className={`text-sm font-medium text-center ${uploadStatus.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>{uploadStatus}</p>}
          </div>
        }
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN WorkerDashboard
// ════════════════════════════════════════════════════════════════════════════
export default function WorkerDashboard() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/workers/`, { headers: authH() });
        if (res.data.length > 0) setProfile(res.data[0]);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Badge: count unread messages
  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/messages/`, { headers: authH() });
        setUnread(res.data.filter(m => !m.is_read && m.sender_role === 'ENTERPRISE').length);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    check();
    const t = setInterval(check, 10000);
    return () => clearInterval(t);
  }, []);

  // If profile incomplete, show completion form
  if (profile && !profile.id_proof) {
    return <WorkerProfileComplete profile={profile} onComplete={p => setProfile(p)} />;
  }

  const TABS = {
    profile:  <ProfileTab profile={profile} />,
    courses:  <CoursesTab />,
    messages: <MessagesTab workerId={profile?.id} />,
    hire:     <HireRequestsTab />,
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", background: '#F5F3FF' }}>

      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col sticky top-0 h-screen"
        style={{ background: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 60%, #4C1D95 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>LW</div>
          <div>
            <div className="text-white font-black text-sm">LocalWorks</div>
            <div className="text-violet-400 text-[10px] font-semibold tracking-widest uppercase">Worker</div>
          </div>
        </div>

        {/* Worker mini-card */}
        <div className="mx-4 mt-4 px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base mb-1.5"
            style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>
            {(profile?.user?.first_name || 'W').charAt(0).toUpperCase()}
          </div>
          <div className="text-white font-bold text-xs truncate">{profile?.user?.first_name} {profile?.user?.last_name}</div>
          <div className="text-violet-400 text-[10px] mt-0.5">{profile?.level || 'Worker'}</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 mt-3">
          {NAV.map(({ id, label, icon: NavIcon }) => {
            const active = activeTab === id;
            const badge = id === 'messages' && unread > 0;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative
                  ${active ? 'text-white shadow-lg' : 'text-violet-300 hover:text-white hover:bg-white/10'}`}
                style={active ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.6), rgba(109,40,217,0.6))' } : {}}>
                {React.createElement(NavIcon, { className: "w-4 h-4 shrink-0" })}
                {label}
                {badge && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">{unread}</span>
                )}
                {active && !badge && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-violet-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {TABS[activeTab]}
      </main>
    </div>
  );
}
