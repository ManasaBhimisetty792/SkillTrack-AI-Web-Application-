import React, { useEffect, useState } from 'react';
import {
  FiUsers, FiSearch, FiCheck, FiX, FiEye, FiBriefcase, FiMapPin, FiStar, FiFilter
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';

export const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    recruiterService.getCandidates().then((data) => setCandidates(data));
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const matchesTab =
      tab === 'All' ? true : tab === 'Suitable' ? c.fit === 'Suitable' : c.fit === 'Maybe';
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleAction = (id, action) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, fit: action === 'accept' ? 'Suitable' : 'Rejected' } : c))
    );
  };

  return (
    <DashboardLayout title="Candidates Management">
      {/* Search & Filter Header */}
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Suitable', 'Maybe'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: tab === t ? '1px solid #1abc9c' : '1px solid #e2e8f0',
                  background: tab === t ? '#1abc9c' : '#fff',
                  color: tab === t ? '#fff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: 280 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search candidate or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Candidate Talent Pool ({filteredCandidates.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCandidates.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #eef1f5',
                flexWrap: 'wrap',
              }}
            >
              <img
                src={c.img}
                alt={c.name}
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
              />

              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{c.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{c.role}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', gap: '1rem' }}>
                  <span><FiBriefcase style={{ marginRight: 4 }} />{c.exp}</span>
                  <span><FiMapPin style={{ marginRight: 4 }} />{c.loc}</span>
                </div>
              </div>

              <div style={{ minWidth: 110 }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ATS Match Score</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c.ats >= 85 ? '#149174' : '#d97706' }}>
                  {c.ats}%
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: c.fit === 'Suitable' ? '#e6f9f4' : '#fef3e0',
                    color: c.fit === 'Suitable' ? '#149174' : '#b8860b',
                    fontWeight: 600,
                  }}
                >
                  {c.fit}
                </span>
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Key Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {c.skills?.map((s) => (
                    <span key={s} className="badge-glass" style={{ fontSize: '0.72rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedCandidate(c)}
                  className="btn btn-outline"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FiEye /> Resume
                </button>
                <button
                  onClick={() => handleAction(c.id, 'accept')}
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FiCheck /> Accept
                </button>
                <button
                  onClick={() => handleAction(c.id, 'reject')}
                  className="btn btn-outline"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fecaca', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FiX /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Resume Preview Modal */}
      {selectedCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 21, 51, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 999,
          }}
        >
          <div className="glass-card" style={{ width: '90%', maxWidth: 540, padding: '1.75rem', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Candidate Profile Detail</h3>
              <button onClick={() => setSelectedCandidate(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                <FiX />
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <img src={selectedCandidate.img} alt="" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 0.5rem' }} />
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{selectedCandidate.name}</h4>
              <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.85rem' }}>{selectedCandidate.role} • {selectedCandidate.exp}</p>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div><strong>Location:</strong> {selectedCandidate.loc}</div>
              <div style={{ marginTop: '0.4rem' }}><strong>ATS Match:</strong> {selectedCandidate.ats}% ({selectedCandidate.fit})</div>
              <div style={{ marginTop: '0.4rem' }}><strong>Skills:</strong> {selectedCandidate.skills.join(', ')}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setSelectedCandidate(null)} className="btn btn-outline">Close</button>
              <button onClick={() => { alert(`Accepted ${selectedCandidate.name}`); setSelectedCandidate(null); }} className="btn btn-primary">Schedule Interview</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Candidates;
