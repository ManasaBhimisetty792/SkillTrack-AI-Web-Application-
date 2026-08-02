import React, { useEffect, useState, useCallback } from 'react';
import {
  FiUsers, FiSearch, FiCheck, FiX, FiEye, FiBriefcase, FiMapPin,
  FiStar, FiFilter, FiCalendar, FiClock, FiGlobe, FiLinkedin,
  FiGithub, FiFileText, FiRefreshCw, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';
import toast from 'react-hot-toast';

export const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [rejectingCandidate, setRejectingCandidate] = useState(null);

  // Reject / Reschedule Form State
  const [rejectAction, setRejectAction] = useState('reject_only'); // 'reject_only' | 'reschedule'
  const [rejectReason, setRejectReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recruiterService.getLiveCandidatesPool();
      setCandidates(data || []);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      toast.error('Failed to load candidate pool from Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const filteredCandidates = candidates.filter((c) => {
    const matchesTab =
      tab === 'All' ? true :
      tab === 'Suitable' ? (c.fit === 'Suitable' || c.interview_status === 'accepted') :
      (c.fit === 'Maybe' || c.interview_status === 'pending');
    const matchesSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.skills || []).some((s) => (s || '').toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Accept Handler (Case 1)
  const handleAccept = async (c) => {
    try {
      await recruiterService.acceptInterviewRequest(c.request_id || c.id, c.user_id || c.id, 'Recruiter');
      toast.success(`🎉 Accepted interview for ${c.name}! Meeting link generated.`);
      setCandidates(prev => prev.map(item => item.id === c.id ? { ...item, fit: 'Suitable', interview_status: 'accepted' } : item));
    } catch (err) {
      console.error('Accept error:', err);
      toast.error('Failed to accept request.');
    }
  };

  // Reject / Reschedule Submission Handler (Case 2)
  const handleConfirmRejectOrReschedule = async (e) => {
    e.preventDefault();
    if (!rejectingCandidate) return;
    setSubmitting(true);

    try {
      await recruiterService.rejectOrRescheduleRequest(
        rejectingCandidate.request_id || rejectingCandidate.id,
        rejectingCandidate.user_id || rejectingCandidate.id,
        {
          action: rejectAction === 'reschedule' ? 'reschedule' : 'reject',
          rejectReason,
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          recruiterName: 'Recruiter',
        }
      );

      if (rejectAction === 'reschedule') {
        toast.success(`🔄 Reschedule proposal sent to ${rejectingCandidate.name}!`);
      } else {
        toast.error(`❌ Request declined for ${rejectingCandidate.name}.`);
      }

      setCandidates(prev =>
        prev.map(item => item.id === rejectingCandidate.id
          ? { ...item, fit: 'Rejected', interview_status: rejectAction === 'reschedule' ? 'reschedule_requested' : 'rejected' }
          : item
        )
      );
      setRejectingCandidate(null);
      setRejectReason('');
      setRescheduleDate('');
      setRescheduleTime('');
    } catch (err) {
      console.error('Reject/Reschedule error:', err);
      toast.error('Failed to process action.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Candidate Talent Pool">
      {/* Search & Filter Header */}
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Suitable', 'Maybe'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: tab === t ? '1px solid #1abc9c' : '1px solid #e2e8f0',
                  background: tab === t ? '#1abc9c' : '#fff',
                  color: tab === t ? '#fff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 280 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search candidate, role or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <button onClick={fetchCandidates} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <FiLoader className="spin-animation" style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 700 }}>Fetching Live Candidate Pool...</div>
        </div>
      )}

      {/* Candidates List */}
      {!loading && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Candidate Talent Pool ({filteredCandidates.length})
          </h3>

          {filteredCandidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
              No candidates found matching criteria.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredCandidates.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #eef1f5',
                    flexWrap: 'wrap',
                  }}
                >
                  <img
                    src={c.img}
                    alt={c.name}
                    style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
                  />

                  <div style={{ flex: '1 1 200px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{c.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{c.role}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span><FiBriefcase style={{ marginRight: 4 }} />{c.exp}</span>
                      <span><FiMapPin style={{ marginRight: 4 }} />{c.loc}</span>
                      <span>📅 Applied: {c.applied_date}</span>
                    </div>
                  </div>

                  <div style={{ minWidth: 110 }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ATS Score</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c.ats >= 85 ? '#149174' : '#d97706' }}>
                      {c.ats}%
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: c.interview_status === 'accepted' ? '#e6f9f4' : c.interview_status === 'rejected' ? '#fef2f2' : '#fef3e0',
                        color: c.interview_status === 'accepted' ? '#149174' : c.interview_status === 'rejected' ? '#ef4444' : '#b8860b',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    >
                      {c.interview_status}
                    </span>
                  </div>

                  <div style={{ flex: '1 1 180px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Key Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {(c.skills || []).map((s) => (
                        <span key={s} className="badge-glass" style={{ fontSize: '0.72rem' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedCandidate(c)}
                      className="btn btn-outline"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FiEye /> View Profile
                    </button>

                    {c.interview_status !== 'accepted' && (
                      <button
                        onClick={() => handleAccept(c)}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FiCheck /> Accept
                      </button>
                    )}

                    {c.interview_status !== 'rejected' && (
                      <button
                        onClick={() => setRejectingCandidate(c)}
                        className="btn btn-outline"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fecaca', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FiX /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Candidate Profile Summary Modal ── */}
      {selectedCandidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11, 21, 51, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 580, padding: '2rem', background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Complete Candidate Profile</h3>
              <button onClick={() => setSelectedCandidate(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.3rem' }}><FiX /></button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <img src={selectedCandidate.img} alt="" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 0.5rem', objectFit: 'cover' }} />
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{selectedCandidate.name}</h4>
              <p style={{ margin: '0.2rem 0 0', color: 'var(--color-muted)', fontSize: '0.88rem' }}>{selectedCandidate.role} • {selectedCandidate.exp}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
                <div><strong>Email:</strong> {selectedCandidate.email || 'N/A'}</div>
                <div style={{ marginTop: '0.3rem' }}><strong>Phone:</strong> {selectedCandidate.phone || 'N/A'}</div>
                <div style={{ marginTop: '0.3rem' }}><strong>Location:</strong> {selectedCandidate.loc}</div>
                <div style={{ marginTop: '0.3rem' }}><strong>ATS Score:</strong> <span style={{ color: '#10B981', fontWeight: 800 }}>{selectedCandidate.ats}%</span></div>
              </div>

              {selectedCandidate.bio && (
                <div>
                  <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.9rem', fontWeight: 700 }}>Bio / Summary</h4>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>{selectedCandidate.bio}</p>
                </div>
              )}

              <div>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>Skills & Expertise</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(selectedCandidate.skills || []).map(s => <span key={s} className="badge-glass" style={{ fontSize: '0.75rem' }}>{s}</span>)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {selectedCandidate.github_url && (
                  <a href={selectedCandidate.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiGithub /> GitHub
                  </a>
                )}
                {selectedCandidate.linkedin_url && (
                  <a href={selectedCandidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiLinkedin /> LinkedIn
                  </a>
                )}
                {selectedCandidate.portfolio_url && (
                  <a href={selectedCandidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiGlobe /> Portfolio
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedCandidate(null)} className="btn btn-outline">Close</button>
              <button onClick={() => { handleAccept(selectedCandidate); setSelectedCandidate(null); }} className="btn btn-primary">Schedule Interview</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject / Reschedule Modal ── */}
      {rejectingCandidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11, 21, 51, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: '1.75rem', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Reject / Reschedule {rejectingCandidate.name}</h3>
              <button onClick={() => setRejectingCandidate(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
            </div>

            <form onSubmit={handleConfirmRejectOrReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem' }}>Action Type</label>
                <select
                  value={rejectAction}
                  onChange={(e) => setRejectAction(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="reject_only">Reject Only</option>
                  <option value="reschedule">Reject & Offer Reschedule</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem' }}>Reason (Optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., Schedule conflict on requested day. Looking for senior system architecture experience."
                  rows={3}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.85rem' }}
                />
              </div>

              {rejectAction === 'reschedule' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>New Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>New Time</label>
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.65rem', background: rejectAction === 'reschedule' ? '#4F46E5' : '#EF4444' }}
                >
                  {submitting ? 'Processing...' : (rejectAction === 'reschedule' ? 'Offer Reschedule' : 'Confirm Rejection')}
                </button>
                <button type="button" onClick={() => setRejectingCandidate(null)} className="btn btn-outline" style={{ padding: '0.65rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Candidates;
