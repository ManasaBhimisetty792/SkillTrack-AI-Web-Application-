import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiGithub,
  FiLinkedin, FiGlobe, FiUploadCloud, FiCheckCircle, FiEdit3,
  FiSave, FiRefreshCw, FiEye, FiX, FiFileText
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { FaCrown } from 'react-icons/fa';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import MembershipBadge from '../../components/Navbar/MembershipBadge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './studentProfile.css';

export const StudentProfile = () => {
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Alex Johnson',
    username: user?.username || 'alex_johnson_ai',
    email: user?.email || 'alex.johnson@skilltrack.ai',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    role: 'Candidate',
    currentStatus: 'Student',
    bio: 'Passionate Full-Stack Systems Architect with expertise in React, FastAPI, and AI integration pipelines. Building enterprise-grade cloud native platforms.',
    githubUrl: 'https://github.com/alexjohnson',
    linkedinUrl: 'https://linkedin.com/in/alexjohnson',
    portfolioUrl: 'https://alexjohnson.dev'
  });

  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
  const [resumeFileName, setResumeFileName] = useState('Alex_Johnson_Resume_2026.pdf');
  const [editMode, setEditMode] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      toast.success('Profile photo preview updated!');
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      toast.success(`Uploaded: ${file.name}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('🎉 Profile updated successfully!');
    }, 800);
  };

  const profileCompletion = 88; // 88% complete

  return (
    <DashboardLayout title="User Profile">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── TOP SECTION: PROFILE SHOWCASE CARD ── */}
        <div className="profile-showcase-card">
          <div className="profile-cover-banner" />

          <div className="profile-header-content">
            <div className="profile-header-top">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem' }}>
                <div className="profile-avatar-wrapper">
                  <img src={photoPreview} alt={formData.fullName} className="profile-avatar-img" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{formData.fullName}</h2>
                    <MembershipBadge />
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                    @{formData.username} • <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{formData.role}</span> ({formData.currentStatus})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem' }}
                >
                  <FiEdit3 /> {editMode ? 'Hide Form' : 'Edit Profile'}
                </button>
              </div>
            </div>

            <div className="profile-details-grid">
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Professional Summary
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  {formData.bio}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <a href={formData.githubUrl} target="_blank" rel="noreferrer" className="social-link-btn">
                    <FiGithub /> GitHub
                  </a>
                  <a href={formData.linkedinUrl} target="_blank" rel="noreferrer" className="social-link-btn">
                    <FiLinkedin /> LinkedIn
                  </a>
                  <a href={formData.portfolioUrl} target="_blank" rel="noreferrer" className="social-link-btn">
                    <FiGlobe /> Portfolio
                  </a>
                </div>
              </div>

              {/* Stats & Progress Ring */}
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-muted)' }}>PROFILE COMPLETION</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-success)' }}>{profileCompletion}%</span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${profileCompletion}%`, background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: '9999px' }} />
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div>📍 Location: <strong style={{ color: 'var(--color-text)' }}>{formData.location}</strong></div>
                  <div>📄 Resume: <strong style={{ color: '#10B981' }}>{resumeFileName}</strong></div>
                  <div>⚡ Status: <strong style={{ color: 'var(--color-primary)' }}>Active Job Seeker</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: EDIT PROFILE FORM ── */}
        <div className="profile-edit-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUser style={{ color: 'var(--color-primary)' }} /> Edit Profile Details
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
              Autosaved 2 mins ago
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Photo & Resume Upload row */}
            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Profile Photo Upload</label>
                <div className="file-dropzone" onClick={() => document.getElementById('photoInput').click()}>
                  <FiUploadCloud style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.4rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to change photo</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>PNG, JPG or WEBP up to 5MB</div>
                  <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Primary Resume Upload</label>
                <div className="file-dropzone" onClick={() => document.getElementById('resumeInput').click()}>
                  <FiFileText style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', marginBottom: '0.4rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{resumeFileName || 'Upload PDF Resume'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>PDF or DOCX up to 10MB</div>
                  <input id="resumeInput" type="file" accept=".pdf,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                >
                  <option value="Candidate" style={{ background: '#1E1B4B' }}>Candidate</option>
                  <option value="Recruiter" style={{ background: '#1E1B4B' }}>Recruiter</option>
                  <option value="Admin" style={{ background: '#1E1B4B' }}>Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Current Status</label>
                <select
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                >
                  <option value="Student" style={{ background: '#1E1B4B' }}>Student</option>
                  <option value="Job Seeker" style={{ background: '#1E1B4B' }}>Job Seeker</option>
                  <option value="Working Professional" style={{ background: '#1E1B4B' }}>Working Professional</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Professional Bio</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{formData.bio.length}/500</span>
              </div>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="input-field"
                maxLength={500}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Social Links */}
            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>GitHub URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>

            {/* Form Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setFormData({
                  fullName: user?.name || 'Alex Johnson',
                  username: 'alex_johnson_ai',
                  email: user?.email || 'alex.johnson@skilltrack.ai',
                  phone: '+1 (555) 234-5678',
                  location: 'San Francisco, CA',
                  role: 'Candidate',
                  currentStatus: 'Student',
                  bio: 'Passionate Full-Stack Systems Architect with expertise in React, FastAPI, and AI integration pipelines.',
                  githubUrl: 'https://github.com/alexjohnson',
                  linkedinUrl: 'https://linkedin.com/in/alexjohnson',
                  portfolioUrl: 'https://alexjohnson.dev'
                })}
                className="btn-secondary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
              >
                <FiRefreshCw /> Reset
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiSave /> {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
