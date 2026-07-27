import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiCheckCircle, FiLinkedin, FiExternalLink, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

export const RecruiterVerification = () => {
  const [requests, setRequests] = useState([
    { id: 'req_1', name: 'Sarah Jenkins', company: 'Nexus Tech Global', domain: 'nexustech.global', linkedinUrl: 'https://linkedin.com/in/sarahjenkins-recruiter', date: '2026-07-24' },
    { id: 'req_2', name: 'David Vance', company: 'CloudScale AI', domain: 'cloudscale.ai', linkedinUrl: 'https://linkedin.com/in/davidvance-talent', date: '2026-07-23' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadPendingRecruiters() {
      if (isSupabaseConfigured()) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'recruiter')
            .eq('approval_status', 'pending');
          if (!error && data && data.length > 0) {
            setRequests(data.map(item => ({
              id: item.id,
              name: item.name || 'Recruiter',
              company: item.company || 'Tech Recruiter',
              domain: item.email ? item.email.split('@')[1] : 'company.com',
              linkedinUrl: item.linkedin_url || item.linkedinUrl || 'https://linkedin.com',
              date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : 'Today',
            })));
          }
        } catch (e) {
          console.warn('Failed to load pending recruiters from Supabase:', e);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadPendingRecruiters();
  }, []);

  const handleApprove = async (id, company, name) => {
    try {
      await userService.approveRecruiter(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Recruiter account for ${name} (${company}) approved!`);
    } catch (err) {
      toast.error('Failed to approve recruiter: ' + err.message);
    }
  };

  return (
    <DashboardLayout title="Recruiter Verification Queue">
      <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiShield style={{ color: 'var(--color-primary)' }} /> Pending Recruiter Approvals
          </h3>
          <span style={{ fontSize: '0.8125rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 600 }}>
            {requests.length} Pending
          </span>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner spinner-sm" style={{ margin: '0 auto 0.5rem' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Loading requests from Supabase...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(248, 250, 252, 0.9)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(226, 232, 240, 0.9)', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{r.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                    Company: <strong style={{ color: 'var(--color-text-main)' }}>{r.company}</strong> • Corporate Domain: <code style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>{r.domain}</code>
                  </div>
                  
                  {/* LinkedIn Profile URL Link */}
                  {r.linkedinUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <FiLinkedin style={{ color: '#0077b5' }} />
                      <a
                        href={r.linkedinUrl.startsWith('http') ? r.linkedinUrl : `https://${r.linkedinUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0077b5', textDecoration: 'underline', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        Verify LinkedIn Profile <FiExternalLink style={{ fontSize: '0.75rem' }} />
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleApprove(r.id, r.company, r.name)}
                    className="btn-primary"
                    style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FiCheckCircle /> Approve Recruiter
                  </button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-muted)' }}>
                <FiCheckCircle style={{ fontSize: '2.5rem', color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontWeight: 500 }}>All recruiter verification requests have been processed!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecruiterVerification;
