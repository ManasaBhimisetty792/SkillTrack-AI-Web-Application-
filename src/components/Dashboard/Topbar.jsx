import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMenu, FiUser, FiLogOut, FiShield, FiBriefcase, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from './cards/Breadcrumb';
import ThemeToggle from '../common/ThemeToggle';

export const Topbar = ({ title, onMenuToggle }) => {
  const { user, role, logout, switchRole } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-topbar glass-panel">
      <div className="topbar-left">
        <button
          onClick={onMenuToggle}
          className="topbar-mobile-menu-btn"
          aria-label="Toggle Navigation Menu"
        >
          <FiMenu />
        </button>
        <div>
          <Breadcrumb />
          <h1 className="topbar-page-title">{title}</h1>
        </div>
      </div>

      <div className="topbar-search">
        <FiSearch className="search-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search resumes, candidates, drills..."
          className="input-glass search-input"
          aria-label="Global search input"
        />
      </div>

      <div className="topbar-actions">
        {/* Role Switcher Demo Control */}
        <div className="demo-role-switcher">
          <select
            value={role}
            onChange={(e) => {
              const targetRole = e.target.value;
              switchRole(targetRole);
              navigate(`/${targetRole}/dashboard`);
            }}
            className="input-glass role-select-sm"
            aria-label="Switch active demo role"
          >
            <option value="student">Student Portal</option>
            <option value="recruiter">Recruiter Portal</option>
            <option value="admin">Admin Portal</option>
          </select>
        </div>

        {/* Notifications Icon */}
        <Link
          to={`/${role}/notifications`}
          className="icon-btn-glass"
          aria-label="View notifications"
          title="Notifications"
        >
          <FiBell />
          <span className="notification-dot" />
        </Link>

        {/* Dark Mode Toggle */}
        <ThemeToggle size="small" />

        {/* Profile Dropdown Container */}
        <div className="profile-dropdown-container" style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="topbar-user-btn"
            aria-expanded={profileDropdownOpen}
            aria-label="User Profile Menu"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'User'}
              className="avatar-img"
            />
            <div className="user-details-sm">
              <span className="user-name-sm">{user?.name || 'Alex Johnson'}</span>
              <span className="user-role-sm">{role?.toUpperCase()}</span>
            </div>
            <FiChevronDown style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }} />
          </button>

          {profileDropdownOpen && (
            <div className="profile-dropdown-menu glass-card">
              <div className="dropdown-header">
                <p className="dropdown-user-name">{user?.name || 'Alex Johnson'}</p>
                <p className="dropdown-user-email">{user?.email || 'alex@skilltrack.ai'}</p>
                <span className="badge-glass" style={{ fontSize: '0.68rem', marginTop: '0.25rem', display: 'inline-block' }}>
                  {role?.toUpperCase()}
                </span>
              </div>
              <div className="dropdown-divider" />
              <Link
                to={`/${role}/profile`}
                onClick={() => setProfileDropdownOpen(false)}
                className="dropdown-item"
              >
                <FiUser /> Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="dropdown-item dropdown-logout"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
