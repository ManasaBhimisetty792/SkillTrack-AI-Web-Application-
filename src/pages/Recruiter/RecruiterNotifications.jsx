import React, { useEffect, useState } from 'react';
import {
  FiBell, FiCheck, FiClock, FiX, FiCheckCircle, FiDollarSign, FiFilter
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';

export const RecruiterNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    recruiterService.getNotifications().then((data) => setNotifications(data));
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (tab === 'Unread') return !n.read;
    if (tab === 'Requests') return n.category === 'Requests';
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
            {['All', 'Unread', 'Requests', 'Interviews'].map((t) => (
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
                {t}
              </button>
            ))}
          </div>

          <button onClick={handleMarkAllRead} className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
            Mark all as read
          </button>
        </div>
      </div>

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
    </DashboardLayout>
  );
};

export default RecruiterNotifications;
