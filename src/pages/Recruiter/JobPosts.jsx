import React, { useEffect, useState } from 'react';
import {
  FiBriefcase, FiPlus, FiUsers, FiDollarSign, FiMapPin, FiClock, FiCheckCircle, FiX
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';

export const JobPosts = () => {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    job_type: 'Full-Time',
    salary_range: '$130,000 - $170,000',
    ai_score_threshold: 80,
    description: '',
  });

  useEffect(() => {
    recruiterService.getJobs().then((data) => setJobs(data));
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.title) return alert('Please enter job title');

    try {
      const created = await recruiterService.createJob(newJob);
      setJobs((prev) => [created, ...prev]);
      setShowModal(false);
      setNewJob({
        title: '',
        department: 'Engineering',
        location: 'Remote',
        job_type: 'Full-Time',
        salary_range: '$130,000 - $170,000',
        ai_score_threshold: 80,
        description: '',
      });
    } catch (err) {
      alert('Failed to post job: ' + err.message);
    }
  };

  return (
    <DashboardLayout title="Job Postings Management">
      {/* Header Banner & Create Button */}
      <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Active Job Positions ({jobs.length})</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              Manage active listings, track candidate applicants, and configure AI screening thresholds.
            </p>
          </div>

          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiPlus /> Post New Job
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid-responsive grid-col-3" style={{ gap: '1.25rem' }}>
        {jobs.map((j) => (
          <div key={j.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge-glass" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  {j.department}
                </span>
                <span className={`badge-${j.status === 'Active' ? 'success' : 'muted'}`} style={{ fontSize: '0.72rem' }}>
                  {j.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>
                {j.title}
              </h3>

              <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                <div>📍 {j.location} • {j.type}</div>
                <div>💰 {j.salaryRange || j.salary_range}</div>
                <div>⚡ Minimum ATS Score: <strong style={{ color: 'var(--color-primary)' }}>{j.aiScoreThreshold || j.ai_score_threshold}%</strong></div>
              </div>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
                <FiUsers style={{ color: 'var(--color-primary)' }} />
                <span>{j.applicantsCount || 0} Applicants</span>
              </div>

              <button onClick={() => alert(`Viewing applicants for ${j.title}`)} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                View Applicants
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Job Modal */}
      {showModal && (
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
          <form onSubmit={handleCreateJob} className="glass-card" style={{ width: '90%', maxWidth: 580, padding: '1.75rem', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Post New Hiring Position</h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                <FiX />
              </button>
            </div>

            <div className="grid-responsive grid-col-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack React Architect"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Department</label>
                <input
                  type="text"
                  value={newJob.department}
                  onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Location</label>
                <input
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Salary Range</label>
                <input
                  type="text"
                  value={newJob.salary_range}
                  onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>AI Match Threshold (%)</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={newJob.ai_score_threshold}
                  onChange={(e) => setNewJob({ ...newJob, ai_score_threshold: parseInt(e.target.value) || 80 })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary">Publish Job Posting</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JobPosts;
