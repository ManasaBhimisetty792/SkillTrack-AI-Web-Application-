import { supabase, isSupabaseConfigured } from './supabaseClient';

export const recruiterService = {
  async getDashboardOverview() {
    return {
      activeJobs: 12,
      totalApplicants: 486,
      shortlistedCandidates: 64,
      interviewsScheduled: 18,
      recentApplicants: [
        {
          id: 'cand_1',
          name: 'Alex Johnson',
          role: 'Senior React Developer',
          score: 96,
          appliedDate: '2026-07-24',
          status: 'AI Screened - Recommended',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          skillsMatch: ['React 19', 'FastAPI', 'Supabase', 'TypeScript'],
        },
        {
          id: 'cand_2',
          name: 'Elena Rostova',
          role: 'Full Stack Engineer',
          score: 92,
          appliedDate: '2026-07-23',
          status: 'Interview Scheduled',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
          skillsMatch: ['Node.js', 'PostgreSQL', 'Docker', 'GraphQL'],
        },
        {
          id: 'cand_3',
          name: 'Marcus Chen',
          role: 'AI/ML Infrastructure Lead',
          score: 89,
          appliedDate: '2026-07-22',
          status: 'Under Review',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          skillsMatch: ['Python', 'PyTorch', 'FastAPI', 'Kubernetes'],
        },
      ],
    };
  },

  async getJobs() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('jobs').select('*');
      if (data && data.length) return data;
    }
    return [
      {
        id: 'job_1',
        title: 'Lead Full Stack React Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA (Hybrid)',
        type: 'Full-Time',
        applicantsCount: 142,
        aiScoreThreshold: 85,
        status: 'Active',
        postedDate: '2026-07-01',
        salaryRange: '$160,000 - $190,000',
      },
      {
        id: 'job_2',
        title: 'AI Product Specialist & Technical Recruiter',
        department: 'Talent Acquisition',
        location: 'Remote',
        type: 'Full-Time',
        applicantsCount: 88,
        aiScoreThreshold: 80,
        status: 'Active',
        postedDate: '2026-07-10',
        salaryRange: '$120,000 - $145,000',
      },
      {
        id: 'job_3',
        title: 'Senior Python & FastAPI Architect',
        department: 'Backend & Cloud',
        location: 'New York, NY',
        type: 'Full-Time',
        applicantsCount: 210,
        aiScoreThreshold: 90,
        status: 'Active',
        postedDate: '2026-07-15',
        salaryRange: '$175,000 - $210,000',
      },
    ];
  },

  async createJob(jobData) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('jobs').insert(jobData).select().single();
      if (error) throw error;
      return data;
    }
    return {
      id: 'job_' + Date.now(),
      ...jobData,
      applicantsCount: 0,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
  },
};

export default recruiterService;
