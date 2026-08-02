import React, { useEffect, useState, useCallback } from 'react';
import {
  FiBell, FiCheck, FiClock, FiX, FiCheckCircle, FiDollarSign, FiFilter, FiLoader
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';
import toast from 'react-hot-toast';

export const RecruiterNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notifsData, requestsData] = await Promise.all([
        recruiterService.getNotifications(),
        recruiterService.getInterviewRequests(),
      ]);
      setNotifications(notifsData || []);
      setRequests(requestsData || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResponse = async (requestId, action, studentUserId) => {
    try {
      const req = requests.find(r => r.id === requestId);
      const recruiterName = 'Recruiter'; // can be pulled from auth context if needed

      if (action === 'accepted') {
        await recruiterService.acceptInterviewRequest(requestId, studentUserId, recruiterName);
        toast.success('✅ Interview accepted! Meeting link generated and student notified.');
      } else if (action === 'rejected') {
        await recruiterService.rejectOrRescheduleRequest(requestId, studentUserId, {
          action: 'reject',
          rejectReason: '',
          recruiterName,
        });
        toast.error('❌ Request declined. Student has been notified.');
      }

      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action } : r));
    } catch (err) {
      console.error('handleResponse error:', err);
      toast.error('Failed to process request.');
    }
  };


  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const filteredNotifs = notifications.filter((n) => {
    if (tab === 'Unread') return !n.read;
    if (tab === 'Interviews') return n.category === 'Interviews';
    if (tab === 'System') return n.category === 'System';
    return true;
  });

  const getIcon = (icon) => {
    switch (icon) {
      case 'request':
        return { Icon: FiBell, bg: '#e6f9f4', color: '#149174' };
      case 'accept':
        return { Icon: FiCheckCircle, bg: '#ecfdf5', color: '#16a34a' };
      case 'reminder':
        return { Icon: FiClock, bg: '#fef3e0', color: '#b8860b' };
      case 'cancel':
        return { Icon: FiX, bg: '#fef2f2', color: '#ef4444' };
      case 'payout':
        return { Icon: FiDollarSign, bg: '#e0f2fe', color: '#0284c7' };
      default:
        return { Icon: FiBell, bg: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <DashboardLayout title="Recruiter Notifications & Alerts">
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Requests', 'Unread', 'Interviews'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: tab === t ? '1px solid #1abc9c' : '1px solid #e2e8f0',
                  background: tab === t ? '#1abc9c' : '#fff',
                  color: tab === t ? '#fff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                {t} {t === 'Requests' && requests.filter(r => r.status === 'pending').length > 0 && (
                  <span style={{ marginLeft: 4, background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' }}>
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button onClick={handleMarkAllRead} className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
            Mark all as read
          </button>
        </div>
      </div>

      {/* Live Interview Requests from Supabase */}
      {(tab === 'All' || tab === 'Requests') && (
        <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>
            📅 Candidate Interview Requests ({requests.length})
          </h3>
          {requests.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>No pending interview requests found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 300px' }}>
                    <img
                      src={req.candidate_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.candidate_name || 'Candidate')}&background=4f46e5&color=fff`}
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-primary-light)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                        {req.candidate_name || 'Candidate'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {req.interview_type || 'Mock Interview'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.15rem' }}>
                        📅 Date: {new Date(req.preferred_datetime).toLocaleString()}
                      </div>
                      {req.message && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                          "{req.message}"
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                        Status: <span style={{ fontWeight: 700, textTransform: 'capitalize', color: req.status === 'accepted' ? '#10B981' : req.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>{req.status}</span>
                      </div>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleResponse(req.id, 'accepted', req.student_id)}
                        className="btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FiCheck /> Accept
                      </button>
                      <button
                        onClick={() => handleResponse(req.id, 'rejected', req.student_id)}
                        className="btn-secondary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FiX /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notification History */}
      {(tab !== 'Requests') && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Notification History ({filteredNotifs.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredNotifs.map((n) => {
              const { Icon, bg, color } = getIcon(n.icon);
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '10px',
                    background: n.read ? '#fff' : '#f0fdf4',
                    border: n.read ? '1px solid #eef1f5' : '1px solid #bbf7d0',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: bg,
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={color} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: n.read ? 500 : 700, color: '#0f172a' }}>
                      {n.text}
                    </div>
                    {n.sub && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{n.sub}</div>}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RecruiterNotifications;
