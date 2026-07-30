import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiStar, FiCheckCircle, FiClock,
  FiCalendar, FiDollarSign, FiBriefcase, FiGlobe, FiAward,
  FiChevronRight, FiVideo, FiX, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { FaCrown } from 'react-icons/fa';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import './findRecruiters.css';

export const FindRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('all');
  const [selectedSort, setSelectedSort] = useState('top-rated');
  const [bookingRecruiter, setBookingRecruiter] = useState(null);

  const fetchRecruiters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllRecruiters();
      setRecruiters(data || []);
    } catch (err) {
      console.error('Error loading recruiters:', err);
      setError('Failed to load recruiters from database.');
      toast.error('Could not fetch recruiter profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const filteredRecruiters = recruiters.filter(r => {
    const matchesSearch = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.industry || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech = selectedTech === 'all' || (r.techStack && r.techStack.includes(selectedTech));
    return matchesSearch && matchesTech;
  });

  const handleBookSession = (recruiter) => {
    setBookingRecruiter(recruiter);
  };

  const handleConfirmBooking = () => {
    toast.success(`🎉 Interview request sent to ${bookingRecruiter.name}!`);
    setBookingRecruiter(null);
  };

  return (
    <DashboardLayout title="Find Recruiters for Mock Interviews">
      <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* Banner */}
        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.12) 100%)', border: '1px solid rgba(79,70,229,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge-ai"><HiSparkles /> Recruiter Marketplace</span>
                <span className="badge-glass" style={{ fontSize: '0.72rem' }}>Live Profiles</span>
              </div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '0.2rem 0' }}>Discover & Book Expert Mock Interviews</h2>
              <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>
                Connect 1-on-1 with verified recruiters loaded directly from Supabase recruiter profiles.
              </p>
            </div>
            <button
              onClick={fetchRecruiters}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
            >
              <FiRefreshCw className={loading ? 'spin' : ''} /> Refresh List
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="filter-bar-grid">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="text"
                placeholder="Search by recruiter, company, technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* Tech filter */}
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF' }}
            >
              <option value="all" style={{ background: '#1E1B4B' }}>All Technologies</option>
              <option value="React" style={{ background: '#1E1B4B' }}>React</option>
              <option value="FastAPI" style={{ background: '#1E1B4B' }}>FastAPI</option>
              <option value="TypeScript" style={{ background: '#1E1B4B' }}>TypeScript</option>
              <option value="Python" style={{ background: '#1E1B4B' }}>Python</option>
            </select>

            {/* Sort filter */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF' }}
            >
              <option value="top-rated" style={{ background: '#1E1B4B' }}>⭐ Top Rated</option>
              <option value="most-experienced" style={{ background: '#1E1B4B' }}>💼 Most Experienced</option>
              <option value="lowest-price" style={{ background: '#1E1B4B' }}>💲 Lowest Price</option>
            </select>
          </div>
        </div>

        {/* ── LOADING STATE ── */}
        {loading && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '2.5rem', height: '2.5rem' }} />
            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Loading Recruiter Profiles...</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginTop: '0.3rem' }}>Fetching real-time verified recruiter records from Supabase database.</div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {error && !loading && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
            <FiAlertCircle style={{ fontSize: '2.5rem', color: '#EF4444', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EF4444', margin: '0 0 0.5rem' }}>{error}</h3>
            <button onClick={fetchRecruiters} className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
              Retry Connection
            </button>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && filteredRecruiters.length === 0 && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <FiBriefcase style={{ fontSize: '3rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.4rem' }}>No Recruiters Found</h3>
            <p style={{ fontSize: '0.88rem', margin: 0 }}>Try clearing your search query or adjusting filters.</p>
          </div>
        )}

        {/* ── RECRUITER CARDS GRID ── */}
        {!loading && !error && filteredRecruiters.length > 0 && (
          <div className="recruiter-marketplace-grid">
            {filteredRecruiters.map((r) => (
              <div key={r.id} className="recruiter-card">
                <div>
                  <div className="recruiter-card-header">
                    <div className="recruiter-avatar-box">
                      <img src={r.avatar} alt={r.name} />
                      <img src={r.companyLogo} alt={r.company} className="company-logo-badge" />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{r.name}</h3>
                        {r.isVerified && <FiCheckCircle style={{ color: '#10B981', fontSize: '0.95rem' }} title="Verified Recruiter" />}
                        {r.isPremiumRecruiter && <FaCrown style={{ color: '#FBBF24', fontSize: '1rem' }} title="Premium Partner" />}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.1rem' }}>
                        {r.designation} • {r.company}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                        💼 {r.experience} experience • {r.industry}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Completed Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 0.85rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#FBBF24', fontWeight: 700 }}>
                      <FiStar style={{ fill: '#FBBF24' }} /> {r.rating} ({r.reviewsCount})
                    </div>
                    <div style={{ color: 'var(--color-muted)' }}>
                      🎯 {r.completedInterviews} sessions
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                    {(r.techStack || ['React', 'FastAPI']).map((tech, i) => (
                      <span key={i} className="badge-glass" style={{ fontSize: '0.72rem' }}>{tech}</span>
                    ))}
                  </div>
                </div>

                {/* Bottom Fee & Action */}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Hourly Session Fee</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10B981' }}>${r.hourlyFee} <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 500 }}>/ hr</span></div>
                  </div>

                  <button
                    onClick={() => handleBookSession(r)}
                    className="btn-primary"
                    style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FiVideo /> Book Interview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {bookingRecruiter && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Book Session with {bookingRecruiter.name}</h3>
                <button onClick={() => setBookingRecruiter(null)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Select Interview Type</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFF' }}>
                    {(bookingRecruiter.interviewTypes || ['Technical Deep Dive', 'System Design']).map((t, i) => (
                      <option key={i} value={t} style={{ background: '#1E1B4B' }}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Preferred Date & Time</label>
                  <input type="datetime-local" className="input-field" required />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={handleConfirmBooking} className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                    Confirm Booking (${bookingRecruiter.hourlyFee})
                  </button>
                  <button onClick={() => setBookingRecruiter(null)} className="btn-secondary" style={{ padding: '0.75rem' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default FindRecruiters;
