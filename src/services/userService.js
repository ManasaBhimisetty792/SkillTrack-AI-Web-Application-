import { supabase, isSupabaseConfigured } from './supabaseClient';
import { tokenStorage } from './api';

export const userService = {
  /**
   * Resolve active auth user ID from Supabase session or local storage.
   */
  async getActiveAuthUserId(providedId) {
    if (providedId) return providedId;
    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) return user.id;
    }
    return tokenStorage.user?.id || null;
  },

  /**
   * Get Candidate Profile by id (shared primary key = auth.users.id)
   */
  async getCandidateProfile(userId) {
    const activeUserId = await this.getActiveAuthUserId(userId);

    if (isSupabaseConfigured() && activeUserId) {
      // Fetch base profile + candidate-specific data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', activeUserId)
        .maybeSingle();

      const { data: candData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', activeUserId)
        .maybeSingle();

      if (profileData) {
        return {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: 'student',
          avatar_url: profileData.avatar_url,
          avatar: profileData.avatar_url,
          // Candidate-specific fields
          username: candData?.username || profileData.name?.toLowerCase().replace(/\s+/g, '_') || '',
          phone: candData?.phone || '',
          location: candData?.location || '',
          bio: candData?.bio || '',
          current_status: candData?.current_status || 'Student',
          github_url: candData?.github_url || '',
          portfolio_url: candData?.portfolio_url || '',
          resume_file_name: candData?.resume_file_name || '',
          resume_file_url: candData?.resume_file_url || '',
          profile_completion_pct: candData?.profile_completion_pct || 75,
          website: candData?.website || '',
          linkedin_url: candData?.linkedin_url || '',
          skills: candData?.skills || ['React', 'JavaScript', 'Python', 'FastAPI'],
          updated_at: candData?.updated_at || profileData.updated_at,
        };
      }
    }

    const localUser = tokenStorage.user || {};
    return {
      id: activeUserId || localUser.id || 'usr_101',
      email: localUser.email || 'alex.student@skilltrack.ai',
      name: localUser.name || 'Alex Johnson',
      username: localUser.username || 'alex_johnson_ai',
      role: 'student',
      avatar: localUser.avatar || localUser.avatar_url,
      avatar_url: localUser.avatar_url || localUser.avatar,
      phone: localUser.phone || '+1 (555) 234-5678',
      location: localUser.location || 'San Francisco, CA',
      bio: localUser.bio || 'Passionate Full-Stack Systems Architect with expertise in React, FastAPI, and AI integration pipelines.',
      current_status: localUser.current_status || 'Student',
      github_url: localUser.github_url || 'https://github.com/alexjohnson',
      linkedin_url: localUser.linkedin_url || 'https://linkedin.com/in/alexjohnson',
      portfolio_url: localUser.portfolio_url || 'https://alexjohnson.dev',
      website: localUser.website || 'https://alexjohnson.dev',
      resume_file_name: localUser.resume_file_name || 'Alex_Johnson_Resume_2026.pdf',
      resume_file_url: localUser.resume_file_url || '',
      profile_completion_pct: localUser.profile_completion_pct || 88,
      skills: localUser.skills || ['React', 'JavaScript', 'Python', 'FastAPI', 'Supabase'],
      created_at: localUser.created_at || new Date().toISOString(),
      updated_at: localUser.updated_at || new Date().toISOString(),
    };
  },

  /**
   * Get Recruiter Profile by id (shared primary key = auth.users.id)
   */
  async getRecruiterProfile(userId) {
    const activeUserId = await this.getActiveAuthUserId(userId);

    if (isSupabaseConfigured() && activeUserId) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', activeUserId)
        .maybeSingle();

      const { data: recData } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq('id', activeUserId)
        .maybeSingle();

      if (profileData) {
        return {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: 'recruiter',
          avatar_url: profileData.avatar_url,
          avatar: profileData.avatar_url,
          // Recruiter-specific fields
          username: recData?.username || '',
          phone: recData?.phone || '',
          location: recData?.location || '',
          bio: recData?.bio || '',
          company: recData?.company || '',
          approval_status: recData?.approval_status || 'pending',
          is_approved: recData?.is_approved ?? false,
          linkedin_url: recData?.linkedin_url || '',
          website: recData?.website || '',
          updated_at: recData?.updated_at || profileData.updated_at,
        };
      }
    }

    const localUser = tokenStorage.user || {};
    return {
      id: activeUserId || localUser.id || 'usr_202',
      email: localUser.email || 'sarah.recruiter@techcorp.com',
      name: localUser.name || 'Sarah Jenkins',
      role: 'recruiter',
      avatar_url: localUser.avatar_url || localUser.avatar,
      avatar: localUser.avatar || localUser.avatar_url,
      company: localUser.company || 'Nexus Tech Global',
      approval_status: localUser.approval_status || 'pending',
      is_approved: localUser.is_approved ?? false,
      linkedin_url: localUser.linkedin_url || '',
      website: localUser.website || '',
      created_at: localUser.created_at || new Date().toISOString(),
      updated_at: localUser.updated_at || new Date().toISOString(),
    };
  },

  /**
   * Generic getProfile dispatcher
   */
  async getProfile(userId, role) {
    const userRole = role || tokenStorage.user?.role || 'student';
    if (userRole === 'recruiter') {
      return this.getRecruiterProfile(userId);
    }
    return this.getCandidateProfile(userId);
  },

  /**
   * Update Candidate Profile in `candidate_profiles` (keyed by id)
   */
  async updateCandidateProfile(userId, profileData) {
    const activeUserId = await this.getActiveAuthUserId(userId);
    const now = new Date().toISOString();

    const candidatePayload = {
      id: activeUserId,
      username: profileData.username,
      phone: profileData.phone,
      location: profileData.location,
      bio: profileData.bio,
      current_status: profileData.current_status,
      github_url: profileData.github_url,
      portfolio_url: profileData.portfolio_url,
      resume_file_name: profileData.resume_file_name,
      resume_file_url: profileData.resume_file_url || profileData.resume_url,
      profile_completion_pct: profileData.profile_completion_pct,
      website: profileData.website,
      linkedin_url: profileData.linkedin_url,
      skills: profileData.skills,
      updated_at: now,
    };
    Object.keys(candidatePayload).forEach(
      (key) => candidatePayload[key] === undefined && delete candidatePayload[key]
    );

    // Also update the base profiles row for name/avatar changes
    if (profileData.name || profileData.avatar_url) {
      const baseUpdate = {};
      if (profileData.name) baseUpdate.name = profileData.name;
      if (profileData.avatar_url) baseUpdate.avatar_url = profileData.avatar_url;
      baseUpdate.updated_at = now;

      if (isSupabaseConfigured() && activeUserId) {
        await supabase.from('profiles').update(baseUpdate).eq('id', activeUserId);
      }
    }

    if (isSupabaseConfigured() && activeUserId) {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .upsert(candidatePayload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) console.error('Failed to update candidate_profiles:', error.message);
      if (data) {
        const formatted = {
          ...data,
          name: profileData.name || tokenStorage.user?.name,
          role: 'student',
          avatar: profileData.avatar_url || tokenStorage.user?.avatar_url,
        };
        const current = tokenStorage.user || {};
        tokenStorage.set({ user: { ...current, ...formatted }, access: tokenStorage.access });
        return formatted;
      }
    }

    const current = tokenStorage.user || {};
    const updated = { ...current, ...candidatePayload, name: profileData.name || current.name };
    tokenStorage.set({ user: updated, access: tokenStorage.access });
    return updated;
  },

  /**
   * Update Recruiter Profile in `recruiter_profiles` (keyed by id)
   */
  async updateRecruiterProfile(userId, profileData) {
    const activeUserId = await this.getActiveAuthUserId(userId);
    const now = new Date().toISOString();

    const recruiterPayload = {
      id: activeUserId,
      phone: profileData.phone,
      location: profileData.location,
      bio: profileData.bio,
      company: profileData.company || profileData.company_name,
      linkedin_url: profileData.linkedin_url || profileData.linkedin,
      website: profileData.website,
      approval_status: profileData.approval_status,
      is_approved: profileData.is_approved,
      updated_at: now,
    };
    Object.keys(recruiterPayload).forEach(
      (key) => recruiterPayload[key] === undefined && delete recruiterPayload[key]
    );

    if (profileData.name || profileData.avatar_url) {
      const baseUpdate = {};
      if (profileData.name) baseUpdate.name = profileData.name;
      if (profileData.avatar_url) baseUpdate.avatar_url = profileData.avatar_url;
      baseUpdate.updated_at = now;

      if (isSupabaseConfigured() && activeUserId) {
        await supabase.from('profiles').update(baseUpdate).eq('id', activeUserId);
      }
    }

    if (isSupabaseConfigured() && activeUserId) {
      const { data, error } = await supabase
        .from('recruiter_profiles')
        .upsert(recruiterPayload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) console.error('Failed to update recruiter_profiles:', error.message);
      if (data) {
        const formatted = {
          ...data,
          name: profileData.name || tokenStorage.user?.name,
          role: 'recruiter',
          company: data.company,
          avatar: profileData.avatar_url || tokenStorage.user?.avatar_url,
        };
        const current = tokenStorage.user || {};
        tokenStorage.set({ user: { ...current, ...formatted }, access: tokenStorage.access });
        return formatted;
      }
    }

    const current = tokenStorage.user || {};
    const updated = { ...current, ...recruiterPayload, name: profileData.name || current.name };
    tokenStorage.set({ user: updated, access: tokenStorage.access });
    return updated;
  },

  /**
   * Generic update profile wrapper
   */
  async updateProfile(userId, profileData) {
    if (typeof userId === 'object' && !profileData) {
      profileData = userId;
      userId = profileData.id;
    }
    const userRole = profileData.role || tokenStorage.user?.role || 'student';
    if (userRole === 'recruiter') {
      return this.updateRecruiterProfile(userId, profileData);
    }
    return this.updateCandidateProfile(userId, profileData);
  },

  /**
   * Fetch all recruiters for the Recruiter Listing marketplace
   */
  async getAllRecruiters() {
    if (isSupabaseConfigured()) {
      // Join profiles + recruiter_profiles
      const { data, error } = await supabase
        .from('recruiter_profiles')
        .select('*, profiles!inner(name, email, avatar_url)')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r) => ({
          id: r.id,
          name: r.profiles?.name || r.username || 'Recruiter',
          company: r.company || '',
          companyLogo: r.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.company || 'Company')}`,
          avatar: r.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.profiles?.name || 'Recruiter')}`,
          designation: 'Recruiter',
          experience: '5+ Years',
          industry: 'Technology',
          location: r.location || 'Remote',
          companySize: '100+',
          linkedin: r.linkedin_url || '',
          website: r.website || '',
          techStack: ['React', 'Python', 'FastAPI', 'Node.js', 'System Design'],
          interviewTypes: ['Technical Drill', 'System Design', 'Culture Fit'],
          rating: 4.9,
          reviewsCount: 48,
          completedInterviews: 120,
          isVerified: r.is_approved,
          isPremiumRecruiter: true,
          hourlyFee: 75,
        }));
      }
    }

    // Fallback mock list
    return [
      {
        id: 'rec-1',
        name: 'Sarah Jenkins',
        company: 'Nexus Tech Global',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
        designation: 'Staff AI Talent Lead',
        experience: '8+ Years',
        industry: 'Enterprise Technology',
        location: 'San Francisco, CA',
        techStack: ['React', 'TypeScript', 'FastAPI', 'Supabase', 'Python'],
        interviewTypes: ['Technical Deep Dive', 'System Design'],
        rating: 4.95,
        reviewsCount: 142,
        completedInterviews: 310,
        isVerified: true,
        isPremiumRecruiter: true,
        hourlyFee: 75,
      },
      {
        id: 'rec-2',
        name: 'Marcus Vance',
        company: 'Quantum Software Labs',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=200',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        designation: 'Principal Frontend Architect',
        experience: '12+ Years',
        industry: 'Software Engineering',
        location: 'Austin, TX',
        techStack: ['React', 'Next.js', 'Web Vitals', 'GraphQL'],
        interviewTypes: ['System Design', 'Behavioral'],
        rating: 4.88,
        reviewsCount: 98,
        completedInterviews: 220,
        isVerified: true,
        isPremiumRecruiter: false,
        hourlyFee: 90,
      },
    ];
  },
};

export default userService;
