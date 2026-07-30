import React, { useState, useEffect, useRef } from 'react';
import {
  FiVideo, FiMic, FiMicOff, FiVideoOff, FiClock,
  FiWifi, FiPhoneOff, FiUsers, FiMonitor, FiCheckCircle
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './liveInterviewRoom.css';

export const StudentLiveInterviewRoom = () => {
  const { user } = useAuth();

  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const roomName = 'skilltrack_mock_room_402';
  const meetingId = 'mtg_889214092';
  const accessToken = 'livekit_jwt_tok_99182a88...';

  const timerRef = useRef(null);

  const handleJoinMeeting = () => {
    setConnected(true);
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    toast.success('🎥 Joined LiveKit Interview Room!');
  };

  const handleLeaveMeeting = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setConnected(false);
    setSecondsElapsed(0);
    toast.success('Left interview room');
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>

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
                  {connected ? 'ROOM STATUS: LIVE' : 'ROOM STATUS: WAITING'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Senior Full Stack Mock Drill • Room: {roomName}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10B981' }}>
                <FiWifi /> Excellent (14ms)
              </div>

              {connected && (
                <div style={{ padding: '0.4rem 1rem', borderRadius: '9999px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <FiClock /> {formatTimer(secondsElapsed)}
                </div>
              )}
            </div>
          </div>

          {/* Video Grid */}
          <div className="student-video-grid">
            {/* Recruiter Video Feed */}
            <div className="video-feed-card">
              {connected ? (
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" alt="Recruiter Feed" />
              ) : (
                <div style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
                  <FiVideoOff size={32} />
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Waiting Room active...</div>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}>
                Sarah Jenkins (Recruiter)
              </div>
            </div>

            {/* Student (You) Video Feed */}
            <div className="video-feed-card">
              {cameraOn && connected ? (
                <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'} alt="You" />
              ) : (
                <div style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
                  <FiVideoOff size={32} />
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{connected ? 'Camera Off' : 'Camera Preview Off'}</div>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}>
                You ({user?.name || 'Student Candidate'})
              </div>
            </div>

            {/* Floating Control Bar */}
            <div className="floating-controls-bar">
              <button
                onClick={() => setMicOn(!micOn)}
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: micOn ? 'rgba(255,255,255,0.15)' : '#EF4444', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micOn ? <FiMic /> : <FiMicOff />}
              </button>

              <button
                onClick={() => setCameraOn(!cameraOn)}
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: cameraOn ? 'rgba(255,255,255,0.15)' : '#EF4444', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title={cameraOn ? 'Camera Off' : 'Camera On'}
              >
                {cameraOn ? <FiVideo /> : <FiVideoOff />}
              </button>

              <button
                onClick={() => { setScreenSharing(!screenSharing); toast.success(screenSharing ? 'Stopped screen share' : 'Started screen share'); }}
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: screenSharing ? '#10B981' : 'rgba(255,255,255,0.15)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Screen Share Placeholder"
              >
                <FiMonitor />
              </button>

              {!connected ? (
                <button
                  onClick={handleJoinMeeting}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  🎥 Join Room
                </button>
              ) : (
                <button
                  onClick={handleLeaveMeeting}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', background: '#EF4444', color: '#FFF', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FiPhoneOff /> Leave Meeting
                </button>
              )}
            </div>
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
              <div><span style={{ color: 'var(--color-muted)' }}>Token:</span> <code style={{ fontSize: '0.72rem', color: '#10B981' }}>{accessToken}</code></div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.85rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiUsers /> PARTICIPANTS (2)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" alt="Recruiter" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Sarah Jenkins</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Recruiter (Host)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} alt="Candidate" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Alex Johnson'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Candidate (You)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentLiveInterviewRoom;
