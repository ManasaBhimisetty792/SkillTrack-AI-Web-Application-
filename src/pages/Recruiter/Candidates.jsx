import React, { useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiUsers, FiSearch, FiCheckCircle, FiStar, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const candidates = [
    { id: '1', name: 'Alex Johnson', role: 'Full Stack React & FastAPI', score: 96, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', skills: ['React 19', 'FastAPI', 'Supabase', 'TypeScript'], status: 'Screened & Recommended' },
    { id: '2', name: 'Elena Rostova', role: 'Senior Cloud Engineer', score: 92, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', skills: ['Node.js', 'Docker', 'PostgreSQL', 'GraphQL'], status: 'Shortlisted' },
    { id: '3', name: 'Marcus Chen', role: 'AI Infrastructure Architect', score: 89, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', skills: ['Python', 'PyTorch', 'FastAPI', 'Kubernetes'], status: 'Under Review' },
  ];

  const handleInvite = (name) => {
    toast.success(`Video interview invitation link dispatched to: ${name}`);
  };

  return (
    <DashboardLayout title="Candidate Search & Talent Pool">
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="topbar-search" style={{ width: '100%' }}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate name, skill keyword (e.g. React 19, FastAPI), or minimum ATS score..."
            className="input-glass search-input"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {candidates.map((c) => (
          <div key={c.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <img src={c.avatar} alt={c.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{c.name}</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{c.role}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(79, 70, 229, 0.06)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Match Score</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)' }}>{c.score}%</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
              {c.skills.map((s) => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
            </div>

            <button onClick={() => handleInvite(c.name)} className="btn-primary w-full" style={{ fontSize: '0.875rem' }}>
              <FiVideo /> Schedule Technical Video Round
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Candidates;
