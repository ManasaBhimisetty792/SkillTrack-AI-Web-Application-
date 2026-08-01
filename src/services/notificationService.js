import { supabase, isSupabaseConfigured } from './supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Fallback mock data (used when Supabase is not configured)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Interview Score Ready',
    message: 'Your recent AI Full Stack React interview drill report is available with a 92% match score.',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    notification_type: 'Reports',
    is_read: false,
    action_url: '/student/reports',
    action_text: 'View Report',
  },
  {
    id: 'notif_2',
    title: 'New Recruiter Profile View',
    message: 'Nexus Tech Global reviewed your ATS Resume Analysis report.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notification_type: 'Interviews',
    is_read: false,
    action_url: '/student/find-recruiters',
    action_text: 'View Recruiter',
  },
  {
    id: 'notif_3',
    title: 'Skill Badge Verified',
    message: 'You unlocked the "FastAPI & Modern Microservices" Advanced Skill Certification.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notification_type: 'Profile',
    is_read: true,
    action_url: null,
    action_text: null,
  },
];

// In-memory store for mock mode (so mutations work in the same session)
let _mockStore = null;

const getMockStore = () => {
  if (!_mockStore) _mockStore = [...MOCK_NOTIFICATIONS];
  return _mockStore;
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification Service
// ─────────────────────────────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Fetch all notifications for the current user, ordered newest first.
   */
  async getNotifications() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return getMockStore();
  },

  /**
   * Mark a single notification as read by ID.
   */
  async markAsRead(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    } else {
      const store = getMockStore();
      const item = store.find((n) => n.id === id);
      if (item) item.is_read = true;
    }
    return true;
  },

  /**
   * Mark ALL notifications as read.
   */
  async markAllAsRead() {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
    } else {
      getMockStore().forEach((n) => { n.is_read = true; });
    }
    return true;
  },

  /**
   * Delete a single notification by ID.
   */
  async deleteNotification(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      _mockStore = getMockStore().filter((n) => n.id !== id);
    }
    return true;
  },

  /**
   * Delete ALL notifications (for the current user session).
   */
  async clearAllNotifications() {
    if (isSupabaseConfigured()) {
      // Only delete this user's notifications — RLS handles the scoping.
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows visible to user via RLS
      if (error) throw error;
    } else {
      _mockStore = [];
    }
    return true;
  },

  /**
   * Create a new notification record in Supabase.
   * Useful for triggering in-app notifications from other services.
   *
   * @param {object} payload - { user_id, title, message, notification_type, action_url, action_text }
   */
  async createNotification(payload) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: payload.user_id,
          title: payload.title,
          message: payload.message,
          notification_type: payload.notification_type || 'system',
          action_url: payload.action_url || null,
          action_text: payload.action_text || null,
          is_read: false,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    // Mock mode: push into the local store
    const newNotif = {
      id: `mock_${Date.now()}`,
      ...payload,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    getMockStore().unshift(newNotif);
    return newNotif;
  },

  /**
   * Get the count of unread notifications.
   */
  async getUnreadCount() {
    if (isSupabaseConfigured()) {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false);
      if (error) throw error;
      return count || 0;
    }
    return getMockStore().filter((n) => !n.is_read).length;
  },
};

export default notificationService;
