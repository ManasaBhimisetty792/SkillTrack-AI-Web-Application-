import React, { useEffect, useState } from 'react';
import {
  FiCalendar, FiVideo, FiClock, FiCheck, FiX, FiEdit2, FiPlus, FiUser
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';

export const InterviewScheduling = () => {
  const [interviews, setInterviews] = useState({ schedule: [], history: [] });
  const [tab, setTab] = useState('Upcoming');

  useEffect(() => {
    recruiterService.getInterviews().then((data) => setInterviews(data));
  }, []);

  return (
    <DashboardLayout title="Interview Scheduling & Management">
      {/* Header Controls */}
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Upcoming', 'Completed'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '8px',
                  border: tab === t ? '1px solid #1abc9c' : '1px solid #e2e8f0',
                  background: tab === t ? '#1abc9c' : '#fff',
                  color: tab === t ? '#fff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {t} Interviews
              </button>
            ))}
          </div>

          <button onClick={() => alert('New Interview Schedule Triggered')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiPlus /> Schedule New Interview
          </button>
        </div>
      </div>

      {/* Main Interviews List */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          {tab === 'Upcoming' ? "Scheduled Today & Upcoming" : "Past Interview Sessions"}
        </h3>

        {tab === 'Upcoming' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {interviews.schedule?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  background: '#fff',
                  border: '1px solid #eef1f5',
                  flexWrap: 'wrap',
                }}
              >
                <img src={item.img} alt="" style={{ width: 44, height: 44, borderRadius: '50%' }} />

                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>{item.role}</div>
                </div>

                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Time & Duration</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    <FiClock style={{ marginRight: 4 }} /> {item.time} (60m)
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: item.status === 'Confirmed' ? '#e6f9f4' : '#fef3e0',
                      color: item.status === 'Confirmed' ? '#149174' : '#b8860b',
                      fontWeight: 700,
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => alert(`Joining live interview with ${item.name}`)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiVideo /> Join Live Room
                  </button>
                  <button onClick={() => alert('Reschedule modal opened')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <FiEdit2 /> Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {interviews.history?.map((h) => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  background: '#fff',
                  border: '1px solid #eef1f5',
                  flexWrap: 'wrap',
                }}
              >
                <img src={h.img} alt="" style={{ width: 42, height: 42, borderRadius: '50%' }} />

                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{h.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>{h.role}</div>
                </div>

                <div style={{ minWidth: 140 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed Date</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{h.date} • {h.time}</div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: h.status === 'Completed' ? '#e6f9f4' : '#fef2f2',
                      color: h.status === 'Completed' ? '#149174' : '#ef4444',
                      fontWeight: 700,
                    }}
                  >
                    {h.status}
                  </span>
                </div>

                <button onClick={() => alert(`Feedback for ${h.name}`)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  View Feedback
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InterviewScheduling;
