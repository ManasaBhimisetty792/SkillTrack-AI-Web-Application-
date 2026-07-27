import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

export const AuditLogs = () => {
  const logs = [
    { timestamp: '2026-07-25 20:15:02', user: 'Alex Johnson', action: 'OAuth Login Success (Google)', ip: '192.168.1.1' },
    { timestamp: '2026-07-25 19:42:18', user: 'Sarah Jenkins', action: 'Created Job Posting: Lead Full Stack Engineer', ip: '172.16.0.4' },
    { timestamp: '2026-07-25 18:30:45', user: 'David Vance', action: 'Approved Recruiter Profile: Nexus Tech', ip: '10.0.0.12' },
  ];

  return (
    <DashboardLayout title="Security Audit Logs">
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Real-time Audit Trail</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', color: 'var(--color-muted)' }}>
              <th style={{ padding: '0.75rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem' }}>User / Identity</th>
              <th style={{ padding: '0.75rem' }}>Action Executed</th>
              <th style={{ padding: '0.75rem' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.4)' }}>
                <td style={{ padding: '0.75rem', color: 'var(--color-muted)' }}>{l.timestamp}</td>
                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{l.user}</td>
                <td style={{ padding: '0.75rem' }}>{l.action}</td>
                <td style={{ padding: '0.75rem', color: 'var(--color-muted)' }}>{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
