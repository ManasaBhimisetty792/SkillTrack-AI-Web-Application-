import React, { useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiUsers, FiSearch, FiShield } from 'react-icons/fi';

export const UserManagement = () => {
  const users = [
    { id: '1', name: 'Alex Johnson', email: 'alex.student@skilltrack.ai', role: 'student', status: 'Active' },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah.recruiter@techcorp.com', role: 'recruiter', status: 'Active' },
    { id: '3', name: 'David Vance', email: 'admin@skilltrack.ai', role: 'admin', status: 'Active' },
  ];

  return (
    <DashboardLayout title="User Governance & Management">
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Platform Account Directory</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', color: 'var(--color-muted)' }}>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Email</th>
              <th style={{ padding: '0.75rem' }}>Role</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.4)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{u.name}</td>
                <td style={{ padding: '0.75rem', color: 'var(--color-muted)' }}>{u.email}</td>
                <td style={{ padding: '0.75rem' }}><span className="badge-ai">{u.role.toUpperCase()}</span></td>
                <td style={{ padding: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
