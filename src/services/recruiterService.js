import api from './api';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const fallbackProfile = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91 98765 43210',
  designation: 'Senior Technical Recruiter',
  avatar_url: 'https://i.pravatar.cc/120?img=68',
  company_name: 'Nexus Tech Global',
  company_logo: null,
  company_website: 'https://nexustech.io',
  industry: 'Software Engineering / AI Solutions',
  company_size: '250-500 Employees',
  location: 'San Francisco, CA / Hyderabad',
  experience_years: 8,
  specialization: 'Full Stack Engineering / Cloud Architecture',
  bio: 'Passionate recruiter and mentor with 8 years of experience in building scalable engineering teams.',
  verification_status: 'Verified',
  tax_id: 'TAX-9821-US',
  registration_doc_url: '',
  verified_at: null,
};

const normalizeText = (value) =>
  value === null || value === undefined ? '' : String(value).trim();

const normalizeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const mapRecruiterRow = (r) => {
  const techStack = [
    ...(r.specialization ? [r.specialization] : []),
    ...(r.industry ? [r.industry] : []),
  ];

  return {
    id: r.user_id,
    user_id: r.user_id,
    name: r.full_name || 'Recruiter',
    full_name: r.full_name || '',
    email: r.email || '',
    company: r.company_name || '',
    designation: r.designation || 'Recruiter',
    avatar:
      r.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(r.full_name || 'Recruiter')}&background=4f46e5&color=fff&size=128`,
    companyLogo:
      r.company_logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(r.company_name || 'Co')}&background=1abc9c&color=fff&size=64`,
    location: r.location || 'Remote',
    bio: r.bio || '',
    techStack,
    rating: 4.8,
    reviewsCount: 0,
    experience: `${r.experience_years || 0} Years`,
    experience_years: Number(r.experience_years || 0),
    completedInterviews: 0,
    isVerified: r.verification_status === 'Verified',
    isPremiumRecruiter: Number(r.experience_years || 0) >= 8,
    hourlyFee: 0,
    linkedin: '',
    website: r.company_website || '',
    company_size: r.company_size || '',
    industry: r.industry || '',
    verification_status: r.verification_status || 'Pending',
    tax_id: r.tax_id || '',
    registration_doc_url: r.registration_doc_url || '',
    verified_at: r.verified_at || null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
};

