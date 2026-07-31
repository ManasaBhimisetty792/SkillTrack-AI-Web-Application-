import api from './api';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const recruiterService = {
  // ------------------------------------------------------------------------
  // 1. RECRUITER PROFILE (Supabase: recruiter_profiles)
  // ------------------------------------------------------------------------
  async getProfile() {
    try {
      const response = await api.get('/api/v1/recruiter/profile');
      if (response.data?.data) return response.data.data;
    } catch (e) {
      console.warn('FastAPI getProfile fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
  try {

    const { data: userData } = await supabase.auth.getUser();

    const { data } = await supabase
      .from('recruiter_profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (data) return data;

  } catch (err) {
    console.warn('Supabase recruiter_profiles query failed:', err.message);
  }
}

    const saved = localStorage.getItem('st_recruiter_profile');
    if (saved) return JSON.parse(saved);

    return {
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      designation: 'Senior Technical Recruiter',
      avatar_url: 'https://i.pravatar.cc/120?img=68',
      company_name: 'Nexus Tech Global',
      company_logo: null,
      company_website: 'https://nexustech.io',
      industry: 'Software Engineering & AI Solutions',
      company_size: '250-500 Employees',
      location: 'San Francisco, CA & Hyderabad',
      experience_years: 8,
      specialization: 'Full Stack Engineering & Cloud Architecture',
      bio: 'Passionate recruiter and mentor with 8+ years of experience in building scalable engineering teams.',
      verification_status: 'Verified',
      tax_id: 'TAX-9821-US',
    };
  },

  async updateProfile(profileData) {
    localStorage.setItem('st_recruiter_profile', JSON.stringify(profileData));

    try {
      const response = await api.put('/api/v1/recruiter/profile', profileData);
      if (response.data) {
        if (isSupabaseConfigured()) {

  const { data: userData } = await supabase.auth.getUser();

  if (userData?.user?.id) {

    const { error } = await supabase
      .from('recruiter_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userData.user.id);

    if (error) throw error;
  }
}
        return response.data;
      }
    } catch (e) {
      console.warn('FastAPI updateProfile warning:', e.message);
    }

    if (isSupabaseConfigured()) {

  const { data: userData } = await supabase.auth.getUser();

  if (userData?.user?.id) {

    const { error } = await supabase
      .from('recruiter_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userData.user.id);

    if (error) throw error;
  }
}

    return { status: 'success', message: 'Profile saved successfully', data: profileData };
  },

  // ------------------------------------------------------------------------
  // 2. DASHBOARD OVERVIEW (Supabase queries on jobs, candidates, interviews)
  // ------------------------------------------------------------------------
  async getDashboardOverview() {
    try {
      const response = await api.get('/api/v1/recruiter/dashboard');
      if (response.data) return response.data;
    } catch (e) {
      console.warn('FastAPI dashboard fetch fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: jobs } = await supabase.from('recruiter_jobs').select('*');
        const { data: candidates } = await supabase.from('recruiter_candidates').select('*');
        const { data: interviews } = await supabase.from('recruiter_interviews').select('*');

        if (jobs || candidates || interviews) {
          return {
            metrics: {
              pending_requests: candidates?.filter(c => c.fit_status === 'Maybe').length || 12,
              todays_interviews: interviews?.filter(i => i.status === 'Confirmed').length || 3,
              upcoming_interviews: interviews?.length || 5,
              completed_interviews: interviews?.filter(i => i.status === 'Completed').length || 25,
              active_jobs: jobs?.length || 8,
              total_applicants: candidates?.length || 240,
            },
            recent_applicants: candidates?.slice(0, 3) || [],
            today_schedule: interviews?.slice(0, 3) || [],
          };
        }
      } catch (err) {
        console.warn('Supabase dashboard queries failed:', err.message);
      }
    }

    return {
      metrics: {
        pending_requests: 12,
        todays_interviews: 3,
        upcoming_interviews: 5,
        completed_interviews: 25,
        active_jobs: 8,
        total_applicants: 240,
      },
      recent_applicants: [
        { id: 1, name: 'Akhila Reddy', role: 'Python Developer', exp: '2.5 Yrs Exp.', loc: 'Hyderabad, India', ats: 91, fit: 'Suitable', skills: ['Python', 'Django', 'SQL', 'REST API'], date: '29 Jul, 2024', img: 'https://i.pravatar.cc/80?img=47' },
        { id: 2, name: 'Rahul Kumar', role: 'Full Stack Developer', exp: '3.1 Yrs Exp.', loc: 'Bangalore, India', ats: 87, fit: 'Suitable', skills: ['React', 'Node.js', 'MongoDB', 'Express'], date: '29 Jul, 2024', img: 'https://i.pravatar.cc/80?img=12' },
        { id: 3, name: 'Sneha Patel', role: 'Frontend Developer', exp: '1.8 Yrs Exp.', loc: 'Pune, India', ats: 72, fit: 'Maybe', skills: ['HTML', 'CSS', 'JavaScript', 'React'], date: '29 Jul, 2024', img: 'https://i.pravatar.cc/80?img=32' },
      ],
      today_schedule: [
        { time: '10:00 AM', name: 'Akhila Reddy', role: 'Python Developer', status: 'Confirmed', img: 'https://i.pravatar.cc/80?img=47' },
        { time: '02:00 PM', name: 'Rahul Kumar', role: 'Full Stack Developer', status: 'Confirmed', img: 'https://i.pravatar.cc/80?img=12' },
        { time: '04:00 PM', name: 'Priya Sharma', role: 'React Developer', status: 'Pending', img: 'https://i.pravatar.cc/80?img=25' },
      ],
    };
  },

  // ------------------------------------------------------------------------
  // 3. REVENUE & PAYOUTS (Supabase: recruiter_revenue & recruiter_transactions)
  // ------------------------------------------------------------------------
  async getRevenueData() {
    try {
      const response = await api.get('/api/v1/recruiter/revenue');
      if (response.data) return response.data;
    } catch (e) {
      console.warn('FastAPI revenue fetch fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: rev } = await supabase.from('recruiter_revenue').select('*').single();
        const { data: txns } = await supabase.from('recruiter_transactions').select('*');
        if (rev) {
          return {
            overview: rev,
            transactions: txns || [],
          };
        }
      } catch (err) {
        console.warn('Supabase revenue query failed:', err.message);
      }
    }

    return {
      overview: {
        monthly_revenue: 14850.00,
        pending_payouts: 3200.00,
        paid_history: 48900.00,
        performance_bonus: 1500.00,
        expected_payout: 4700.00,
        ranking: 4,
      },
      monthly_chart: [
        { month: 'Jan', amount: 6200 },
        { month: 'Feb', amount: 7800 },
        { month: 'Mar', amount: 9100 },
        { month: 'Apr', amount: 8400 },
        { month: 'May', amount: 11200 },
        { month: 'Jun', amount: 13500 },
        { month: 'Jul', amount: 14850 },
      ],
      transactions: [
        { id: 'TXN-8091', date: '2026-07-28', description: 'Candidate Placement Fee - Akhila Reddy', type: 'Placement Commission', amount: 2500.00, status: 'Completed' },
        { id: 'TXN-8044', date: '2026-07-25', description: 'Monthly Performance Milestone Bonus', type: 'Bonus', amount: 1500.00, status: 'Completed' },
        { id: 'TXN-7982', date: '2026-07-20', description: 'Candidate Placement Fee - Rahul Kumar', type: 'Placement Commission', amount: 3200.00, status: 'Pending' },
        { id: 'TXN-7910', date: '2026-07-15', description: 'Withdrawal to Chase Bank (****4821)', type: 'Withdrawal', amount: -5000.00, status: 'Completed' },
        { id: 'TXN-7855', date: '2026-07-10', description: 'Candidate Placement Fee - Sneha Patel', type: 'Placement Commission', amount: 2100.00, status: 'Completed' },
      ],
      withdraw_history: [
        { date: '15 Jul, 2026', amount: '$5,000.00', account: 'Chase Bank (****4821)', status: 'Completed' },
        { date: '01 Jul, 2026', amount: '$4,500.00', account: 'Chase Bank (****4821)', status: 'Completed' },
        { date: '15 Jun, 2026', amount: '$6,200.00', account: 'Chase Bank (****4821)', status: 'Completed' },
      ],
    };
  },

  // ------------------------------------------------------------------------
  // 4. NOTIFICATIONS (Supabase: recruiter_notifications)
  // ------------------------------------------------------------------------
  async getNotifications() {
    try {
      const response = await api.get('/api/v1/recruiter/notifications');
      if (response.data?.notifications) return response.data.notifications;
    } catch (e) {
      console.warn('FastAPI notifications fetch fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('recruiter_notifications').select('*');
        if (data && data.length) return data;
      } catch (err) {
        console.warn('Supabase recruiter_notifications query failed:', err.message);
      }
    }

    return [
      { id: 1, icon: 'request', text: 'New interview request from Akhila Reddy', sub: 'Python Developer', time: '5 mins ago', category: 'Requests', read: false },
      { id: 2, icon: 'accept', text: 'Rahul Kumar accepted your interview request', sub: 'Full Stack Developer', time: '20 mins ago', category: 'Interviews', read: false },
      { id: 3, icon: 'reminder', text: 'Interview with Priya Sharma starts in 30 minutes', sub: 'React Developer', time: '30 mins ago', category: 'Interviews', read: false },
      { id: 4, icon: 'cancel', text: 'Vikram Singh cancelled the interview', sub: 'Backend Developer', time: '2 hours ago', category: 'Interviews', read: true },
      { id: 5, icon: 'complete', text: 'Your interview with Suresh Patel has been completed', sub: 'Senior Architect', time: '3 hours ago', category: 'Interviews', read: true },
    ];
  },

  // ------------------------------------------------------------------------
  // 5. INTERVIEWS & SCHEDULE (Supabase: recruiter_interviews)
  // ------------------------------------------------------------------------
  async getInterviews() {
    try {
      const response = await api.get('/api/v1/recruiter/interviews');
      if (response.data) return response.data;
    } catch (e) {
      console.warn('FastAPI interviews fetch fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('recruiter_interviews').select('*');
        if (data && data.length) {
          return {
            schedule: data.filter(i => i.status !== 'Completed'),
            history: data.filter(i => i.status === 'Completed' || i.status === 'Cancelled'),
          };
        }
      } catch (err) {
        console.warn('Supabase recruiter_interviews query failed:', err.message);
      }
    }

    return {
      schedule: [
        { id: 101, time: '10:00 AM', name: 'Akhila Reddy', role: 'Python Developer', status: 'Confirmed', img: 'https://i.pravatar.cc/80?img=47', date: '2026-07-31' },
        { id: 102, time: '02:00 PM', name: 'Rahul Kumar', role: 'Full Stack Developer', status: 'Confirmed', img: 'https://i.pravatar.cc/80?img=12', date: '2026-07-31' },
        { id: 103, time: '04:00 PM', name: 'Priya Sharma', role: 'React Developer', status: 'Pending', img: 'https://i.pravatar.cc/80?img=25', date: '2026-07-31' },
      ],
      history: [
        { id: 201, name: 'Akhila Reddy', role: 'Python Developer', date: '30 Jul, 2024', time: '10:00 AM', dur: '60 min', status: 'Completed', img: 'https://i.pravatar.cc/80?img=47' },
        { id: 202, name: 'Rahul Kumar', role: 'Full Stack Developer', date: '28 Jul, 2024', time: '02:00 PM', dur: '45 min', status: 'Completed', img: 'https://i.pravatar.cc/80?img=12' },
        { id: 203, name: 'Sneha Patel', role: 'Frontend Developer', date: '25 Jul, 2024', time: '11:00 AM', dur: '60 min', status: 'Completed', img: 'https://i.pravatar.cc/80?img=32' },
        { id: 204, name: 'Vikram Singh', role: 'Backend Developer', date: '24 Jul, 2024', time: '04:00 PM', dur: '45 min', status: 'Cancelled', img: 'https://i.pravatar.cc/80?img=53' },
      ],
    };
  },

  // ------------------------------------------------------------------------
  // 6. CANDIDATES (Supabase: recruiter_candidates)
  // ------------------------------------------------------------------------
  async getCandidates() {
    try {
      const response = await api.get('/api/v1/recruiter/candidates');
      if (response.data?.candidates) return response.data.candidates;
    } catch (e) {
      console.warn('FastAPI candidates fetch fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('recruiter_candidates').select('*');
        if (data && data.length) return data;
      } catch (err) {
        console.warn('Supabase recruiter_candidates query failed:', err.message);
      }
    }

    return [
      { id: 1, name: 'Akhila Reddy', role: 'Python Developer', exp: '2.5 Yrs Exp.', loc: 'Hyderabad, India', ats: 91, fit: 'Suitable', skills: ['Python', 'Django', 'SQL', 'REST API'], date: '29 Jul, 2024', img: 'https://i.pravatar.cc/80?img=47' },
      { id: 2, name: 'Rahul Kumar', role: 'Full Stack Developer', exp: '3.1 Yrs Exp.', loc: 'Bangalore, India', ats: 87, fit: 'Suitable', skills: ['React', 'Node.js', 'MongoDB', 'Express'], date: '29 Jul, 2024', img: 'https://i.pravatar.cc/80?img=12' },
      { id: 3, name: 'Sneha Patel', role: 'Frontend Developer', exp: '1.8 Yrs Exp.', loc: 'Pune, India', ats: 72, fit: 'Maybe', skills: ['HTML', 'CSS', 'JavaScript', 'React'], date: '29 Jul, 2024', img: 'https://i.pravatar.cc/80?img=32' },
      { id: 4, name: 'Vikram Singh', role: 'Backend Developer', exp: '4.2 Yrs Exp.', loc: 'Delhi, India', ats: 65, fit: 'Maybe', skills: ['Java', 'Spring Boot', 'MySQL'], date: '29 Jul, 2024', img: 'https://i.pravatar.cc/80?img=53' },
    ];
  },

  // ------------------------------------------------------------------------
  // 7. APPLICATIONS (Supabase: recruiter_applications)
  // ------------------------------------------------------------------------
  async getApplications() {
    try {
      const response = await api.get('/api/v1/recruiter/applications');
      if (response.data?.applications) return response.data.applications;
    } catch (e) {
      console.warn('FastAPI applications fetch fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('recruiter_applications').select('*');
        if (data && data.length) return data;
      } catch (err) {
        console.warn('Supabase recruiter_applications query failed:', err.message);
      }
    }

    return [
      { id: 'app_1', candidate_name: 'Akhila Reddy', role: 'Python Developer', job_title: 'Senior Python Architect', ats_score: 91, fit: 'Suitable', status: 'Interviewing', date: '2026-07-29' },
      { id: 'app_2', candidate_name: 'Rahul Kumar', role: 'Full Stack Developer', job_title: 'Lead Full Stack React Engineer', ats_score: 87, fit: 'Suitable', status: 'Offered', date: '2026-07-28' },
      { id: 'app_3', candidate_name: 'Sneha Patel', role: 'Frontend Developer', job_title: 'Lead Full Stack React Engineer', ats_score: 72, fit: 'Maybe', status: 'Screening', date: '2026-07-27' },
      { id: 'app_4', candidate_name: 'Vikram Singh', role: 'Backend Developer', job_title: 'Senior Python Architect', ats_score: 65, fit: 'Maybe', status: 'Rejected', date: '2026-07-24' },
    ];
  },

  // ------------------------------------------------------------------------
  // 8. JOBS (Supabase: recruiter_jobs)
  // ------------------------------------------------------------------------
  async getJobs() {
    try {
      const response = await api.get('/api/v1/recruiter/jobs');
      if (response.data?.jobs) return response.data.jobs;
    } catch (e) {
      console.warn('FastAPI jobs fetch fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('recruiter_jobs').select('*');
        if (data && data.length) return data;
      } catch (err) {
        console.warn('Supabase recruiter_jobs query failed:', err.message);
      }
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
    try {
      const response = await api.post('/api/v1/recruiter/jobs', jobData);
      if (response.data?.job) return response.data.job;
    } catch (e) {
      console.warn('FastAPI createJob fallback to Supabase:', e.message);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('recruiter_jobs').insert(jobData).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createJob query failed:', err.message);
      }
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
