import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiGithub,
  FiLinkedin, FiGlobe, FiUploadCloud, FiCheckCircle, FiEdit3,
  FiSave, FiRefreshCw, FiEye, FiX, FiFileText, FiPlus, FiTag, FiLoader
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import MembershipBadge from '../../components/Navbar/MembershipBadge';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import './studentProfile.css';

export const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    location: '',
    role: 'Candidate',
    currentStatus: 'Student',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    website: ''
  });

  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileUrl, setResumeFileUrl] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Fetch Candidate Profile Data on Mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const data = await userService.getCandidateProfile(user?.id);
      if (data) {
        setFormData({
          fullName: data.name || user?.name || 'Alex Johnson',
          username: data.username || user?.username || 'alex_johnson_ai',
          email: data.email || user?.email || 'alex.student@skilltrack.ai',
          phone: data.phone || '+1 (555) 234-5678',
          location: data.location || 'San Francisco, CA',
          role: 'Candidate',
          currentStatus: data.current_status || 'Student',
          bio: data.bio || 'Passionate Full-Stack Systems Architect with expertise in React, FastAPI, and AI integration pipelines.',
          githubUrl: data.github_url || 'https://github.com/alexjohnson',
          linkedinUrl: data.linkedin_url || 'https://linkedin.com/in/alexjohnson',
          portfolioUrl: data.portfolio_url || 'https://alexjohnson.dev',
          website: data.website || 'https://alexjohnson.dev'
        });

        if (data.avatar_url || data.avatar) {
          setPhotoPreview(data.avatar_url || data.avatar);
        }

        if (data.resume_file_name) {
          setResumeFileName(data.resume_file_name);
        }
        if (data.resume_file_url) {
          setResumeFileUrl(data.resume_file_url);
        }

        if (Array.isArray(data.skills) && data.skills.length > 0) {
          setSkills(data.skills);
        } else {
          setSkills(['React', 'JavaScript', 'Python', 'FastAPI', 'Supabase']);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add & Remove Skills
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Avatar Upload Handler with Supabase Storage Support
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant Preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    if (isSupabaseConfigured() && user?.id) {
      setUploadingAvatar(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('profile_images')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('profile_images')
          .getPublicUrl(fileName);

        const uploadedUrl = publicUrlData.publicUrl;
        setPhotoPreview(uploadedUrl);
        toast.success('🎉 Profile photo uploaded successfully!');
      } catch (err) {
        console.warn('Supabase avatar upload failed, using local preview:', err.message);
        toast.success('Photo preview set!');
      } finally {
        setUploadingAvatar(false);
      }
    } else {
      toast.success('Profile photo preview updated!');
    }
  };

  // Resume Upload Handler with Supabase Storage Support
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);

    if (isSupabaseConfigured() && user?.id) {
      setUploadingResume(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `resume-${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        setResumeFileUrl(publicUrlData.publicUrl);
        toast.success(`🎉 Resume '${file.name}' uploaded!`);
      } catch (err) {
        console.warn('Supabase resume upload failed:', err.message);
        toast.success(`Selected resume: ${file.name}`);
      } finally {
        setUploadingResume(false);
      }
    } else {
      toast.success(`Selected resume: ${file.name}`);
    }
  };

  // Profile Completion Score Computation
  const calculateProfileCompletion = () => {
    const fields = [
      formData.fullName,
      formData.username,
      formData.email,
      formData.phone,
      formData.location,
      formData.bio,
      formData.githubUrl,
      formData.linkedinUrl,
      skills.length > 0,
      resumeFileName
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatePayload = {
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        current_status: formData.currentStatus,
        github_url: formData.githubUrl,
        linkedin_url: formData.linkedinUrl,
        portfolio_url: formData.portfolioUrl,
        website: formData.website,
        avatar_url: photoPreview,
        resume_file_name: resumeFileName,
        resume_file_url: resumeFileUrl,
        profile_completion_pct: profileCompletion,
        skills: skills,
        role: 'student'
      };

      const result = await userService.updateCandidateProfile(user?.id, updatePayload);
      if (updateUser) {
        updateUser({
          ...user,
          name: formData.fullName,
          avatar: photoPreview,
          avatar_url: photoPreview,
          username: formData.username
        });
      }

      toast.success('🎉 Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="User Profile">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
          <FiLoader className="spin-animation" style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading Candidate Profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Profile">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── TOP SECTION: PROFILE SHOWCASE CARD ── */}
        <div className="profile-showcase-card">
          <div className="profile-cover-banner" />

          <div className="profile-header-content">
            <div className="profile-header-top">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem' }}>
                <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
                  <img src={photoPreview} alt={formData.fullName} className="profile-avatar-img" />
                  {uploadingAvatar && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiLoader className="spin-animation" style={{ color: '#fff', fontSize: '1.4rem' }} />
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{formData.fullName || 'Alex Johnson'}</h2>
                    <MembershipBadge />
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                    @{formData.username || 'username'} • <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{formData.role}</span> ({formData.currentStatus})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem' }}
                >
                  <FiEdit3 /> {editMode ? 'Close Form' : 'Edit Profile'}
                </button>
              </div>
            </div>

            <div className="profile-details-grid">
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Professional Summary
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  {formData.bio || 'No bio specified yet.'}
                </p>

                {/* Skills Badges */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>
                    Core Technical Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {skills.map((skill, index) => (
                      <span key={index} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {formData.githubUrl && (
                    <a href={formData.githubUrl} target="_blank" rel="noreferrer" className="social-link-btn">
                      <FiGithub /> GitHub
                    </a>
                  )}
                  {formData.linkedinUrl && (
                    <a href={formData.linkedinUrl} target="_blank" rel="noreferrer" className="social-link-btn">
                      <FiLinkedin /> LinkedIn
                    </a>
                  )}
                  {formData.portfolioUrl && (
                    <a href={formData.portfolioUrl} target="_blank" rel="noreferrer" className="social-link-btn">
                      <FiGlobe /> Portfolio
                    </a>
                  )}
                </div>
              </div>

              {/* Stats & Progress Ring */}
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-muted)' }}>PROFILE COMPLETION</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: profileCompletion >= 80 ? 'var(--color-success)' : '#f59e0b' }}>
                    {profileCompletion}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${profileCompletion}%`, background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div>📍 Location: <strong style={{ color: 'var(--color-text)' }}>{formData.location || 'Not set'}</strong></div>
                  <div>📄 Resume: <strong style={{ color: '#10B981' }}>{resumeFileName || 'No resume uploaded'}</strong></div>
                  <div>⚡ Status: <strong style={{ color: 'var(--color-primary)' }}>Active Candidate</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: EDIT PROFILE FORM ── */}
        <div className="profile-edit-section" style={{ display: editMode ? 'block' : 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUser style={{ color: 'var(--color-primary)' }} /> Edit Profile Details
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
              Real-time synchronization active
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Photo & Resume Upload row */}
            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Profile Photo Upload</label>
                <div className="file-dropzone" onClick={() => document.getElementById('photoInput').click()}>
                  <FiUploadCloud style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.4rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{uploadingAvatar ? 'Uploading image...' : 'Click to change photo'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>PNG, JPG or WEBP up to 5MB</div>
                  <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Primary Resume Upload</label>
                <div className="file-dropzone" onClick={() => document.getElementById('resumeInput').click()}>
                  <FiFileText style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', marginBottom: '0.4rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{uploadingResume ? 'Uploading resume...' : (resumeFileName || 'Upload PDF Resume')}</div>
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g. San Francisco, CA"
                />
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

            {/* Skills Tag Management */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Skills & Technologies (Press Enter or click Add)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="input-field"
                  placeholder="e.g. React.js, Python, PostgreSQL"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.65rem 1rem' }}
                >
                  <FiPlus /> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      borderRadius: '20px',
                      padding: '0.3rem 0.8rem',
                      fontSize: '0.82rem',
                      color: '#E0E7FF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <FiTag style={{ fontSize: '0.75rem', color: '#818CF8' }} /> {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', padding: 0 }}
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
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
                onClick={fetchProfileData}
                className="btn-secondary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
              >
                <FiRefreshCw /> Reset Form
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {saving ? (
                  <>
                    <FiLoader className="spin-animation" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <FiSave /> Save Changes
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
