import React, { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiStar,
  FiCheckCircle,
  FiCalendar,
  FiBriefcase,
  FiGlobe,
  FiLinkedin,
  FiVideo,
  FiAlertCircle,
  FiRefreshCw,
  FiMapPin,
  FiLoader,
  FiX,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { FaCrown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { tokenStorage } from '../../services/api';
import './findRecruiters.css';

const BookingModal = ({ recruiter, onClose, onConfirm, submitting }) => {
  const [interviewType, setInterviewType] = useState(
    recruiter?.interviewTypes?.[0] || 'Technical Deep Dive'
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [messageText, setMessageText] = useState('');

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 1);
  const minDateStr = minDate.toISOString().slice(0, 16);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!preferredDate) {
      toast.error('Please select a preferred date & time.');
      return;
    }
    onConfirm({ interviewType, preferredDate, message: messageText });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '1rem',
      }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src={recruiter.avatar}
              alt={recruiter.name}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  recruiter.name || 'Recruiter'
                )}&background=4f46e5&color=fff&size=128`;
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--color-primary)',
              }}
            />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Book Interview with {recruiter.name}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.15rem' }}>
                {recruiter.designation} • {recruiter.company}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-muted)',
              fontSize: '1.3rem',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Interview Type *
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
              required
            >
              {(recruiter.interviewTypes || ['Technical Deep Dive', 'System Design', 'Behavioral']).map((t, i) => (
                <option key={i} value={t} style={{ background: '#1E1B4B' }}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Preferred Date & Time *
            </label>
            <input
              type="datetime-local"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={minDateStr}
              className="input-field"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Message to Recruiter (optional)
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="E.g., I'm preparing for a React senior role. Looking forward to a deep technical session."
              rows={3}
              className="input-field"
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {recruiter.hourlyFee > 0 && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                fontSize: '0.82rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--color-muted)' }}>Session Fee (1 hr)</span>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#10B981' }}>
                ${recruiter.hourlyFee}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '0.8rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              {submitting ? <FiLoader className="spin-animation" /> : <FiCalendar />}
              {submitting ? 'Sending Request...' : 'Send Interview Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
              style={{ padding: '0.8rem 1.25rem', fontSize: '0.9rem' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="recruiter-card" style={{ gap: '1rem' }}>
    {[80, 60, 100, 50, 70].map((w, i) => (
      <div
        key={i}
        style={{
          height: i === 0 ? 64 : 14,
          width: i === 0 ? 64 : `${w}%`,
          borderRadius: i === 0 ? '50%' : 8,
          background: 'rgba(255,255,255,0.07)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    ))}
  </div>
);

export const FindRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('all');
  const [selectedSort, setSelectedSort] = useState('top-rated');
  const [bookingRecruiter, setBookingRecruiter] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const allTechTags = [...new Set(recruiters.flatMap((r) => r.techStack || []))].slice(0, 10);

  const fetchRecruiters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured() || !supabase) {
        setRecruiters([]);
        return;
      }

      const rows = await recruiterService.getAllRecruiterProfiles();

      const mapped = (rows || []).map((r) => {
        const techStack = [
          ...(r.specialization ? [r.specialization] : []),
          ...(r.industry ? [r.industry] : []),
        ];

        return recruiterService.mapRecruiterRow
          ? recruiterService.mapRecruiterRow(r)
          : {
              id: r.user_id,
              user_id: r.user_id,
              name: r.full_name || 'Recruiter',
              email: r.email || '',
              company: r.company_name || '',
              designation: r.designation || 'Recruiter',
              avatar:
                r.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(r.full_name || 'Recruiter')}&background=4f46e5&color=fff&size=128`,
              companyLogo:
                r.company_logo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(r.company_name || 'Co')}&background=1abc9c&color=fff&size=64`,
              location: r.location || 'Remote',
              bio: r.bio || '',
              techStack,
              rating: 4.8,
              reviewsCount: 0,
              experience: `${r.experience_years || 0} Years`,
              completedInterviews: 0,
              isVerified: r.verification_status === 'Verified',
              isPremiumRecruiter: Number(r.experience_years || 0) >= 8,
              hourlyFee: 0,
              linkedin: '',
              website: r.company_website || '',
              company_size: r.company_size || '',
              verification_status: r.verification_status || 'Pending',
              created_at: r.created_at,
              verified_at: r.verified_at,
              registration_doc_url: r.registration_doc_url,
            };
      });

      setRecruiters(mapped);
    } catch (err) {
      console.error('Error loading recruiters:', err);
      setError('Failed to load recruiter profiles.');
      toast.error('Could not fetch recruiter profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const filteredRecruiters = recruiters
    .filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (r.name || '').toLowerCase().includes(q) ||
        (r.company || '').toLowerCase().includes(q) ||
        (r.designation || '').toLowerCase().includes(q) ||
        (r.location || '').toLowerCase().includes(q) ||
        (r.techStack || []).some((t) => t.toLowerCase().includes(q)) ||
        (r.email || '').toLowerCase().includes(q);

      const matchesTech = selectedTech === 'all' || (r.techStack || []).includes(selectedTech);
      return matchesSearch && matchesTech;
    })
    .sort((a, b) => {
      if (selectedSort === 'top-rated') return (b.rating || 0) - (a.rating || 0);
      if (selectedSort === 'most-experienced') {
        const expA = parseInt(a.experience) || 0;
        const expB = parseInt(b.experience) || 0;
        return expB - expA;
      }
      if (selectedSort === 'lowest-price') return (a.hourlyFee || 0) - (b.hourlyFee || 0);
      if (selectedSort === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      return 0;
    });

  const handleConfirmBooking = async ({ interviewType, preferredDate, message }) => {
    setSubmitting(true);
    try {
      let studentId = null;
      if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        studentId = user?.id;
      }
      if (!studentId) {
        studentId = tokenStorage.user?.id || 'anonymous';
      }

      await recruiterService.bookInterview({
        recruiter_id: bookingRecruiter.id,
        recruiter_user_id: bookingRecruiter.user_id,
        student_id: studentId,
        interview_type: interviewType,
        preferred_datetime: preferredDate,
        message,
      });

      toast.success(`🎉 Request sent to ${bookingRecruiter.name}! They will respond shortly.`);
      setBookingRecruiter(null);
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error('Failed to send interview request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Find Recruiters for Mock Interviews">
      <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div
          className="glass-card"
          style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.12) 100%)',
            border: '1px solid rgba(79,70,229,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge-ai">
                  <HiSparkles /> Recruiter Marketplace
                </span>
                <span className="badge-glass" style={{ fontSize: '0.72rem' }}>
                  {loading ? '...' : `${recruiters.length} Live Profiles`}
                </span>
              </div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '0.2rem 0' }}>
                Discover & Book Expert Mock Interviews
              </h2>
              <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>
                Connect 1-on-1 with verified recruiters. All data is fetched live from Supabase.
              </p>
            </div>
            <button
              onClick={fetchRecruiters}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
            >
              <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh List
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="filter-bar-grid">
            <div style={{ position: 'relative' }}>
              <FiSearch
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search by name, company, skill, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="input-field"
            >
              <option value="all" style={{ background: '#1E1B4B' }}>
                All Technologies
              </option>
              {allTechTags.map((tag) => (
                <option key={tag} value={tag} style={{ background: '#1E1B4B' }}>
                  {tag}
                </option>
              ))}
            </select>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="input-field"
            >
              <option value="top-rated" style={{ background: '#1E1B4B' }}>
                ⭐ Top Rated
              </option>
              <option value="most-experienced" style={{ background: '#1E1B4B' }}>
                💼 Most Experienced
              </option>
              <option value="lowest-price" style={{ background: '#1E1B4B' }}>
                💲 Lowest Price
              </option>
              <option value="newest" style={{ background: '#1E1B4B' }}>
                🆕 Newest
              </option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="recruiter-marketplace-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              borderColor: 'rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.05)',
            }}
          >
            <FiAlertCircle style={{ fontSize: '2.5rem', color: '#EF4444', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EF4444', margin: '0 0 0.5rem' }}>
              {error}
            </h3>
            <button onClick={fetchRecruiters} className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && filteredRecruiters.length === 0 && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <FiBriefcase style={{ fontSize: '3rem', marginBottom: '0.75rem', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.4rem' }}>
              {recruiters.length === 0 ? 'No Approved Recruiters Yet' : 'No Recruiters Found'}
            </h3>
            <p style={{ fontSize: '0.88rem', margin: 0 }}>
              {recruiters.length === 0
                ? 'Recruiters will appear here once approved by the admin.'
                : 'Try clearing your search query or adjusting filters.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredRecruiters.length > 0 && (
          <div className="recruiter-marketplace-grid">
            {filteredRecruiters.map((r) => (
              <div key={r.id} className="recruiter-card">
                <div>
                  <div className="recruiter-card-header">
                    <div className="recruiter-avatar-box">
                      <img
                        src={r.avatar || r.avatar_url}
                        alt={r.name}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            r.name || 'Recruiter'
                          )}&background=4f46e5&color=fff&size=128`;
                        }}
                      />
                      <img
                        src={
                          r.companyLogo ||
                          r.company_logo ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            r.company || 'Co'
                          )}&background=1abc9c&color=fff&size=32`
                        }
                        alt={r.company || 'Company'}
                        className="company-logo-badge"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            r.company || 'Co'
                          )}&background=1abc9c&color=fff&size=32`;
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{r.name}</h3>
                        {r.isVerified && (
                          <FiCheckCircle style={{ color: '#10B981', fontSize: '0.9rem', flexShrink: 0 }} title="Verified Recruiter" />
                        )}
                        {r.isPremiumRecruiter && (
                          <FaCrown style={{ color: '#FBBF24', fontSize: '0.9rem', flexShrink: 0 }} title="Premium Recruiter" />
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                        {r.designation} {r.company && `• ${r.company}`}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-muted)',
                          marginTop: '0.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <FiMapPin size={11} /> {r.location || 'Remote'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                        📧 {r.email}
                      </div>
                    </div>
                  </div>

                  {r.bio && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-muted)',
                        margin: '0.75rem 0 0',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {r.bio}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      margin: '0.85rem 0',
                      fontSize: '0.8rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#FBBF24', fontWeight: 700 }}>
                      <FiStar style={{ fill: '#FBBF24' }} />
                      {Number(r.rating || 4.8).toFixed(1)}
                      <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>
                        ({r.reviewsCount || 0})
                      </span>
                    </div>
                    <div style={{ color: 'var(--color-muted)' }}>
                      💼 {r.experience || `${r.experience_years || 0} Years`}
                    </div>
                    <div style={{ color: 'var(--color-muted)' }}>
                      🏢 {r.company_size || 'Not specified'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    {(r.techStack || []).slice(0, 5).map((tech, i) => (
                      <span key={i} className="badge-glass" style={{ fontSize: '0.7rem' }}>
                        {tech}
                      </span>
                    ))}
                    {r.techStack?.length > 5 && (
                      <span className="badge-glass" style={{ fontSize: '0.7rem' }}>
                        +{r.techStack.length - 5}
                      </span>
                    )}
                  </div>

                  {(r.linkedin || r.website) && (
                    <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      {r.linkedin && (
                        <a
                          href={r.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textDecoration: 'none',
                          }}
                        >
                          <FiLinkedin size={12} /> LinkedIn
                        </a>
                      )}
                      {r.website && (
                        <a
                          href={r.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textDecoration: 'none',
                          }}
                        >
                          <FiGlobe size={12} /> Website
                        </a>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                    {r.industry && (
                      <span className="badge-glass" style={{ fontSize: '0.7rem' }}>
                        {r.industry}
                      </span>
                    )}
                    {r.verification_status && (
                      <span className="badge-glass" style={{ fontSize: '0.7rem' }}>
                        {r.verification_status}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>Session Fee</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10B981' }}>
                      {r.hourlyFee > 0 ? `$${r.hourlyFee}` : 'Free'}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 400 }}>
                        {' '}
                        / hr
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingRecruiter(r)}
                    className="btn-primary"
                    style={{
                      padding: '0.55rem 1.1rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <FiVideo /> Book Interview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {bookingRecruiter && (
        <BookingModal
          recruiter={bookingRecruiter}
          onClose={() => !submitting && setBookingRecruiter(null)}
          onConfirm={handleConfirmBooking}
          submitting={submitting}
        />
      )}
    </DashboardLayout>
  );
};

export default FindRecruiters;