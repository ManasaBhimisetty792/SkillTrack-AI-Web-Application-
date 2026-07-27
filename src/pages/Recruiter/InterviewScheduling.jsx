import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiCalendar, FiClock, FiVideo, FiCheckCircle } from 'react-icons/fi';

export const InterviewScheduling = () => {
  const events = [
    { time: '10:00 AM', candidate: 'Alex Johnson', role: 'Full Stack React Engineer', type: 'Live Coding & AI Review' },
    { time: '02:00 PM', candidate: 'Elena Rostova', role: 'Senior Cloud Engineer', type: 'System Architecture Round' },
    { time: '04:30 PM', candidate: 'Marcus Chen', role: 'AI Infrastructure Lead', type: 'Behavioral & Leadership' },
  ];

  return (
    <DashboardLayout title="Automated Interview Calendar">
      <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Today's Scheduled Video Interviews</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((ev, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem 0.85rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {ev.time}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{ev.candidate}</h4>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{ev.role} • {ev.type}</span>
                </div>
              </div>
              <button className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}>
                <FiVideo /> Join Session
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewScheduling;
