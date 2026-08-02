import React, { useEffect, useState } from 'react';
import {
  FiUser,
  FiBriefcase,
  FiSave,
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiShield,
  FiAward,
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';
import { supabase } from '../../services/supabaseClient';

export const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    designation: '',
    avatar_url: '',
    company_name: '',
    company_logo: '',
    company_website: '',
    industry: '',
    company_size: '',
    location: '',
    experience_years: 0,
    specialization: '',
    bio: '',
    verification_status: 'Verified',
    tax_id: '',
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await recruiterService.getProfile();
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          designation: data.designation || '',
          avatar_url: data.avatar_url || '',
          company_name: data.company_name || '',
          company_logo: data.company_logo || '',
          company_website: data.company_website || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          location: data.location || '',
          experience_years: Number(data.experience_years || 0),
          specialization: data.specialization || '',
          bio: data.bio || '',
          verification_status: data.verification_status || 'Verified',
          tax_id: data.tax_id || '',
        });
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load recruiter profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.company_name.trim()) errs.company_name = 'Company name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience_years' ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Please upload a JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image must be smaller than 5 MB.');
      e.target.value = '';
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const user = authData?.user;
      if (!user) {
        showToast('error', 'Please login again.');
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData?.publicUrl || '';

      if (!avatarUrl) {
        throw new Error('Could not generate public URL for uploaded image.');
      }

      const updatedProfile = {
        ...formData,
        avatar_url: avatarUrl,
      };

      setFormData(updatedProfile);

      console.log('Uploaded avatar URL:', avatarUrl);

      await recruiterService.updateProfile(updatedProfile);

      showToast('success', 'Profile photo uploaded and saved.');
      await loadProfile();
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to upload profile image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('error', 'Please correct validation errors before saving.');
      return;
    }

    setSaving(true);
    try {
      await recruiterService.updateProfile(formData);
      showToast('success', 'Profile updated successfully.');
      await loadProfile();
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Recruiter Profile">
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            background: toast.type === 'success' ? '#149174' : '#ef4444',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {toast.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          {toast.message}
        </div>
      )}

      <div className="glass-card mb-4" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={formData.avatar_url || 'https://i.pravatar.cc/120?img=68'}
              alt={formData.full_name || 'Recruiter'}
              onError={(e) => {
                e.currentTarget.src = 'https://i.pravatar.cc/120?img=68';
              }}
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--color-primary)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: '50%',
                padding: '5px',
                cursor: 'pointer',
                display: 'flex',
              }}
              title="Change Photo"
              onClick={() => document.getElementById('avatarUpload').click()}
            >
              <FiCamera size={14} />
            </div>

            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                {formData.full_name || 'John Doe'}
              </h2>
              <span className="badge-glass" style={{ color: 'var(--color-success)', background: '#e6f9f4' }}>
                <FiCheckCircle style={{ marginRight: 4 }} />
                {formData.verification_status}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              {formData.designation} at <strong style={{ color: 'var(--color-text)' }}>{formData.company_name}</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-muted)', flexWrap: 'wrap' }}>
              <span>📍 {formData.location || 'Unknown location'}</span>
              <span>💼 {formData.experience_years} Years Experience</span>
              <span>📧 {formData.email}</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiSave />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
        {[
          { key: 'personal', label: 'Personal Details', icon: FiUser },
          { key: 'company', label: 'Company Details', icon: FiBriefcase },
          { key: 'professional', label: 'Professional Details', icon: FiAward },
          { key: 'verification', label: 'Verification & Tax', icon: FiShield },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              <Icon /> {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="glass-card" style={{ padding: '1.75rem' }}>
        {activeTab === 'personal' && (
          <div className="grid-responsive grid-col-2" style={{ gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: errors.full_name ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
              />
              {errors.full_name && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.full_name}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: errors.email ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
              />
              {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.email}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: errors.phone ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
              />
              {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.phone}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Current Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="grid-responsive grid-col-2" style={{ gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: errors.company_name ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
              />
              {errors.company_name && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.company_name}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Company Website</label>
              <input
                type="url"
                name="company_website"
                value={formData.company_website}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Industry Domain</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Company Size</label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="1-10 Employees">1-10 Employees</option>
                <option value="11-50 Employees">11-50 Employees</option>
                <option value="50-200 Employees">50-200 Employees</option>
                <option value="250-500 Employees">250-500 Employees</option>
                <option value="500+ Employees">500+ Employees</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Headquarters / Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'professional' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-responsive grid-col-2" style={{ gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Years of Experience</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Hiring Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Recruiter Bio & Overview</label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="grid-responsive grid-col-2" style={{ gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Verification Badge Status</label>
              <input
                type="text"
                disabled
                value={formData.verification_status}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 700, color: '#149174' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Corporate Tax ID / Registration</label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={loadProfile} className="btn btn-outline">
            Reset Changes
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiSave /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CompanyProfile;