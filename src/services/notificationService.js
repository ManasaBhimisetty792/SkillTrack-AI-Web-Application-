import { supabase, isSupabaseConfigured } from './supabaseClient';

export const notificationService = {
  async getNotifications() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (data && data.length) return data;
    }
    return [
      {
        id: 'notif_1',
        title: 'Interview Score Ready',
        message: 'Your recent AI Full Stack React interview drill report is available with a 92% match score.',
        time: '10 minutes ago',
        type: 'success',
        read: false,
      },
      {
        id: 'notif_2',
        title: 'New Recruiter Profile View',
        message: 'Nexus Tech Global reviewed your ATS Resume Analysis report.',
        time: '2 hours ago',
        type: 'info',
        read: false,
      },
      {
        id: 'notif_3',
        title: 'Skill Badge Verified',
        message: 'You unlocked the "FastAPI & Modern Microservices" Advanced Skill Certification.',
        time: '1 day ago',
        type: 'badge',
        read: true,
      },
    ];
  },

  async markAsRead(id) {
    if (isSupabaseConfigured()) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
    return true;
  },
};

export default notificationService;
