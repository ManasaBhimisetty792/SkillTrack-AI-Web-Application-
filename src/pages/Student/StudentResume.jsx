import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { resumeService } from '../../services/resumeService';
import { FiFileText, FiUploadCloud, FiBarChart2, FiCheckCircle, FiStar } from 'react-icons/fi';

export const StudentResume = () => {
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await resumeService.getResumes();
      setResumes(data);
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Resume & ATS Optimizer Hub">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Managed Resumes</h2>
          <p style={{ color: 'var(--color-muted)', margin: 0 }}>Review ATS scores, uploaded versions, and keyword optimization reports.</p>
        </div>
        <Link to="/student/resume-upload" className="btn-primary">
          <FiUploadCloud /> Upload New Resume
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {resumes.map((res) => (
          <div key={res.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
            {res.isDefault && (
              <span className="badge-ai" style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.72rem' }}>
                <FiStar /> Primary ATS
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                <FiFileText />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{res.filename}</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Uploaded {res.date} • {res.size}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(248, 250, 252, 0.8)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ATS Compatibility Score</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-success)' }}>{res.score}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${res.score}%`, height: '100%', background: 'var(--color-success)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/student/resume-analysis" className="btn-secondary" style={{ flex: 1, fontSize: '0.8125rem' }}>
                <FiBarChart2 /> View Full Analysis
              </Link>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default StudentResume;
