import { supabase, isSupabaseConfigured } from './supabaseClient';
import { tokenStorage } from './api';

const MOCK_USERS = {
  student: {
    id: 'usr_student_101',
    email: 'alex.student@skilltrack.ai',
    name: 'Alex Johnson',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Computer Science Major',
    university: 'Stanford University',
    created_at: new Date().toISOString(),
  },
  recruiter: {
    id: 'usr_recruiter_202',
    email: 'sarah.recruiter@techcorp.com',
    name: 'Sarah Jenkins',
    role: 'recruiter',
    company: 'Nexus Tech Global',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    title: 'Senior Talent Acquisition Lead',
    created_at: new Date().toISOString(),
  },
  admin: {
    id: 'usr_admin_303',
    email: 'admin@skilltrack.ai',
    name: 'David Vance',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Head of Operations & Security',
    created_at: new Date().toISOString(),
  },
};

export const authService = {
  /**
   * Get active session
   */
  async getSession() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    }
    const user = tokenStorage.user;
    return user ? { user, access_token: 'mock_session_token' } : null;
  },

  /**
   * Refresh session
   */
  async refreshSession() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data.session;
    }
    return this.getSession();
  },

  /**
   * Sync user profile into Supabase public 'profiles' database table
   */
  async syncUserProfile(user) {
    if (!isSupabaseConfigured() || !user?.id) return null;
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        name: user.name || user.email?.split('@')[0],
        role: user.role || 'student',
        company: user.company || null,
        linkedin_url: user.linkedin_url || user.linkedinUrl || null,
        approval_status: user.role === 'recruiter' ? (user.approval_status || 'pending') : 'approved',
        is_approved: user.role === 'recruiter' ? (user.is_approved ?? false) : true,
        avatar_url: user.avatar || user.avatar_url,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('profiles').upsert(profileData).select().single();
      if (error) {
        console.warn('Profile sync notice:', error.message);
        if (error.code === '42703' || error.message.includes('column')) {
          console.error('SUPABASE MIGRATION REQUIRED: Columns (linkedin_url, company, approval_status, is_approved) are missing in public.profiles table. Run the SQL script provided.');
        } else if (error.code === '42501' || error.message.includes('policy') || error.message.includes('row-level security')) {
          console.error('SUPABASE RLS POLICY REQUIRED: RLS on public.profiles blocked insert. Run the RLS policy / Database Trigger SQL script.');
        }
      }
      return data;
    } catch (e) {
      console.warn('Unable to sync profile to Supabase:', e.message);
      return null;
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (isSupabaseConfigured()) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return null;
      if (user) {
        let dbProfile = null;
        try {
          const { data: profData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (profData) dbProfile = profData;
        } catch (_) {}

        const formattedUser = {
          id: user.id,
          email: user.email,
          name: dbProfile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          role: dbProfile?.role || user.user_metadata?.role || 'student',
          company: dbProfile?.company || user.user_metadata?.company || '',
          linkedinUrl: dbProfile?.linkedin_url || user.user_metadata?.linkedin_url || '',
          linkedin_url: dbProfile?.linkedin_url || user.user_metadata?.linkedin_url || '',
          approval_status: dbProfile?.approval_status || (user.user_metadata?.role === 'recruiter' ? 'pending' : 'approved'),
          is_approved: dbProfile?.is_approved ?? (user.user_metadata?.role !== 'recruiter'),
          avatar: dbProfile?.avatar_url || user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          created_at: user.created_at || new Date().toISOString(),
        };
        await this.syncUserProfile(formattedUser);
        return formattedUser;
      }
    }
    return tokenStorage.user || null;
  },

  /**
   * Sign Up with Email & Password
   */
  async signUp({ name, email, password, role = 'student', company = '', linkedinUrl = '' }) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role,
            company,
            linkedin_url: linkedinUrl,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`,
          },
        },
      });
      if (error) throw error;

      const user = {
        id: data.user?.id || 'usr_' + Date.now(),
        email,
        name,
        role,
        company,
        linkedinUrl,
        linkedin_url: linkedinUrl,
        approval_status: role === 'recruiter' ? 'pending' : 'approved',
        is_approved: role !== 'recruiter',
        avatar: data.user?.user_metadata?.avatar_url,
        created_at: new Date().toISOString(),
      };
      tokenStorage.set({ user, access: data.session?.access_token || 'mock_token' });
      await this.syncUserProfile(user);
      return user;
    }

    // Fallback demo signup
    const newUser = {
      id: 'usr_' + Date.now(),
      email,
      name,
      role,
      company,
      linkedinUrl,
      linkedin_url: linkedinUrl,
      approval_status: role === 'recruiter' ? 'pending' : 'approved',
      is_approved: role !== 'recruiter',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`,
      created_at: new Date().toISOString(),
    };
    tokenStorage.set({ user: newUser, access: 'mock_token_' + Date.now() });
    return newUser;
  },

  /**
   * Alias for signUp
   */
  async signup(data) {
    return this.signUp(data);
  },

  /**
   * Sign In / Login with Email & Password
   */
  async signIn({ email, password, role = 'student' }) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || email.split('@')[0],
        role: data.user.user_metadata?.role || role,
        avatar: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        created_at: data.user.created_at,
      };
      tokenStorage.set({ user, access: data.session?.access_token });
      await this.syncUserProfile(user);
      return user;
    }

    // Fallback demo login
    const selectedUser = MOCK_USERS[role] || { ...MOCK_USERS.student, email, role };
    tokenStorage.set({ user: selectedUser, access: 'mock_token_' + Date.now() });
    return selectedUser;
  },

  /**
   * Alias for signIn
   */
  async login(data) {
    return this.signIn(data);
  },

  /**
   * Continue with Google OAuth via Supabase
   */
  async signInWithGoogle() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect to /auth/callback so the app can sync profile and route by role
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
    }

    // Demo fallback for Google OAuth button UI
    const user = {
      id: 'usr_google_' + Date.now(),
      email: 'user.google@gmail.com',
      name: 'Google Authorized User',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: new Date().toISOString(),
    };
    tokenStorage.set({ user, access: 'mock_google_token' });
    return user;
  },

  /**
   * Alias for signInWithGoogle
   */
  async googleLogin() {
    return this.signInWithGoogle();
  },

  /**
   * Forgot Password request
   */
  async forgotPassword(email) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    }
    return { message: 'Password reset link sent' };
  },

  /**
   * Reset Password update
   */
  async resetPassword(newPassword) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return data;
    }
    return { message: 'Password updated successfully' };
  },

  /**
   * Sign Out / Logout
   */
  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    tokenStorage.clear();
  },

  /**
   * Alias for signOut
   */
  async logout() {
    return this.signOut();
  },

  getMockUserByRole(role) {
    return MOCK_USERS[role] || MOCK_USERS.student;
  },
};

export default authService;
