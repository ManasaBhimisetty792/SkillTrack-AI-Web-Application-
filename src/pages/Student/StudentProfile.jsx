import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { userService } from '../../services/userService';
import { FiUser, FiMail, FiMapPin, FiGlobe, FiGithub, FiLinkedin, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.student@skilltrack.ai',
    title: 'Full Stack Engineer & AI Specialist',
    location: 'San Francisco, CA',
    githubUrl: 'https://github.com/alexjohnson',
    linkedinUrl: 'https://linkedin.com/in/alexjohnson',
    bio: 'Passionate about building scalable React 19 frontends, Python microservices, and AI models.',
  });

  useEffect(() => {
    async function load() {
      const data = await userService.getProfile();
      if (data) setProfile((prev) => ({ ...prev, ...data }));
    }
    load();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    userService.updateProfile(profile);
    toast.success('Profile settings updated successfully!');
  };

  return (
    <DashboardLayout title="Candidate Profile">
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Personal & Technical Profile</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input-glass"
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="input-glass"
                style={{ opacity: 0.7 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Professional Headline</label>
            <input
              type="text"
              value={profile.title || ''}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              className="input-glass"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                value={profile.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                className="input-glass"
              />
            </div>
            <div>
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedinUrl || ''}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                className="input-glass"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Professional Bio</label>
            <textarea
              rows={4}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="input-glass"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            <FiSave /> Save Profile Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
