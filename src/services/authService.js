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
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session) return data.session;
      } catch (_) {}
    }
    const user = tokenStorage.user;
    return user ? { user, access_token: 'mock_session_token' } : null;
  },

  /**
   * Refresh session
   */
  async refreshSession() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (!error && data?.session) return data.session;
      } catch (_) {}
    }
    return this.getSession();
  },

  /**
   * Sync user profile into Supabase public tables:
   * - public.profiles (base row)
   * - public.candidate_profiles or public.recruiter_profiles (role-specific)
   *
   * Admin users are NEVER saved into these tables.
   * The trigger on_auth_user_created handles inserting into profiles on signup;
   * syncUserProfile is used for post-login upsert of role-specific tables.
   */
  async syncUserProfile(user) {
    if (!user?.id || user.role === 'admin' || user.email === 'admin@skilltrack.ai') {
      return null;
    }
    if (!isSupabaseConfigured()) return user;

    try {
      const now = new Date().toISOString();
      const role = user.role || 'student';

      // 1. Upsert base profile row (trigger may have already created it)
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email,
            name: user.name || user.full_name || user.email.split('@')[0],
            role,
            avatar_url: user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`,
            updated_at: now,
          },
          { onConflict: 'id' }
        );
      if (profileErr) console.warn('profiles upsert warning:', profileErr.message);

      // 2. Upsert role-specific profile
      if (role === 'recruiter') {
        const recruiterData = {
          id: user.id,
          company: user.company || user.company_name || '',
          linkedin_url: user.linkedin_url || user.linkedinUrl || '',
          approval_status: user.approval_status || 'pending',
          is_approved: user.is_approved ?? false,
          website: user.website || '',
          updated_at: now,
        };
        const { data, error } = await supabase
          .from('recruiter_profiles')
          .upsert(recruiterData, { onConflict: 'id' })
          .select()
          .maybeSingle();
        if (error) console.warn('recruiter_profiles sync warning:', error.message);
        return data;
      } else {
        const candidateData = {
          id: user.id,
          phone: user.phone || '',
          linkedin_url: user.linkedin_url || user.linkedinUrl || '',
          website: user.website || '',
          updated_at: now,
        };
        const { data, error } = await supabase
          .from('candidate_profiles')
          .upsert(candidateData, { onConflict: 'id' })
          .select()
          .maybeSingle();
        if (error) console.warn('candidate_profiles sync warning:', error.message);
        return data;
      }
    } catch (e) {
      console.warn('Unable to sync profile to Supabase:', e.message);
      return null;
    }
  },

  /**
   * Get current authenticated user details from:
   * 1) Supabase auth.getUser()
   * 2) public.profiles (role, name, email, avatar_url)
   * 3) public.candidate_profiles or public.recruiter_profiles (role-specific fields)
   */
  async getCurrentUser() {
    const localUser = tokenStorage.user;
    if (localUser && (localUser.role === 'admin' || localUser.email === 'admin@skilltrack.ai')) {
      return MOCK_USERS.admin;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return localUser || null;

        if (user.email === 'admin@skilltrack.ai' || user.user_metadata?.role === 'admin') {
          return MOCK_USERS.admin;
        }

        // Fetch base profile row (role lives here)
        let { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // ── BACKFILL FIX ─────────────────────────────────────────────────────
        // Profile row is missing (user signed up before migration OR trigger
        // didn't fire). Create it now so subsequent reads always succeed.
        if (!profileData) {
          const resolvedRole = user.user_metadata?.role || localUser?.role || 'student';
          const resolvedName = user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            localUser?.name ||
            user.email.split('@')[0];
          const resolvedAvatar = user.user_metadata?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedName)}&background=4F46E5&color=fff`;

          const { data: inserted } = await supabase
            .from('profiles')
            .upsert(
              { id: user.id, email: user.email, name: resolvedName, role: resolvedRole, avatar_url: resolvedAvatar },
              { onConflict: 'id' }
            )
            .select()
            .maybeSingle();
          profileData = inserted;
        }
        // ─────────────────────────────────────────────────────────────────────

        const role = profileData?.role || user.user_metadata?.role || localUser?.role || 'student';
        let roleProfile = null;

        if (role === 'recruiter') {
          const { data } = await supabase
            .from('recruiter_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          roleProfile = data;

          // Backfill recruiter_profiles if also missing
          if (!roleProfile) {
            const { data: inserted } = await supabase
              .from('recruiter_profiles')
              .upsert(
                {
                  id: user.id,
                  company: user.user_metadata?.company || localUser?.company || '',
                  linkedin_url: user.user_metadata?.linkedin_url || localUser?.linkedin_url || '',
                  approval_status: 'pending',
                  is_approved: false,
                },
                { onConflict: 'id' }
              )
              .select()
              .maybeSingle();
            roleProfile = inserted;
          }
        } else {
          const { data } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          roleProfile = data;

          // Backfill candidate_profiles if also missing
          if (!roleProfile) {
            const { data: inserted } = await supabase
              .from('candidate_profiles')
              .upsert(
                { id: user.id, linkedin_url: user.user_metadata?.linkedin_url || '' },
                { onConflict: 'id' }
              )
              .select()
              .maybeSingle();
            roleProfile = inserted;
          }
        }

        const isPremium = Boolean(
          profileData?.is_premium ||
          roleProfile?.is_premium ||
          user.user_metadata?.is_premium ||
          localUser?.is_premium
        );
        const membershipType =
          profileData?.membership_type ||
          roleProfile?.membership_type ||
          (isPremium ? 'premium' : 'free');
        const currentPlan =
          profileData?.current_plan ||
          roleProfile?.current_plan ||
          (isPremium ? 'Student Premium' : 'Free Plan');
        const subStatus =
          profileData?.subscription_status ||
          roleProfile?.subscription_status ||
          (isPremium ? 'active' : 'inactive');

        const formattedUser = {
          id: user.id,
          email: user.email,
          name: profileData?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          role,
          avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`,
          avatar: profileData?.avatar_url || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`,
          // Candidate-specific
          phone: roleProfile?.phone || '',
          linkedin_url: roleProfile?.linkedin_url || '',
          website: roleProfile?.website || '',
          bio: roleProfile?.bio || '',
          location: roleProfile?.location || '',
          // Premium Membership fields from Supabase
          is_premium: isPremium,
          membership_type: membershipType,
          current_plan: currentPlan,
          subscription_status: subStatus,
          // Recruiter-specific
          company: roleProfile?.company || user.user_metadata?.company || '',
          approval_status: roleProfile?.approval_status || (role === 'recruiter' ? 'pending' : 'approved'),
          is_approved: roleProfile?.is_approved ?? (role !== 'recruiter'),
          // Common
          created_at: profileData?.updated_at || user.created_at,
          updated_at: profileData?.updated_at || user.created_at,
        };
        tokenStorage.set({ user: formattedUser, access: tokenStorage.access });
        return formattedUser;
      } catch (err) {
        console.warn('getCurrentUser error:', err.message);
      }
    }
    return localUser || null;
  },

  /**
   * Sign Up — calls Supabase Auth, trigger auto-creates profiles row,
   * then syncs role-specific profile.
   */
  async signUp({ name, email, password, role = 'student', company = '', linkedinUrl = '' }) {
    if (role === 'admin' || email === 'admin@skilltrack.ai') {
      throw new Error('Admin signup is disabled. Use direct Admin login.');
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
              company,
              linkedin_url: linkedinUrl,
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`,
            },
          },
        });
        if (!error && data.user) {
          const user = {
            id: data.user.id,
            email,
            name,
            role,
            company,
            linkedinUrl,
            linkedin_url: linkedinUrl,
            approval_status: role === 'recruiter' ? 'pending' : 'approved',
            is_approved: role !== 'recruiter',
            avatar: data.user.user_metadata?.avatar_url,
            avatar_url: data.user.user_metadata?.avatar_url,
            created_at: new Date().toISOString(),
          };
          tokenStorage.set({ user, access: data.session?.access_token || 'supabase_token' });
          // Sync role-specific row (trigger handles base profiles row)
          await this.syncUserProfile(user);
          return user;
        }
        if (error) throw new Error(error.message);
      } catch (err) {
        console.warn('Supabase signup error:', err.message);
        throw err;
      }
    }

    // Try FastAPI Backend
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, company, linkedin_url: linkedinUrl }),
      });
      if (response.ok) {
        const resData = await response.json();
        const newUser = {
          id: resData.user?.id || 'usr_' + Date.now(),
          email,
          name,
          role,
          company,
          linkedin_url: linkedinUrl,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`,
          created_at: new Date().toISOString(),
        };
        tokenStorage.set({ user: newUser, access: resData.access_token });
        return newUser;
      }
    } catch (_) {}

    // Demo fallback
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

  async signup(data) {
    return this.signUp(data);
  },

  /**
   * Sign In — fetches role from public.profiles after Supabase login,
   * so routing is always driven by the stored profile role.
   */
  async signIn({ email, password, role = 'student' }) {
    // Admin shortcut
    if (email === 'admin@skilltrack.ai' && password === 'Admin@123') {
      const adminUser = MOCK_USERS.admin;
      tokenStorage.set({ user: adminUser, access: 'admin_active_token' });
      return adminUser;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);

        if (data?.user) {
          const authMeta = data.user.user_metadata || {};
          // Resolve role: prefer what's already in user_metadata, else use the
          // tab the user clicked. getCurrentUser will read the DB value afterwards.
          const resolvedRole = authMeta.role || role;
          const resolvedName = authMeta.name || authMeta.full_name || email.split('@')[0];

          // Temporary store so RLS auth.uid() works for the upsert below
          tokenStorage.set({
            user: { id: data.user.id, email, name: resolvedName, role: resolvedRole },
            access: data.session?.access_token || 'sb_token',
          });

          // ── ENSURE PROFILE ROWS EXIST ──────────────────────────────────────
          // This handles: (a) pre-migration users, (b) trigger delay edge cases.
          await this.syncUserProfile({
            id: data.user.id,
            email: data.user.email,
            name: resolvedName,
            role: resolvedRole,
            avatar_url: authMeta.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedName)}&background=4F46E5&color=fff`,
            company: authMeta.company || '',
            linkedin_url: authMeta.linkedin_url || '',
          });
          // ──────────────────────────────────────────────────────────────────

          // Now read back full profile (role comes from public.profiles)
          const freshUser = await this.getCurrentUser();
          if (freshUser) {
            tokenStorage.set({ user: freshUser, access: data.session?.access_token || 'sb_token' });
            return freshUser;
          }
        }
      } catch (err) {
        console.warn('Supabase sign-in error:', err.message);
        throw err;
      }
    }

    // Try FastAPI Backend
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (response.ok) {
        const data = await response.json();
        const user = {
          id: data.user?.id || 'usr_' + Date.now(),
          email: data.user?.email || email,
          name: data.user?.name || email.split('@')[0],
          role: data.user?.role || role,
          company: data.user?.company || '',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          created_at: new Date().toISOString(),
        };
        tokenStorage.set({ user, access: data.access_token || 'fastapi_token' });
        return user;
      }
    } catch (_) {}

    // Demo fallback
    const baseUser = MOCK_USERS[role] || MOCK_USERS.student;
    const formattedName = email
      ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : baseUser.name;
    const selectedUser = {
      ...baseUser,
      email: email || baseUser.email,
      name: formattedName,
      role: role || baseUser.role,
    };
    tokenStorage.set({ user: selectedUser, access: 'mock_token_' + Date.now() });
    return selectedUser;
  },

  async login(data) {
    return this.signIn(data);
  },

  /**
   * Google OAuth
   */
  async signInWithGoogle() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (!error) return data;
      } catch (_) {}
    }

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

  async googleLogin() {
    return this.signInWithGoogle();
  },

  async forgotPassword(email) {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return data;
      } catch (_) {}
    }
    return { message: 'Password reset link sent' };
  },

  async resetPassword(newPassword) {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.auth.updateUser({ password: newPassword });
        return data;
      } catch (_) {}
    }
    return { message: 'Password updated successfully' };
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }
    tokenStorage.clear();
  },

  async logout() {
    return this.signOut();
  },

  getMockUserByRole(role) {
    return MOCK_USERS[role] || MOCK_USERS.student;
  },
};

export default authService;
