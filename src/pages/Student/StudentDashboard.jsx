import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiFileText, FiVideo, FiAward, FiTrendingUp, FiArrowRight,
  FiCheckCircle, FiUpload, FiUserCheck, FiPieChart, FiCalendar, FiClock, FiBell, FiZap
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import StatCard from '../../components/Dashboard/cards/StatCard';
import QuickActionCard from '../../components/Dashboard/cards/QuickActionCard';
import ActivityCard from '../../components/Dashboard/cards/ActivityCard';
import NotificationCard from '../../components/Dashboard/cards/NotificationCard';
import ProfileCard from '../../components/Dashboard/cards/ProfileCard';
import MembershipCard from '../../components/Dashboard/cards/MembershipCard';
import { useAuth } from '../../hooks/useAuth';
import '/src/components/Dashboard/dashboard.css';


export const StudentDashboard = () => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const quickActions = [
    { label: 'Upload Resume', icon: <FiUpload />, primary: true, onClick: () => alert('Upload Resume action triggered') },
    { label: 'Start Interview', icon: <FiVideo />, primary: true, onClick: () => alert('Start Interview action triggered') },
    { label: 'Update Profile', icon: <FiUserCheck />, primary: false, onClick: () => alert('Update Profile action triggered') },
    { label: 'View Reports', icon: <FiPieChart />, primary: false, onClick: () => alert('View Reports action triggered') },
  ];

  const recentActivities = [
    {
      title: 'Completed Full Stack System Design Drill',
      timestamp: '2 hours ago',
      description: 'Scored 92% in Load Balancing & Caching architecture.',
      status: '92% Score',
      icon: <FiVideo />,
    },
    {
      title: 'ATS Resume Rescan',
      timestamp: 'Yesterday',
      description: 'Match score improved from 88% to 94% after adding metrics.',
      status: '94% Match',
      icon: <FiFileText />,
    },
    {
      title: 'Earned Badge: React Specialist',
      timestamp: '3 days ago',
      description: 'Verified candidate badge issued for technical proficiency.',
      status: 'Verified',
      icon: <FiAward />,
    },
  ];

  const rightSidebarContent = (
    <>
      {/* User Profile Card */}
      <ProfileCard user={user} completion={85} />

      {/* Dynamic Membership Status Card */}
      <MembershipCard user={user} />

      {/* Notifications Preview */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiBell style={{ color: 'var(--color-primary)' }} /> Notifications Preview
          </h4>
          <span className="badge-glass" style={{ fontSize: '0.7rem' }}>2 Unread</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <NotificationCard
            title="Recruiter Viewed Profile"
            message="Nexus Tech Talent Acquisition team reviewed your ATS report."
            time="10m ago"
            type="info"
            unread={true}
          />
          <NotificationCard
            title="Mock Drill Feedback Ready"
            message="AI Coach added 3 actionable suggestions to your drill recording."
            time="1h ago"
            type="success"
            unread={true}
          />
        </div>
      </div>

      {/* Career Suggestions */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <HiSparkles style={{ color: 'var(--color-secondary)' }} /> Career Suggestions
        </h4>
        <div style={{ padding: '0.85rem', background: 'rgba(79, 70, 229, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79, 70, 229, 0.12)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            Target Role: Senior Frontend Architect
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
            Practice Web Vitals performance optimization drills to reach top 1% candidate percentile.
          </p>
        </div>
      </div>

      {/* Platform Announcements */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.65rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiZap style={{ color: 'var(--color-accent)' }} /> Platform Announcements
        </h4>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>
          🎉 SkillTrack AI v2.4 introduces real-time voice emotion analytics during AI mock drills!
        </p>
      </div>

      {/* Upcoming Activity */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiCalendar style={{ color: 'var(--color-primary)' }} /> Upcoming Activity
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: 'rgba(241, 245, 249, 0.8)', borderRadius: 'var(--radius-md)' }}>
          <FiClock style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }} />
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>FastAPI System Design Drill</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Tomorrow at 3:00 PM EST</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Student Dashboard" rightSidebar={rightSidebarContent}>
      {/* Welcome Banner */}
      <div
        className="glass-card mb-4"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
          border: '1px solid rgba(79, 70, 229, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge-ai"><HiSparkles /> Candidate Portal</span>
              <span className="badge-glass" style={{ fontSize: '0.72rem' }}>Date: {currentDate}</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-text)' }}>
              Welcome back, {user?.name || 'Alex Johnson'}!
            </h2>
            <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>
              Email: <strong style={{ color: 'var(--color-primary)' }}>{user?.email || 'alex@skilltrack.ai'}</strong> • Profile Completion: <strong style={{ color: 'var(--color-success)' }}>85%</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <StatCard
          title="Resume Score"
          value="94 / 100"
          subtitle="ATS Verified Compatible"
          icon={<FiFileText />}
          trend="+6% increase"
          trendType="positive"
          iconBg="rgba(79, 70, 229, 0.1)"
          iconColor="var(--color-primary)"
        />
        <StatCard
          title="Applications"
          value="12"
          subtitle="4 Interviews Scheduled"
          icon={<FiTrendingUp />}
          trend="+2 this week"
          trendType="positive"
          iconBg="rgba(34, 197, 94, 0.1)"
          iconColor="var(--color-success)"
        />
        <StatCard
          title="Mock Interviews"
          value="24"
          subtitle="Completed AI Drills"
          icon={<FiVideo />}
          trend="Avg Score 91%"
          trendType="positive"
          iconBg="rgba(124, 58, 237, 0.1)"
          iconColor="var(--color-secondary)"
        />
        <StatCard
          title="Skills Improved"
          value="8 Skills"
          subtitle="Verified by AI Assessment"
          icon={<FiAward />}
          badge="Top 5% Percentile"
          iconBg="rgba(6, 182, 212, 0.1)"
          iconColor="var(--color-accent)"
        />
      </div>

      {/* Quick Actions Bar */}
      <div style={{ marginBottom: '1.75rem' }}>
        <QuickActionCard actions={quickActions} />
      </div>

      {/* Recent Activity Timeline & Career Tips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Activity Timeline */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Activity Timeline</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>Last 7 Days</span>
          </div>
          <div>
            {recentActivities.map((act, idx) => (
              <ActivityCard key={idx} {...act} />
            ))}
          </div>
        </div>

        {/* Career Tips Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HiSparkles style={{ color: 'var(--color-secondary)' }} /> AI Career Tips & Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                Quantify Project Accomplishments
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
                Resumes with metrics (e.g., "Reduced latency by 40%") receive 3.5x higher ATS scoring.
              </p>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(124, 58, 237, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                STAR Method Verification
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
                Structure behavioral interview answers using Situation, Task, Action, and Result for maximum AI evaluation score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
