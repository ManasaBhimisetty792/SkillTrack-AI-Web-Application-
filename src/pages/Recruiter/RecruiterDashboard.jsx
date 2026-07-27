import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiUsers, FiCalendar, FiBarChart2, FiCheckCircle,
  FiPlus, FiArrowRight, FiPieChart, FiBell, FiClock, FiFileText, FiSearch
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import StatCard from '../../components/Dashboard/cards/StatCard';
import QuickActionCard from '../../components/Dashboard/cards/QuickActionCard';
import ChartCard from '../../components/Dashboard/cards/ChartCard';
import ActivityCard from '../../components/Dashboard/cards/ActivityCard';
import NotificationCard from '../../components/Dashboard/cards/NotificationCard';
import { useAuth } from '../../hooks/useAuth';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const quickActions = [
    { label: 'Post New Job', icon: <FiPlus />, primary: true, onClick: () => alert('Post New Job action triggered') },
    { label: 'View Candidates', icon: <FiUsers />, primary: true, onClick: () => alert('View Candidates action triggered') },
    { label: 'Schedule Interview', icon: <FiCalendar />, primary: false, onClick: () => alert('Schedule Interview action triggered') },
    { label: 'View Analytics', icon: <FiBarChart2 />, primary: false, onClick: () => alert('View Analytics action triggered') },
  ];

  const recentApplications = [
    {
      title: 'Sarah Jenkins',
      timestamp: '15m ago',
      description: 'Applied for Senior React Developer • ATS Score: 96%',
      status: 'Top Candidate',
      icon: <FiUsers />,
    },
    {
      title: 'Michael Chen',
      timestamp: '1h ago',
      description: 'Applied for Backend FastAPI Engineer • ATS Score: 92%',
      status: 'Shortlisted',
      icon: <FiUsers />,
    },
    {
      title: 'David Miller',
      timestamp: '3h ago',
      description: 'Applied for Full Stack Architect • ATS Score: 89%',
      status: 'Under Review',
      icon: <FiUsers />,
    },
  ];

  const upcomingInterviews = [
    { candidate: 'Sarah Jenkins', role: 'Senior React Developer', time: 'Today at 2:00 PM', type: 'AI Live Drill' },
    { candidate: 'Michael Chen', role: 'FastAPI Engineer', time: 'Tomorrow at 11:00 AM', type: 'Technical Screening' },
  ];

  const pipelineData = [
    { stage: 'Total Applicants', count: 240, pct: 100, color: 'var(--color-primary)' },
    { stage: 'ATS Shortlisted', count: 64, pct: 26, color: 'var(--color-accent)' },
    { stage: 'AI Interview Passed', count: 28, pct: 11, color: 'var(--color-secondary)' },
    { stage: 'Final Offers Made', count: 8, pct: 3, color: 'var(--color-success)' },
  ];

  const rightSidebarContent = (
    <>
      {/* Company Overview Widget */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            <FiBriefcase />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Nexus Tech Global</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Enterprise Employer</span>
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div>📍 Head Office: San Francisco, CA</div>
          <div>👥 Tech Talent Pool: 64 Qualified</div>
          <div>⚡ Active Hiring Surge: 8 Roles</div>
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiBell style={{ color: 'var(--color-primary)' }} /> Recruiter Alerts
          </h4>
          <span className="badge-glass" style={{ fontSize: '0.7rem' }}>3 New</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <NotificationCard
            title="High Match Candidate"
            message="Sarah Jenkins scored 96% match for Senior React Developer."
            time="15m ago"
            type="success"
            unread={true}
          />
          <NotificationCard
            title="Interview Confirmation"
            message="Michael Chen accepted tomorrow's Technical Screening invite."
            time="2h ago"
            type="info"
            unread={true}
          />
        </div>
      </div>

      {/* Upcoming Interviews Widget */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiCalendar style={{ color: 'var(--color-secondary)' }} /> Scheduled Interviews
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {upcomingInterviews.map((item, idx) => (
            <div key={idx} style={{ padding: '0.75rem', background: 'rgba(241, 245, 249, 0.8)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-text)' }}>{item.candidate}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{item.role}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                <span><FiClock /> {item.time}</span>
                <span className="badge-glass" style={{ fontSize: '0.65rem' }}>{item.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Recruiter Dashboard" rightSidebar={rightSidebarContent}>
      {/* Welcome Banner */}
      <div
        className="glass-card mb-4"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(79, 70, 229, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge-glass"><FiBriefcase /> Recruiter Talent Hub</span>
              <span className="badge-glass" style={{ fontSize: '0.72rem' }}>Date: {currentDate}</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-text)' }}>
              Welcome back, {user?.name || 'Talent Acquisition Team'}!
            </h2>
            <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>
              You have <strong style={{ color: 'var(--color-primary)' }}>64 shortlisted candidates</strong> matching your open engineering positions.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <StatCard
          title="Total Jobs"
          value="12 Positions"
          subtitle="4 Draft Positions"
          icon={<FiBriefcase />}
          iconBg="rgba(79, 70, 229, 0.1)"
          iconColor="var(--color-primary)"
        />
        <StatCard
          title="Active Jobs"
          value="8 Openings"
          subtitle="Actively Recruiting"
          icon={<FiCheckCircle />}
          trend="8 Live Listings"
          trendType="positive"
          iconBg="rgba(34, 197, 94, 0.1)"
          iconColor="var(--color-success)"
        />
        <StatCard
          title="Candidate Pool"
          value="64 Applicants"
          subtitle="Top Match Score > 90%"
          icon={<FiUsers />}
          trend="+14 today"
          trendType="positive"
          iconBg="rgba(124, 58, 237, 0.1)"
          iconColor="var(--color-secondary)"
        />
        <StatCard
          title="Interviews Scheduled"
          value="5 Today"
          subtitle="AI & Live Round"
          icon={<FiCalendar />}
          badge="Active"
          iconBg="rgba(6, 182, 212, 0.1)"
          iconColor="var(--color-accent)"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '1.75rem' }}>
        <QuickActionCard actions={quickActions} />
      </div>

      {/* Reusable Charts & Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Hiring Trend Line Chart */}
        <ChartCard
          title="Hiring Trend & Candidate Volume"
          subtitle="Weekly candidate applications and screening throughput."
          type="line"
        />

        {/* Candidate Pipeline Chart */}
        <ChartCard
          title="Candidate Recruitment Pipeline"
          subtitle="Conversion rates across recruitment funnel stages."
          type="pipeline"
          data={pipelineData}
        />
      </div>

      {/* Recent Applications Timeline */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Applications</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>Live Feed</span>
        </div>
        <div>
          {recentApplications.map((app, idx) => (
            <ActivityCard key={idx} {...app} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
