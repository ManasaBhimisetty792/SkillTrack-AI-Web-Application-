import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiSettings, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const PlatformSettings = () => {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Global platform configurations saved.');
  };

  return (
    <DashboardLayout title="Global Platform Settings">
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>AI & Supabase System Configuration</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Active Neural LLM Engine</label>
            <select className="input-glass">
              <option value="gpt4o">SkillTrack Neural Model v3.0 (Recommended)</option>
              <option value="claude">SkillTrack Technical Rubric v2.5</option>
            </select>
          </div>
          <div>
            <label className="form-label">Supabase OAuth Redirect Base URL</label>
            <input type="text" defaultValue="http://localhost:5173" className="input-glass" />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}><FiSave /> Save Settings</button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PlatformSettings;