const recruiterService = {
  async getProfile() {
    try {
      const response = await api.get('/api/v1/recruiter/profile');
      if (response?.data?.data) return response.data.data;
    } catch (e) {
      console.warn('FastAPI getProfile fallback to Supabase:', e.message);
    }

    if (!isSupabaseConfigured() || !supabase) {
      const saved = localStorage.getItem('recruiter_profile');
      return saved ? JSON.parse(saved) : fallbackProfile;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const user = authData?.user;
      if (!user) throw new Error('No authenticated Supabase user found');

      const [
        { data: baseProfile, error: baseError },
        { data: recruiterProfile, error: recruiterError },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, name, email')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('recruiter_profiles')
          .select(`
            user_id,
            full_name,
            email,
            phone,
            designation,
            avatar_url,
            company_name,
            company_logo,
            company_website,
            industry,
            company_size,
            location,
            experience_years,
            specialization,
            bio,
            verification_status,
            tax_id,
            registration_doc_url,
            verified_at,
            created_at,
            updated_at
          `)
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (baseError) throw baseError;
      if (recruiterError) throw recruiterError;

      return {
        full_name: recruiterProfile?.full_name || baseProfile?.full_name || baseProfile?.name || '',
        email: recruiterProfile?.email || baseProfile?.email || user.email || '',
        phone: recruiterProfile?.phone || '',
        designation: recruiterProfile?.designation || '',
        avatar_url: recruiterProfile?.avatar_url || '',
        company_name: recruiterProfile?.company_name || '',
        company_logo: recruiterProfile?.company_logo || '',
        company_website: recruiterProfile?.company_website || '',
        industry: recruiterProfile?.industry || '',
        company_size: recruiterProfile?.company_size || '',
        location: recruiterProfile?.location || '',
        experience_years: normalizeNumber(recruiterProfile?.experience_years, 0),
        specialization: recruiterProfile?.specialization || '',
        bio: recruiterProfile?.bio || '',
        verification_status: recruiterProfile?.verification_status || 'Verified',
        tax_id: recruiterProfile?.tax_id || '',
        registration_doc_url: recruiterProfile?.registration_doc_url || '',
        verified_at: recruiterProfile?.verified_at || null,
        created_at: recruiterProfile?.created_at || null,
        updated_at: recruiterProfile?.updated_at || null,
      };
    } catch (err) {
      console.warn('Supabase recruiter profile query failed:', err.message);
      const saved = localStorage.getItem('recruiter_profile');
      return saved ? JSON.parse(saved) : fallbackProfile;
    }
  },

  async updateProfile(profileData) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const user = authData?.user;
    if (!user?.id) throw new Error('No authenticated Supabase user found');

    const fullName = normalizeText(profileData.full_name);
    const email = normalizeText(profileData.email);

    const basePayload = {
      id: user.id,
      full_name: fullName,
      email,
    };

    const recruiterPayload = {
      user_id: user.id,
      full_name: fullName,
      email,
      phone: normalizeText(profileData.phone),
      designation: normalizeText(profileData.designation),
      avatar_url: normalizeText(profileData.avatar_url),
      company_name: normalizeText(profileData.company_name),
      company_logo: normalizeText(profileData.company_logo),
      company_website: normalizeText(profileData.company_website),
      industry: normalizeText(profileData.industry),
      company_size: normalizeText(profileData.company_size),
      location: normalizeText(profileData.location),
      experience_years: normalizeNumber(profileData.experience_years, 0),
      specialization: normalizeText(profileData.specialization),
      bio: normalizeText(profileData.bio),
      verification_status: normalizeText(profileData.verification_status) || 'Verified',
      tax_id: normalizeText(profileData.tax_id),
      registration_doc_url: normalizeText(profileData.registration_doc_url),
      verified_at: profileData.verified_at || null,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem('recruiter_profile', JSON.stringify(profileData));

    try {
      const response = await api.put('/api/v1/recruiter/profile', profileData);

      if (response?.data) {
        if (isSupabaseConfigured() && supabase) {
          const { error: baseError } = await supabase
            .from('profiles')
            .upsert(basePayload, { onConflict: 'id' })
            .select('id')
            .maybeSingle();

          if (baseError) throw baseError;

          const { data, error } = await supabase
            .from('recruiter_profiles')
            .upsert(recruiterPayload, { onConflict: 'user_id' })
            .select('*')
            .maybeSingle();

          if (error) throw error;
          return data || response.data;
        }

        return response.data;
      }
    } catch (e) {
      console.warn('FastAPI updateProfile warning:', e.message);
    }

    if (isSupabaseConfigured() && supabase) {
      const { error: baseError } = await supabase
        .from('profiles')
        .upsert(basePayload, { onConflict: 'id' })
        .select('id')
        .maybeSingle();

      if (baseError) {
        throw new Error(`Failed to update profiles table: ${baseError.message}`);
      }

      const { data, error } = await supabase
        .from('recruiter_profiles')
        .upsert(recruiterPayload, { onConflict: 'user_id' })
        .select('*')
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to save recruiter profile: ${error.message}`);
      }

      return data;
    }

    return {
      status: 'success',
      message: 'Profile saved successfully',
      data: profileData,
    };
  },

  async getAllRecruiterProfiles() {
    if (!isSupabaseConfigured() || !supabase) return [];

    const { data, error } = await supabase
      .from('recruiter_profiles')
      .select(`
        user_id,
        full_name,
        email,
        phone,
        designation,
        avatar_url,
        company_name,
        company_logo,
        company_website,
        industry,
        company_size,
        location,
        experience_years,
        specialization,
        bio,
        verification_status,
        tax_id,
        registration_doc_url,
        verified_at,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDashboardOverview() {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        totalRecruiters: 0,
        verifiedRecruiters: 0,
        pendingRecruiters: 0,
        recentRecruiters: [],
      };
    }

    const { data, error } = await supabase
      .from('recruiter_profiles')
      .select(`
        user_id,
        full_name,
        company_name,
        verification_status,
        created_at,
        avatar_url,
        experience_years,
        industry,
        designation
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];
    return {
      totalRecruiters: rows.length,
      verifiedRecruiters: rows.filter((r) => r.verification_status === 'Verified').length,
      pendingRecruiters: rows.filter((r) => r.verification_status !== 'Verified').length,
      recentRecruiters: rows.slice(0, 5).map((r) => ({
        id: r.user_id,
        name: r.full_name,
        company: r.company_name,
        status: r.verification_status,
        created_at: r.created_at,
        avatar: r.avatar_url,
        experience_years: r.experience_years,
        industry: r.industry,
        designation: r.designation,
      })),
    };
  },

  async bookInterview(payload) {
    if (!isSupabaseConfigured() || !supabase) {
      return { status: 'success', message: 'Booked locally' };
    }

    const { data, error } = await supabase
      .from('interview_bookings')
      .insert({
        recruiter_id: payload.recruiter_id,
        recruiter_user_id: payload.recruiter_user_id,
        student_id: payload.student_id,
        interview_type: payload.interview_type,
        preferred_datetime: payload.preferred_datetime,
        message: payload.message || '',
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  mapRecruiterRow,
};

export default recruiterService;