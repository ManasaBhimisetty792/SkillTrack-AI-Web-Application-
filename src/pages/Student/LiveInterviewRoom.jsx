import React, { useState, useEffect, useRef } from 'react';
import {
  FiVideo, FiMic, FiMicOff, FiVideoOff, FiClock,
  FiWifi, FiPhoneOff, FiUsers, FiMonitor, FiCheckCircle, FiStar, FiX
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import interviewService from '../../services/interviewService';
import recruiterService from '../../services/recruiterService';
import toast from 'react-hot-toast';
import './liveInterviewRoom.css';

export const StudentLiveInterviewRoom = () => {
  const { user } = useAuth();

  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Live session state from Supabase
  const [liveSessions, setLiveSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  // Feedback Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [technicalRating, setTechnicalRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [behaviourRating, setBehaviourRating] = useState(5);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('Strong Hire');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    interviewService.getStudentInterviewRequests().then((data) => {
      if (isMounted && Array.isArray(data)) {
        const accepted = data.filter((d) => d.status === 'accepted');
        setLiveSessions(accepted);
        if (accepted.length > 0) {
          setCurrentSession(accepted[0]);
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  const meetingId = currentSession?.meeting_id || 'mtg_889214092';
  const roomName = currentSession?.type ? `room_${currentSession.type.toLowerCase().replace(/\s+/g, '_')}` : 'skilltrack_mock_room_402';
  const recruiterName = currentSession?.recruiter || 'Sarah Jenkins';

  const handleJoinMeeting = () => {
    setConnected(true);
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    toast.success(`🎥 Joined Live Interview Room with ${recruiterName}!`);
  };

  const handleLeaveMeeting = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setConnected(false);
    setSecondsElapsed(0);
    setShowFeedbackModal(true);
    toast.success('Interview Session Ended. Please leave your feedback.');
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await recruiterService.submitInterviewFeedback({
        interviewRequestId: currentSession?.id,
        studentId: user?.id,
        recruiterUserId: currentSession?.recruiter_user_id,
        overallRating,
        technicalRating,
        communicationRating,
        behaviourRating,
        comments,
        recommendation,
        isAnonymous,
        role: 'student',
      });
      toast.success('⭐ Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setComments('');
    } catch (err) {
      console.error('Feedback submit error:', err);
      toast.error('Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimer = (total) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <DashboardLayout title="Live Interview Room">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', minHeight: 'calc(100vh - 160px)' }}>

        {/* ── Left: Meeting Workspace ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Meeting Header */}
          <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <span style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: connected ? '#10B981' : '#F59E0B',
                  boxShadow: connected ? '0 0 8px #10B981' : '0 0 8px #F59E0B'
                }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: connected ? '#10B981' : '#F59E0B' }}>
                  {connected ? 'ROOM STATUS: LIVE' : 'ROOM STATUS: WAITING FOR HOST'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                {currentSession ? `${currentSession.type} with ${recruiterName}` : `Senior Full Stack Mock Drill • Room: ${roomName}`}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10B981' }}>
                <FiWifi /> HD Video (14ms)
              </div>

              {connected && (
                <div style={{ padding: '0.4rem 1rem', borderRadius: '9999px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <FiClock /> {formatTimer(secondsElapsed)}
                </div>
              )}
            </div>
          </div>

          {/* Video Grid */}
          <div className="student-video-grid" style={{ minHeight: '380px', borderRadius: '16px', overflow: 'hidden', background: '#0F172A', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {connected ? (
              <img
                src={currentSession?.recruiter_avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"}
                alt="Recruiter Feed"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>
                <FiVideoOff size={44} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h4 style={{ fontSize: '1.1rem', color: '#FFF', margin: '0 0 0.4rem' }}>
                  {currentSession ? `Scheduled: ${currentSession.date}` : 'Waiting Room Active'}
                </h4>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Click "Join Room" to start your scheduled interview with {recruiterName}.</p>
              </div>
            )}

            {/* Candidate PIP Feed */}
            {connected && (
              <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '140px', height: '100px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #10B981', background: '#1E293B' }}>
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'You')}&background=4f46e5&color=fff`}
                  alt="Candidate PIP"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          {/* Meeting Controls */}
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMicOn(!micOn)}
              className="btn-secondary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: micOn ? '#FFF' : '#EF4444' }}
            >
              {micOn ? <FiMic /> : <FiMicOff />} {micOn ? 'Mute' : 'Unmute'}
            </button>
            <button
              onClick={() => setCameraOn(!cameraOn)}
              className="btn-secondary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: cameraOn ? '#FFF' : '#EF4444' }}
            >
              {cameraOn ? <FiVideo /> : <FiVideoOff />} {cameraOn ? 'Stop Video' : 'Start Video'}
            </button>

            {!connected ? (
              <button
                onClick={handleJoinMeeting}
                style={{ padding: '0.6rem 1.75rem', borderRadius: '9999px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                🎥 Join Room
              </button>
            ) : (
              <button
                onClick={handleLeaveMeeting}
                style={{ padding: '0.6rem 1.75rem', borderRadius: '9999px', border: 'none', background: '#EF4444', color: '#FFF', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FiPhoneOff /> Leave Meeting
              </button>
            )}
          </div>
        </div>

        {/* ── Right Column: Room Details & Participants List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.85rem', letterSpacing: '0.05em' }}>
              ROOM DETAILS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
              <div><span style={{ color: 'var(--color-muted)' }}>Meeting ID:</span> <strong>{meetingId}</strong></div>
              <div><span style={{ color: 'var(--color-muted)' }}>Room Name:</span> <strong>{roomName}</strong></div>
              <div><span style={{ color: 'var(--color-muted)' }}>Status:</span> <strong style={{ color: currentSession ? '#10B981' : '#F59E0B' }}>{currentSession ? 'CONFIRMED' : 'WAITING'}</strong></div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.85rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiUsers /> PARTICIPANTS (2)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={currentSession?.recruiter_avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"}
                  alt="Recruiter"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{recruiterName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{currentSession?.company || 'Recruiter (Host)'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'You')}&background=4f46e5&color=fff`} alt="Candidate" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Alex Johnson'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Candidate (You)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Feedback Modal ── */}
      {showFeedbackModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11, 21, 51, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '2rem', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Submit Interview Feedback
              </h3>
              <button onClick={() => setShowFeedbackModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
            </div>

            <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Overall Rating</label>
                  <select value={overallRating} onChange={(e) => setOverallRating(Number(e.target.value))} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>⭐ {r} / 5</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Technical Rating</label>
                  <select value={technicalRating} onChange={(e) => setTechnicalRating(Number(e.target.value))} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>⭐ {r} / 5</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Communication</label>
                  <select value={communicationRating} onChange={(e) => setCommunicationRating(Number(e.target.value))} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>⭐ {r} / 5</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Behaviour</label>
                  <select value={behaviourRating} onChange={(e) => setBehaviourRating(Number(e.target.value))} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>⭐ {r} / 5</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.3rem' }}>Comments & Notes</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share feedback about technical depth, communication, and overall experience..."
                  rows={3}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.3rem' }}>Recommendation</label>
                <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="Possible Hire">Possible Hire</option>
                  <option value="Needs Practice">Needs Practice</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymousCheck">Submit feedback anonymously</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={submittingFeedback} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="btn btn-outline" style={{ padding: '0.75rem' }}>
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentLiveInterviewRoom;
