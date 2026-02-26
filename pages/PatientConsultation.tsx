
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth, useChat, useAppointments } from '../contexts/index';

const PatientConsultation: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage } = useChat();
  const { appointments } = useAppointments();
  
  const [chatInput, setChatInput] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const myAppointments = useMemo(() => 
    appointments.filter(a => (a as any).patientUsername === user?.username),
    [appointments, user]
  );

  const myDoctors = useMemo(() => {
    const docNames = Array.from(new Set(myAppointments.map(a => a.doctorName)));
    return docNames.map(name => {
      const app = myAppointments.find(a => a.doctorName === name);
      return { 
        name, 
        status: app?.status || 'Confirmed',
        date: app?.date 
      };
    });
  }, [myAppointments]);

  useEffect(() => {
    if (!selectedDoctor && myDoctors.length > 0) {
      setSelectedDoctor(myDoctors[0].name);
    }
  }, [myDoctors, selectedDoctor]);

  const selectedDoctorInfo = myDoctors.find(d => d.name === selectedDoctor);

  const chatHistory = messages.filter(m => 
    (m.senderName === user?.fullName && m.recipientName === selectedDoctor) ||
    (m.senderName === selectedDoctor && m.recipientName === user?.fullName)
  );

  const handleSend = () => {
    if (!chatInput.trim() || !selectedDoctor) return;
    sendMessage(selectedDoctor, chatInput);
    setChatInput('');
  };

  return (
    <div style={{ animation: 'popIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Consultation Chat</h1>
        <p style={{ color: 'var(--text-muted)' }}>Secure messaging with your confirmed healthcare specialists.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '320px 1fr', 
        gap: '1.5rem', 
        height: 'calc(100vh - 250px)',
        minHeight: '500px'
      }}>
        {/* Sidebar: Doctor List */}
        <div className="card" style={{ padding: 0, overflowY: 'auto', border: '1px solid var(--border-color)' }}>
          <div style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid var(--border-color)', 
            background: 'var(--bg-main)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <h3 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Clinical Inbox</h3>
          </div>
          {myDoctors.length > 0 ? myDoctors.map(doc => (
            <div 
              key={doc.name} 
              onClick={() => setSelectedDoctor(doc.name)}
              style={{ 
                padding: '1.5rem', 
                borderBottom: '1px solid var(--border-color)', 
                cursor: 'pointer', 
                background: selectedDoctor === doc.name ? 'var(--primary-glow)' : 'transparent', 
                borderLeft: selectedDoctor === doc.name ? '4px solid var(--primary)' : '4px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{doc.name}</div>
              <div style={{ 
                fontSize: '0.7rem', 
                marginTop: '0.25rem',
                fontWeight: 700,
                color: doc.status === 'Accepted' || doc.status === 'Confirmed' ? 'var(--success)' : 'var(--warning)' 
              }}>
                 {doc.status === 'Confirmed' ? 'Awaiting Provider Review' : doc.status}
              </div>
            </div>
          )) : (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No active consultations found. Book a doctor to start chatting.
            </div>
          )}
        </div>

        {/* Main: Chat Window */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {selectedDoctor ? (
            <>
              <div style={{ 
                padding: '1.25rem 2rem', 
                borderBottom: '1px solid var(--border-color)', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-card)'
              }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{selectedDoctor}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Schedule: {selectedDoctorInfo?.date}</div>
                </div>
                <span className="status status-success" style={{ fontSize: '0.65rem' }}>Secure Line</span>
              </div>

              {/* Chat Body */}
              <div style={{ 
                flex: 1, 
                padding: '2rem', 
                overflowY: 'auto', 
                background: 'var(--bg-main)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.25rem' 
              }}>
                {chatHistory.length > 0 ? chatHistory.map(m => (
                  <div key={m.id} style={{ alignSelf: m.senderName === user?.fullName ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <div style={{ 
                      background: m.senderName === user?.fullName ? 'var(--primary)' : 'var(--bg-card)', 
                      color: m.senderName === user?.fullName ? 'white' : 'var(--text-main)', 
                      padding: '1rem 1.25rem', 
                      borderRadius: '18px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: m.senderName === user?.fullName ? 'none' : '1px solid var(--border-color)',
                      fontWeight: 500,
                      lineHeight: '1.5'
                    }}>
                      {m.text}
                    </div>
                    <div style={{ 
                      fontSize: '0.65rem', 
                      color: 'var(--text-muted)', 
                      marginTop: '0.4rem', 
                      textAlign: m.senderName === user?.fullName ? 'right' : 'left',
                      fontWeight: 600
                    }}>
                      {m.timestamp}
                    </div>
                  </div>
                )) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.6 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div style={{ 
                padding: '1.5rem 2rem', 
                borderTop: '1px solid var(--border-color)', 
                background: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    placeholder={selectedDoctorInfo?.status === 'Confirmed' ? "Waiting for doctor to accept..." : "Type your message..."} 
                    disabled={selectedDoctorInfo?.status === 'Confirmed'}
                    style={{ 
                      marginBottom: 0, 
                      flex: 1, 
                      height: '56px',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      padding: '0 1.5rem',
                      borderRadius: '14px'
                    }} 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={selectedDoctorInfo?.status === 'Confirmed' || !chatInput.trim()}
                    style={{ height: '56px', padding: '0 2rem', borderRadius: '14px' }}
                  >
                    Send
                  </button>
                </div>
                {selectedDoctorInfo?.status === 'Confirmed' && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--danger)', 
                    marginTop: '0.75rem', 
                    fontWeight: 700,
                    textAlign: 'center',
                    background: 'var(--danger-glow)',
                    padding: '0.5rem',
                    borderRadius: '8px'
                  }}>
                    ⚠️ Consultation room unlocks once the doctor reviews and accepts your request.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '2rem', opacity: 0.1 }}>📩</div>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Select a Consultation</h3>
              <p>Choose a specialist from your clinical inbox to view your medical chat history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientConsultation;
