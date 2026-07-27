import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiShield, FiUsers, FiCheckCircle, FiCreditCard, FiAlertCircle, FiActivity,
  FiDollarSign, FiTrendingUp, FiServer, FiLock, FiSliders, FiBell, FiPieChart, FiUserCheck, FiFileText
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import StatCard from '../../components/Dashboard/cards/StatCard';
import QuickActionCard from '../../components/Dashboard/cards/QuickActionCard';
import ChartCard from '../../components/Dashboard/cards/ChartCard';
import ActivityCard from '../../components/Dashboard/cards/ActivityCard';
import NotificationCard from '../../components/Dashboard/cards/NotificationCard';
import { useAuth } from '../../hooks/useAuth';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const quickActions = [
    { label: 'Verify Recruiters', icon: <FiCheckCircle />, primary: true, onClick: () => alert('Verify Recruiters action triggered') },
    { label: 'Manage Users', icon: <FiUsers />, primary: true, onClick: () => alert('Manage Users action triggered') },
    { label: 'Platform Analytics', icon: <FiActivity />, primary: false, onClick: () => alert('Platform Analytics action triggered') },
    { label: 'Export Reports', icon: <FiFileText />, primary: false, onClick: () => alert('Export Reports action triggered') },
    { label: 'Announcements', icon: <FiBell />, primary: false, onClick: () => alert('Announcements action triggered') },
  ];

  const systemLogs = [
    {
      title: 'Recruiter Verification Request',
      timestamp: '10m ago',
      description: 'Acme Corp requested enterprise recruiter credential verification.',
      status: 'Pending Review',
      icon: <FiCheckCircle />,
    },
    {
      title: 'Security Scan Completed',
      timestamp: '45m ago',
      description: 'Zero vulnerabilities detected across API endpoints & Supabase Auth.',
      status: 'Passed',
      icon: <FiShield />,
    },
    {
      title: 'Database Backup Completed',
      timestamp: '2h ago',
      description: 'Automated snapshot generated & encrypted in Cloud Vault.',
      status: 'Success',
      icon: <FiServer />,
    },
  ];

  const userDistributionData = [
    { label: 'Students', value: 85 },
    { label: 'Recruiters', value: 10 },
    { label: 'Admins', value: 5 },
  ];

  const rightSidebarContent = (
    <>
      {/* System Health Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiServer style={{ color: 'var(--color-success)' }} /> System Status
          </h4>
          <span className="badge-ai" style={{ fontSize: '0.68rem' }}>Operational</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}>
            <span>API Latency</span>
            <strong style={{ color: 'var(--color-success)' }}>24ms</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}>
            <span>Uptime</span>
            <strong style={{ color: 'var(--color-success)' }}>99.98%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
            <span>Active Connections</span>
            <strong>1,420 Live</strong>
          </div>
        </div>
      </div>

      {/* Admin Alerts */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiBell style={{ color: 'var(--color-primary)' }} /> Governance Alerts
          </h4>
          <span className="badge-glass" style={{ fontSize: '0.7rem' }}>5 Pending</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <NotificationCard
            title="5 Recruiter Verifications Pending"
            message="Review company tax IDs and domain records."
            time="10m ago"
            type="warning"
            unread={true}
          />
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Admin Dashboard" rightSidebar={rightSidebarContent}>
      {/* Executive Welcome Banner */}
      <div
        className="glass-card mb-4"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge-ai"><FiShield /> Platform Security & Governance</span>
              <span className="badge-glass" style={{ fontSize: '0.72rem' }}>Date: {currentDate}</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-text)' }}>
              Platform Executive Console — {user?.name || 'Administrator'}
            </h2>
            <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>
              Overseeing 14,250 students, 620 recruiters, 180 verified companies, and system governance.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Statistics Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.1rem', marginBottom: '1.75rem' }}>
        <StatCard
          title="Total Students"
          value="14,250"
          subtitle="+1,200 this month"
          icon={<FiUsers />}
          trend="+12%"
          trendType="positive"
          iconBg="rgba(79, 70, 229, 0.1)"
          iconColor="var(--color-primary)"
        />
        <StatCard
          title="Total Recruiters"
          value="620"
          subtitle="5 Pending Approvals"
          icon={<FiCheckCircle />}
          trend="98.2% Verified"
          trendType="positive"
          iconBg="rgba(124, 58, 237, 0.1)"
          iconColor="var(--color-secondary)"
        />
        <StatCard
          title="Active Companies"
          value="180 Tech Corps"
          subtitle="Enterprise Partners"
          icon={<FiShield />}
          iconBg="rgba(6, 182, 212, 0.1)"
          iconColor="var(--color-accent)"
        />
        <StatCard
          title="Premium Users"
          value="3,400"
          subtitle="Active Subscriptions"
          icon={<FiCreditCard />}
          trend="+8%"
          trendType="positive"
          iconBg="rgba(34, 197, 94, 0.1)"
          iconColor="var(--color-success)"
        />
        <StatCard
          title="Monthly Revenue"
          value="$48,920 MRR"
          subtitle="Gross Platform Revenue"
          icon={<FiDollarSign />}
          trend="+15.4% YoY"
          trendType="positive"
          iconBg="rgba(245, 158, 11, 0.1)"
          iconColor="#f59e0b"
        />
      </div>

      {/* Quick Actions Bar */}
      <div style={{ marginBottom: '1.75rem' }}>
        <QuickActionCard actions={quickActions} />
      </div>

      {/* Reusable Charts & Platform Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Platform Growth Line Chart */}
        <ChartCard
          title="Platform User Growth & AI Drills"
          subtitle="Monthly active student and recruiter trajectory."
          type="line"
        />

        {/* User Distribution Bar Chart */}
        <ChartCard
          title="User Distribution & Role Mix"
          subtitle="Percentage distribution of active platform accounts."
          type="bar"
          data={userDistributionData}
        />
      </div>

      {/* System Audit & Activity Timeline */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>System Audit & Security Activity</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>Live Logs</span>
        </div>
        <div>
          {systemLogs.map((log, idx) => (
            <ActivityCard key={idx} {...log} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
