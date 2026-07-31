import React, { useState } from 'react';
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiVideo, FiPlus, FiEdit2, FiUser
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

export const RecruiterSchedule = () => {
  const [selectedDay, setSelectedDay] = useState(31);

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const grid = [null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  const scheduleList = [
    { id: 1, time: '10:00 AM', duration: '60 min', name: 'Akhila Reddy', role: 'Python Developer', status: 'Confirmed', img: 'https://i.pravatar.cc/80?img=47' },
    { id: 2, time: '02:00 PM', duration: '45 min', name: 'Rahul Kumar', role: 'Full Stack Developer', status: 'Confirmed', img: 'https://i.pravatar.cc/80?img=12' },
    { id: 3, time: '04:00 PM', duration: '60 min', name: 'Priya Sharma', role: 'React Developer', status: 'Pending', img: 'https://i.pravatar.cc/80?img=25' },
  ];

  return (
    <DashboardLayout title="Interviews & Calendar Schedule">
      <div className="grid-responsive grid-col-3" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Calendar Picker Widget */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <FiChevronLeft style={{ cursor: 'pointer', color: '#94a3b8' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>July 2026</span>
            <FiChevronRight style={{ cursor: 'pointer', color: '#94a3b8' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            {days.map((d) => <div key={d}>{d}</div>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {grid.map((d, i) => (
              <button
                key={i}
                disabled={!d}
                onClick={() => d && setSelectedDay(d)}
                style={{
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  padding: '0.45rem 0',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: d ? 'pointer' : 'default',
                  background: d === selectedDay ? '#1abc9c' : 'transparent',
                  color: d === selectedDay ? '#fff' : d ? '#334155' : 'transparent',
                  fontWeight: d === selectedDay ? 700 : 400,
                }}
              >
                {d || '.'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Date Timeline view */}
        <div className="glass-card" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Schedule for {selectedDay} July 2026
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>3 slots reserved</span>
            </div>

            <button onClick={() => alert('Schedule interview clicked')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <FiPlus /> Add Slot
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {scheduleList.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: '#fff',
                  border: '1px solid #eef1f5',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 80, fontSize: '0.85rem', color: '#64748b' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{s.time}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.duration}</div>
                </div>

                <img src={s.img} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />

                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{s.role}</div>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: s.status === 'Confirmed' ? '#e6f9f4' : '#fef3e0',
                    color: s.status === 'Confirmed' ? '#149174' : '#b8860b',
                    fontWeight: 700,
                  }}
                >
                  {s.status}
                </span>

                <button onClick={() => alert(`Rescheduling slot for ${s.name}`)} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiEdit2 /> Reschedule
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterSchedule;
