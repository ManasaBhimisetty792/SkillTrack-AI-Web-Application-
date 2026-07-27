import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { recruiterService } from '../../services/recruiterService';
import { FiPlus, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const JobPosts = () => {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [salaryRange, setSalaryRange] = useState('$150,000 - $180,000');

  useEffect(() => {
    async function load() {
      const data = await recruiterService.getJobs();
      setJobs(data);
    }
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const newJob = await recruiterService.createJob({ title, salaryRange });
    setJobs([newJob, ...jobs]);
    setShowModal(false);
    setTitle('');
    toast.success('New job listing created with automated AI ATS screening rubric!');
  };

  return (
    <DashboardLayout title="Active Job Listings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Open Positions</h2>
          <p style={{ color: 'var(--color-muted)', margin: 0 }}>Configure ATS score cutoffs & automated screening rubrics.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus /> Post New Job Opening
        </button>
      </div>

      {showModal && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--color-primary)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Create Job Posting</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job Title (e.g. Lead Full Stack React Engineer)" className="input-glass" required />
            <input type="text" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="Salary Range" className="input-glass" required />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary">Publish Job Posting</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {jobs.map((j) => (
          <div key={j.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="badge-ai">{j.status}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Posted {j.postedDate}</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>{j.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
              {j.location} • <strong style={{ color: 'var(--color-text)' }}>{j.salaryRange}</strong>
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: 'var(--radius-md)' }}>
              <span>Applicants: <strong>{j.applicantsCount}</strong></span>
              <span>Min ATS Cutoff: <strong style={{ color: 'var(--color-primary)' }}>{j.aiScoreThreshold}%</strong></span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default JobPosts;
