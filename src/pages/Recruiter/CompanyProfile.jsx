import React, { useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiBriefcase, FiGlobe, FiMapPin, FiSave, FiLinkedin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

export const CompanyProfile = () => {
  const { user } = useAuth();
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || user?.linkedin_url || 'https://linkedin.com/in/recruiter-demo');
  const [company, setCompany] = useState(user?.company || 'Nexus Tech Global');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (user?.id) {
        await userService.updateLinkedInUrl(user.id, linkedinUrl);
      }
      toast.success('Company & Recruiter profile updated successfully in Supabase!');
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    }
  };

  return (
    <DashboardLayout title="Recruiter Company Profile">
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Company & Branding Info</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label">Company Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="input-glass"
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiLinkedin style={{ color: '#0077b5' }} /> Recruiter LinkedIn Profile URL (For Admin Verification)
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="input-glass"
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.25rem', display: 'block' }}>
              This URL is verified by platform administrators to grant recruiter privileges.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Website</label>
              <input type="url" defaultValue="https://nexustech.global" className="input-glass" />
            </div>
            <div>
              <label className="form-label">Headquarters Location</label>
              <input type="text" defaultValue="San Francisco, CA" className="input-glass" />
            </div>
          </div>

          <div>
            <label className="form-label">Company Overview</label>
            <textarea rows={4} defaultValue="Nexus Tech Global is a premier AI and cloud infrastructure provider building distributed web platforms." className="input-glass" />
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            <FiSave /> Save Profile Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfile;
