import { supabase, isSupabaseConfigured } from './supabaseClient';

export const interviewService = {
  async getMockSessions() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('interviews').select('*').order('created_at', { ascending: false });
      if (data && data.length) return data;
    }
    return [
      {
        id: 'int_101',
        title: 'Full Stack React & Node.js Technical Drill',
        category: 'Frontend Engineering',
        score: 92,
        duration: '35 mins',
        questionsCount: 8,
        date: '2026-07-22',
        status: 'Completed',
        feedbackSummary: 'Strong mastery of hooks, virtual DOM reconciler, and asynchronous state handling.',
      },
      {
        id: 'int_102',
        title: 'System Design & Distributed Architecture',
        category: 'System Design',
        score: 88,
        duration: '45 mins',
        questionsCount: 5,
        date: '2026-07-18',
        status: 'Completed',
        feedbackSummary: 'Good database partitioning approach; room to improve load balancing trade-off details.',
      },
      {
        id: 'int_103',
        title: 'Behavioral & Leadership Readiness Session',
        category: 'Behavioral',
        score: 95,
        duration: '25 mins',
        questionsCount: 6,
        date: '2026-07-10',
        status: 'Completed',
        feedbackSummary: 'Excellent STAR method articulation and conflict resolution narrative.',
      },
    ];
  },

  async startInterview({ category, role, difficulty }) {
    await new Promise((res) => setTimeout(res, 800));
    return {
      sessionId: 'sess_' + Date.now(),
      category: category || 'Full Stack Software Engineer',
      difficulty: difficulty || 'Intermediate',
      totalQuestions: 5,
      questions: [
        {
          id: 1,
          question: 'How do you optimize state re-renders in a large React 19 application with dynamic data tables?',
          codeSnippet: 'const [items, setItems] = useState([]);',
          hints: ['Consider React.memo, useMemo, and fine-grained signal structures.'],
        },
        {
          id: 2,
          question: 'Explain the difference between optimistic UI updates and traditional server confirmation in Supabase real-time queries.',
          hints: ['Focus on latency perception vs data consistency.'],
        },
        {
          id: 3,
          question: 'How do you handle JWT access token expiration without disturbing user session state?',
          hints: ['Axios interceptors, refresh token rotation, and silent queue resolution.'],
        },
      ],
    };
  },

  async submitAnswer({ sessionId, questionId, answerText }) {
    await new Promise((res) => setTimeout(res, 600));
    return {
      questionId,
      score: 90 + Math.floor(Math.random() * 8),
      feedback: 'Great clarity in technical details. You accurately identified the core architectural bottleneck.',
      keyStrengths: ['Precise vocabulary', 'Concrete code examples'],
      areasForImprovement: ['Mention edge-case handling for network drops.'],
    };
  },

  async generateReport(sessionId) {
    return {
      sessionId: sessionId || 'sess_101',
      overallScore: 92,
      technicalAccuracy: 94,
      communicationClarity: 90,
      problemSolving: 91,
      timeManagement: 93,
      dateCompleted: new Date().toLocaleDateString(),
      detailedFeedback: 'You demonstrated staff-level understanding of web architecture, API design, and asynchronous patterns.',
      questionBreakdown: [
        { q: 'React Performance Optimization', score: 95, verdict: 'Excellent' },
        { q: 'Supabase Row Level Security (RLS)', score: 90, verdict: 'Strong' },
        { q: 'OAuth Token Refresh Flow', score: 92, verdict: 'Great' },
      ],
    };
  },
};

export default interviewService;
