import { supabase, isSupabaseConfigured } from './supabaseClient';
import { tokenStorage } from './api';

export const userService = {
  async getProfile(userId) {
    if (isSupabaseConfigured() && userId) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) return data;
    }
    const localUser = tokenStorage.user || {};
    return {
      id: userId || localUser.id || 'usr_101',
      name: localUser.name || 'Alex Johnson',
      email: localUser.email || 'alex.student@skilltrack.ai',
      role: localUser.role || 'student',
      title: localUser.title || 'Full Stack Engineer & AI Specialist',
      bio: 'Passionate about building scalable AI web applications, NLP models, and microservices.',
      skills: ['React.js', 'Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'TailwindCSS', 'TypeScript'],
      university: 'Stanford University',
      graduationYear: '2025',
      gpa: '3.92 / 4.0',
      location: 'San Francisco, CA',
      githubUrl: 'https://github.com/alexjohnson',
      linkedinUrl: 'https://linkedin.com/in/alexjohnson',
      websiteUrl: 'https://alexjohnson.dev',
      completedInterviews: 14,
      avgAtsScore: 92,
      rankPercentile: 'Top 5%',
    };
  },

  async updateProfile(profileData) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').upsert(profileData).select().single();
      if (error) throw error;
      return data;
    }
    const current = tokenStorage.user || {};
    const updated = { ...current, ...profileData };
    tokenStorage.set({ user: updated, access: tokenStorage.access });
    return updated;
  },

  async updateLinkedInUrl(userId, linkedinUrl) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          linkedin_url: linkedinUrl,
          approval_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const current = tokenStorage.user || {};
    const updated = { ...current, linkedinUrl, linkedin_url: linkedinUrl, approval_status: 'pending' };
    tokenStorage.set({ user: updated, access: tokenStorage.access });
    return updated;
  },

  async approveRecruiter(recruiterId) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'approved',
          is_approved: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recruiterId)
        .select();
      if (error) throw error;
      return data;
    }
    return { id: recruiterId, approval_status: 'approved', is_approved: true };
  },
};

export default userService;
