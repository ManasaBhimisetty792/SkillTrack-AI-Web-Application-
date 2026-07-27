import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiSettings, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const RecruiterSettings = () => {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Recruiter portal settings updated.');
  };

  return (
    <DashboardLayout title="Recruiter Portal Settings">
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Notification & Screening Settings</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Default Minimum ATS Cutoff Score</label>
            <input type="number" defaultValue={85} className="input-glass" />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}><FiSave /> Save Settings</button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterSettings;
