import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiCheckCircle, FiVideo, FiFileText, FiCreditCard,
  FiUser, FiZap, FiTrash2, FiSearch, FiCheck, FiMail,
  FiLoader, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { FaCrown } from 'react-icons/fa';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';
import recruiterService from '../../services/recruiterService';
import './studentNotifications.css';


export const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications from Supabase via notificationService
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Could not load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter by tab and search
  const filteredNotifications = notifications.filter(n => {
    const matchesTab =
      activeTab === 'All' ? true :
      activeTab === 'Unread' ? (n.is_read === false || n.unread === true) :
      (n.notification_type === activeTab || n.category === activeTab);

    const title = n.title || '';
    const message = n.message || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true, unread: false } : n)
      );
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, unread: false })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      toast.success('Cleared all notifications');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const unreadCount = notifications.filter(n => n.is_read === false || n.unread === true).length;

  // Map notification_type / category to an icon
  const getCategoryIcon = (n) => {
    const type = n.notification_type || n.category || '';
    switch (type) {
      case 'Interviews':
      case 'interview_scheduled':
      case 'interview_accepted':
      case 'interview_completed':
      case 'interview_cancelled':
        return <FiVideo style={{ color: 'var(--color-primary)' }} />;
      case 'Reports':
      case 'resume_uploaded':
      case 'resume_updated':
        return <FiFileText style={{ color: '#10B981' }} />;
      case 'Payments':
      case 'payment_success':
        return <FaCrown style={{ color: '#FBBF24' }} />;
      case 'Profile':
      case 'profile_updated':
        return <FiUser style={{ color: '#818CF8' }} />;
      case 'registration':
      case 'login':
        return <FiMail style={{ color: 'var(--color-secondary)' }} />;
      case 'admin_approval':
      case 'admin_announcement':
        return <FiZap style={{ color: '#F59E0B' }} />;
      default:
        return <FiBell style={{ color: 'var(--color-secondary)' }} />;
    }
  };

  // Format timestamp
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const handleRescheduleResponse = async (item, accepted) => {
    try {
      const requestId = item.metadata?.requestId || item.entity_id;
      const recruiterUserId = item.sender_id;
      await recruiterService.respondToReschedule(requestId, accepted, recruiterUserId, 'Candidate');
      if (accepted) {
        toast.success('🎉 Reschedule accepted! The recruiter has been notified.');
      } else {
        toast.error('Reschedule declined.');
      }
      handleMarkAsRead(item.id);
    } catch (err) {
      console.error('Failed to respond to reschedule:', err);
      toast.error('Action failed.');
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
            <button
              onClick={fetchNotifications}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh
            </button>
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiCheck /> Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444' }}
            >
              <FiTrash2 /> Clear All
            </button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search */}
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Tabs */}
          <div className="notification-tabs-bar">
            {['All', 'Unread', 'Interviews', 'Reports', 'Payments', 'Profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`notification-tab-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
                {tab === 'Unread' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: '0.3rem',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    borderRadius: '9999px',
                    padding: '0 0.4rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    lineHeight: 1.6
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <FiLoader className="spin-animation" style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>Loading notifications...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
            <FiAlertCircle style={{ fontSize: '2.5rem', color: '#EF4444', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#EF4444', margin: '0 0 0.5rem' }}>{error}</h3>
            <button onClick={fetchNotifications} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredNotifications.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                <FiBell size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>No notifications found</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>You're all caught up! Check back later for interview updates.</div>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUnread = item.is_read === false || item.unread === true;
                const isReschedule = item.notification_type === 'RESCHEDULE_REQUEST';

                return (
                  <div key={item.id} className={`notification-item-card ${isUnread ? 'unread' : ''}`}>
                    <div style={{ fontSize: '1.4rem', padding: '0.4rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                      {getCategoryIcon(item)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.title}</span>
                          {isUnread && <span className="notification-unread-dot" title="Unread Notification" />}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                          {formatTime(item.created_at) || item.timestamp || item.time}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                        {item.message}
                      </p>

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {isReschedule ? (
                          <>
                            <button
                              onClick={() => handleRescheduleResponse(item, true)}
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                            >
                              Accept Reschedule
                            </button>
                            <button
                              onClick={() => handleRescheduleResponse(item, false)}
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', color: '#EF4444' }}
                            >
                              Decline Reschedule
                            </button>
                          </>
                        ) : (
                          item.action_url && item.action_text && (
                            <a
                              href={item.action_url || item.actionUrl}
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', textDecoration: 'none' }}
                            >
                              {item.action_text || item.actionText}
                            </a>
                          )
                        )}

                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(item.id)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.85rem', marginLeft: 'auto' }}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentNotifications;
