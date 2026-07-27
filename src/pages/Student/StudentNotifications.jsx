import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { notificationService } from '../../services/notificationService';
import { FiBell, FiCheckCircle, FiInfo, FiAward } from 'react-icons/fi';

export const StudentNotifications = () => {
  const [list, setList] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await notificationService.getNotifications();
      setList(data);
    }
    load();
  }, []);

  return (
    <DashboardLayout title="System Notifications">
      <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Recent Alerts & Recruiter Updates</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {list.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: item.read ? 'rgba(248, 250, 252, 0.6)' : 'rgba(79, 70, 229, 0.06)',
                border: item.read ? '1px solid rgba(226, 232, 240, 0.6)' : '1px solid rgba(79, 70, 229, 0.2)',
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiBell />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{item.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{item.time}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentNotifications;
