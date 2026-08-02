import { supabase, isSupabaseConfigured } from './supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Fallback Mock Notifications
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
    receiver_role: 'student',
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
    receiver_role: 'student',
  },
];

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
   * Fetch all notifications for the current user session (filtered by recipient).
   */
  async getNotifications() {
    if (isSupabaseConfigured()) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (userId) {
          query = query.or(`user_id.eq.${userId},receiver_id.eq.${userId}`);
        }

        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getNotifications error:', err.message);
      }
    }
    return getMockStore();
  },

  /**
   * Fetch system-wide notifications for the Admin Portal.
   */
  async getAdminNotifications() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAdminNotifications error:', err.message);
      }
    }
    return getMockStore();
  },

  /**
   * Create a new notification row in Supabase and notify recipient.
   */
  async createNotification({
    user_id,
    receiver_id,
    sender_id,
    sender_role = 'system',
    receiver_role = 'student',
    title,
    message,
    notification_type = 'system',
    action_url = null,
    action_text = null,
    metadata = null,
    is_admin_viewable = true
  }) {
    const targetUserId = receiver_id || user_id;

    const payload = {
      user_id: targetUserId,
      receiver_id: targetUserId,
      sender_id: sender_id || null,
      sender_role,
      receiver_role,
      title,
      message,
      notification_type,
      action_url,
      action_text,
      metadata,
      is_admin_viewable,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Failed to insert notification into Supabase:', err.message);
      }
    }

    const mockItem = { id: `notif_${Date.now()}`, ...payload };
    getMockStore().unshift(mockItem);
    return mockItem;
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) console.warn('markAsRead error:', error.message);
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
      if (error) console.warn('markAllAsRead error:', error.message);
    } else {
      getMockStore().forEach((n) => { n.is_read = true; });
    }
    return true;
  },

  /**
   * Delete a single notification.
   */
  async deleteNotification(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) console.warn('deleteNotification error:', error.message);
    } else {
      _mockStore = getMockStore().filter((n) => n.id !== id);
    }
    return true;
  },

  /**
   * Clear all notifications.
   */
  async clearAllNotifications() {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.warn('clearAllNotifications error:', error.message);
    } else {
      _mockStore = [];
    }
    return true;
  },

  /**
   * Get unread count for current user.
   */
  async getUnreadCount() {
    if (isSupabaseConfigured()) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        let query = supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false);

        if (userId) {
          query = query.or(`user_id.eq.${userId},receiver_id.eq.${userId}`);
        }

        const { count, error } = await query;
        if (!error) return count || 0;
      } catch (err) {}
    }
    return getMockStore().filter((n) => !n.is_read).length;
  },
};

export default notificationService;
