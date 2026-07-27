import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUser, FiFileText, FiUploadCloud, FiBarChart2, FiVideo,
  FiAward, FiSettings, FiBell, FiCreditCard, FiBriefcase, FiUsers,
  FiCalendar, FiShield, FiCheckCircle, FiLogOut, FiX, FiMenu, FiChevronRight, FiPieChart, FiDollarSign, FiSliders, FiLayers
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

export const STUDENT_NAV = [
  { label: 'Dashboard', path: '/student/dashboard', icon: <FiGrid />, isFunctional: true },
  { label: 'Profile', path: '/student/profile', icon: <FiUser />, isFunctional: false },
  { label: 'Resume', path: '/student/resume', icon: <FiFileText />, isFunctional: false },
  { label: 'Mock Interviews', path: '/student/mock-interviews', icon: <FiVideo />, isFunctional: false },
  { label: 'Career Insights', path: '/student/recommendations', icon: <HiSparkles />, isFunctional: false },
  { label: 'Notifications', path: '/student/notifications', icon: <FiBell />, isFunctional: false },
  { label: 'Settings', path: '/student/settings', icon: <FiSettings />, isFunctional: false },
];

export const RECRUITER_NAV = [
  { label: 'Dashboard', path: '/recruiter/dashboard', icon: <FiGrid />, isFunctional: true },
  { label: 'Company Profile', path: '/recruiter/company', icon: <FiBriefcase />, isFunctional: false },
  { label: 'Job Posts', path: '/recruiter/jobs', icon: <FiFileText />, isFunctional: false },
  { label: 'Candidates', path: '/recruiter/candidates', icon: <FiUsers />, isFunctional: false },
  { label: 'Interviews', path: '/recruiter/interviews', icon: <FiCalendar />, isFunctional: false },
  { label: 'Analytics', path: '/recruiter/analytics', icon: <FiBarChart2 />, isFunctional: false },
  { label: 'Reports', path: '/recruiter/screening', icon: <FiPieChart />, isFunctional: false },
  { label: 'Notifications', path: '/recruiter/billing', icon: <FiBell />, isFunctional: false },
  { label: 'Settings', path: '/recruiter/settings', icon: <FiSettings />, isFunctional: false },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <FiShield />, isFunctional: true },
  { label: 'Users', path: '/admin/users', icon: <FiUsers />, isFunctional: false },
  { label: 'Recruiters', path: '/admin/recruiter-verification', icon: <FiCheckCircle />, isFunctional: false },
  { label: 'Students', path: '/admin/student-verification', icon: <FiUser />, isFunctional: false },
  { label: 'Subscriptions', path: '/admin/subscriptions', icon: <FiCreditCard />, isFunctional: false },
  { label: 'Payments', path: '/admin/audit-logs', icon: <FiDollarSign />, isFunctional: false },
  { label: 'Reports', path: '/admin/audit-logs', icon: <FiFileText />, isFunctional: false },
  { label: 'System Settings', path: '/admin/settings', icon: <FiSliders />, isFunctional: false },
  { label: 'Notifications', path: '/admin/audit-logs', icon: <FiBell />, isFunctional: false },
];

export const Sidebar = ({ sidebarOpen, setSidebarOpen, mobileOpen, setMobileOpen }) => {
  const { role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = role === 'recruiter' ? RECRUITER_NAV : role === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  const getRoleBadge = () => {
    if (role === 'recruiter') return { text: 'RECRUITER PORTAL', color: 'badge-glass' };
    if (role === 'admin') return { text: 'PLATFORM ADMIN', color: 'badge-ai' };
    return { text: 'STUDENT PORTAL', color: 'badge-glass' };
  };

  const badgeInfo = getRoleBadge();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`dashboard-sidebar glass-panel ${sidebarOpen ? 'open' : 'collapsed'} ${mobileOpen ? 'mobile-show' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="navbar-brand sidebar-brand" aria-label="SkillTrack AI Home">
            <div className="brand-icon-wrapper" aria-hidden="true">
              <HiSparkles className="brand-sparkle" />
            </div>
            {sidebarOpen && <span className="brand-text">SkillTrack <span className="brand-accent">AI</span></span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle-btn desktop-only"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="sidebar-toggle-btn mobile-only"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <div className="sidebar-role-indicator">
          <span className={badgeInfo.color}>
            {sidebarOpen ? badgeInfo.text : role[0].toUpperCase()}
          </span>
        </div>

        <nav className="sidebar-menu" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                title={item.label}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
                {isActive && sidebarOpen && <FiChevronRight className="sidebar-arrow" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-item logout-item" title="Logout">
            <FiLogOut className="sidebar-icon" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
