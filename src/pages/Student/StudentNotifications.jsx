import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiCheckCircle, FiVideo, FiFileText, FiCreditCard,
  FiUser, FiZap, FiTrash2, FiSearch, FiCheck, FiMail
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { FaCrown } from 'react-icons/fa';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import './studentNotifications.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    category: 'Interviews',
    title: 'Interview Accepted 🎉',
    message: 'Sarah Jenkins accepted your mock interview request for Senior React Engineer role.',
    timestamp: '10 mins ago',
    unread: true,
    type: 'success',
    actionUrl: '/student/live-interview',
    actionText: 'View Room'
  },
  {
    id: 'notif-2',
    category: 'Reports',
    title: 'AI Resume ATS Score Updated',
    message: 'Your ATS compatibility score improved from 88% to 94% following key verb updates.',
    timestamp: '1 hour ago',
    unread: true,
    type: 'info',
    actionUrl: '/student/resume',
    actionText: 'View Score'
  },
  {
    id: 'notif-3',
    category: 'Payments',
    title: 'Membership Upgraded to Premium ⭐',
    message: 'Your Razorpay transaction succeeded. You now have unlimited AI mock drills and recruiter bookings!',
    timestamp: '2 hours ago',
    unread: false,
    type: 'warning',
    actionUrl: '/student/profile',
    actionText: 'Membership'
  },
  {
    id: 'notif-4',
    category: 'Profile',
    title: 'Profile Completion 88%',
    message: 'Add your portfolio website link to reach 100% profile completion.',
    timestamp: 'Yesterday',
    unread: false,
    type: 'info',
    actionUrl: '/student/profile',
    actionText: 'Update Profile'
  },
  {
    id: 'notif-5',
    category: 'Interviews',
    title: 'Reminder: Interview in 10 minutes',
    message: 'Your LiveKit session with Marcus Vance starts at 3:00 PM EST.',
    timestamp: 'Yesterday',
    unread: false,
    type: 'danger',
    actionUrl: '/student/live-interview',
    actionText: 'Join Room'
  }
];

export const StudentNotifications = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'All' ? true :
                       activeTab === 'Unread' ? n.unread :
                       n.category === activeTab;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    toast.success('Marked as read');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('Cleared all notifications');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Interviews': return <FiVideo style={{ color: 'var(--color-primary)' }} />;
      case 'Reports': return <FiFileText style={{ color: '#10B981' }} />;
      case 'Payments': return <HiCrown style={{ color: '#FBBF24' }} />;
      case 'Profile': return <FiUser style={{ color: '#818CF8' }} />;
      default: return <FiBell style={{ color: 'var(--color-secondary)' }} />;
    }
  };

  return (
    <DashboardLayout title="Notification Center">
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header Summary & Bulk Actions */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Notification Center</h2>
              {unreadCount > 0 && <span className="badge-ai">{unreadCount} New</span>}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.2rem 0 0' }}>
              System alerts, interview updates, recruiter responses, and subscription updates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleMarkAllRead} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiCheck /> Mark All Read
            </button>
            <button onClick={handleClearAll} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444' }}>
              <FiTrash2 /> Clear All
            </button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div className="notification-tabs-bar">
            {['All', 'Unread', 'Interviews', 'Reports', 'Payments', 'Profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`notification-tab-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredNotifications.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiBell size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>No notifications found</div>
              <div style={{ fontSize: '0.85rem' }}>You're all caught up! Check back later for interview updates.</div>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div key={item.id} className={`notification-item-card ${item.unread ? 'unread' : ''}`}>
                <div style={{ fontSize: '1.4rem', padding: '0.4rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                  {getCategoryIcon(item.category)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.title}</span>
                      {item.unread && <span className="notification-unread-dot" title="Unread Notification" />}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{item.timestamp}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                    {item.message}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {item.actionText && (
                      <a href={item.actionUrl} className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', textDecoration: 'none' }}>
                        {item.actionText}
                      </a>
                    )}
                    {item.unread && (
                      <button onClick={() => handleMarkAsRead(item.id)} className="btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
                        Mark as read
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.85rem', marginLeft: 'auto' }} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentNotifications;
