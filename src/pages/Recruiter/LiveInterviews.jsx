import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiVideo, FiMic, FiCode, FiCheckCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

export const LiveInterviews = () => {
  return (
    <DashboardLayout title="Live Candidate Evaluation Workstation">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
          <FiVideo style={{ fontSize: '3.5rem', color: '#38bdf8', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Live Candidate Video Feed: Alex Johnson</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Full Stack React & Node.js Technical Round • AI Co-Pilot Active</p>
          <span className="badge-ai"><HiSparkles /> AI Speech NLP Transcription Active</span>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Real-time Recruiter Scorecard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Technical Mastery</label>
              <input type="range" min="1" max="100" defaultValue="94" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="form-label">System Architecture Logic</label>
              <input type="range" min="1" max="100" defaultValue="90" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="form-label">Notes & Comments</label>
              <textarea rows={4} placeholder="Add interview feedback..." className="input-glass" />
            </div>
            <button className="btn-primary w-full">Submit Final Candidate Rating</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveInterviews;
