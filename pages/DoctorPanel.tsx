import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useAppointments, useChat, useHealthRecords } from '../contexts/index';
import { Appointment, UserRole, HealthRecord } from '../types';

const DoctorPanel: React.FC = () => {
  const { user, loginAs } = useAuth();
  const { appointments, updateAppointment, cancelAppointment } = useAppointments();
  const { messages, sendMessage } = useChat();
  const { records: contextRecords } = useHealthRecords();
  const location = useLocation();
  const navigate = useNavigate();

  const [activePatientChat, setActivePatientChat] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState('');
  const [viewingRecord, setViewingRecord] = useState<HealthRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false);
  const [pendingReschedule, setPendingReschedule] = useState<{id: number, date: string} | null>(null);
  const [viewingDoctorProfile, setViewingDoctorProfile] = useState<any | null>(null);

  const NETWORK_DOCTORS = [
    { 
      name: 'Dr. Gokul Nair', 
      username: 'doctor1', 
      specialty: 'Senior Consultant',
      experience: '15 years',
      bio: 'Expert in internal medicine and clinical diagnostics. Passionate about patient-centric care and medical innovation.',
      education: 'MD - Internal Medicine, AIIMS Delhi',
      languages: ['English', 'Hindi', 'Tamil']
    },
    { 
      name: 'Dr. Pooja Sharma', 
      username: 'doctor2', 
      specialty: 'Cardiologist',
      experience: '12 years',
      bio: 'Specializing in interventional cardiology and heart failure management. Committed to advancing cardiovascular health.',
      education: 'DM - Cardiology, CMC Vellore',
      languages: ['English', 'Hindi', 'Marathi']
    },
    { 
      name: 'Dr. Vikram Malhotra', 
      username: 'doctor3', 
      specialty: 'Neurologist',
      experience: '18 years',
      bio: 'Focusing on neurodegenerative disorders and stroke management. Pioneer in minimally invasive neurological procedures.',
      education: 'MCh - Neurosurgery, NIMHANS',
      languages: ['English', 'Hindi', 'Punjabi']
    },
    { 
      name: 'Dr. Anjali Gupta', 
      username: 'doctor4', 
      specialty: 'Pediatrician',
      experience: '10 years',
      bio: 'Dedicated to child health and development. Expert in pediatric infectious diseases and neonatal care.',
      education: 'MD - Pediatrics, Grant Medical College',
      languages: ['English', 'Hindi', 'Gujarati']
    },
    { 
      name: 'Dr. Rajesh Khanna', 
      username: 'doctor5', 
      specialty: 'Orthopedic Surgeon',
      experience: '20 years',
      bio: 'Specialist in joint replacement and sports medicine. Expert in robotic-assisted surgeries.',
      education: 'MS - Orthopedics, KMC Manipal',
      languages: ['English', 'Hindi', 'Kannada']
    },
    { 
      name: 'Dr. Sneha Reddy', 
      username: 'doctor6', 
      specialty: 'Dermatologist',
      experience: '8 years',
      bio: 'Expert in clinical and aesthetic dermatology. Specialized in laser treatments and skin rejuvenation.',
      education: 'MD - Dermatology, Osmania Medical College',
      languages: ['English', 'Telugu', 'Hindi']
    },
    { 
      name: 'Dr. Amit Shah', 
      username: 'doctor7', 
      specialty: 'Oncologist',
      experience: '14 years',
      bio: 'Dedicated to cancer research and personalized treatment plans. Expert in chemotherapy and immunotherapy.',
      education: 'DM - Oncology, Tata Memorial Hospital',
      languages: ['English', 'Hindi', 'Gujarati']
    },
    { 
      name: 'Dr. Meera Iyer', 
      username: 'doctor8', 
      specialty: 'Endocrinologist',
      experience: '11 years',
      bio: 'Specialized in diabetes management and hormonal disorders. Focused on metabolic health and nutrition.',
      education: 'MD - Endocrinology, Madras Medical College',
      languages: ['English', 'Tamil', 'Hindi']
    },
    { 
      name: 'Dr. Sameer Deshmukh', 
      username: 'doctor9', 
      specialty: 'Psychiatrist',
      experience: '13 years',
      bio: 'Expert in mental health and behavioral therapy. Specialized in anxiety and depression management.',
      education: 'MD - Psychiatry, NIMHANS',
      languages: ['English', 'Marathi', 'Hindi']
    },
    { 
      name: 'Dr. Kavita Rao', 
      username: 'doctor10', 
      specialty: 'Gastroenterologist',
      experience: '16 years',
      bio: 'Specialized in digestive health and liver diseases. Expert in advanced endoscopic procedures.',
      education: 'DM - Gastroenterology, AIIMS Delhi',
      languages: ['English', 'Hindi', 'Telugu']
    },
  ];

  const currentPath = location.pathname;

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'var(--color-admin)';
      case 'doctor': return 'var(--color-doctor)';
      case 'patient': return 'var(--color-patient)';
      default: return 'var(--primary)';
    }
  };

  const myAppointments = useMemo(() => 
    appointments.filter(app => app.doctorName === user?.fullName),
    [appointments, user]
  );

  const filterCounts = useMemo(() => {
    const c = {
      All: myAppointments.length,
      Pending: myAppointments.filter(a => a.status === 'Pending').length,
      Accepted: myAppointments.filter(a => a.status === 'Accepted' || a.status === 'Confirmed').length,
      Rescheduled: myAppointments.filter(a => a.status === 'Rescheduled').length,
      Cancelled: myAppointments.filter(a => a.status === 'Cancelled').length,
      Completed: myAppointments.filter(a => a.status === 'Completed').length,
    };
    return c;
  }, [myAppointments]);

  const filteredAppointments = useMemo(() => {
    let filtered = myAppointments;
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(app => {
        if (statusFilter === 'Accepted') return app.status === 'Accepted' || app.status === 'Confirmed';
        return app.status === statusFilter;
      });
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(app => 
        app.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [myAppointments, statusFilter, searchTerm]);

  const pendingRequests = useMemo(() => 
    myAppointments.filter(a => a.status === 'Pending'),
    [myAppointments]
  );

  const acceptedAppointments = useMemo(() => 
    myAppointments.filter(a => a.status === 'Accepted' || a.status === 'Confirmed'),
    [myAppointments]
  );

  const myPatients = useMemo(() => {
    const patientsMap = new Map();
    myAppointments.forEach(app => {
      if (!patientsMap.has(app.patientUsername)) {
        patientsMap.set(app.patientUsername, {
          username: app.patientUsername,
          name: app.patientName,
          age: app.patientAge,
          city: app.city,
          lastVisit: app.date,
          status: 'Active'
        });
      }
    });
    return Array.from(patientsMap.values()) as Array<{
      username: string;
      name: string;
      age: number;
      city: string;
      lastVisit: string;
      status: string;
    }>;
  }, [myAppointments]);

  const handleAccept = (app: Appointment) => {
    updateAppointment(app.id, { status: 'Accepted' });
    sendMessage(app.patientName, `Hello ${app.patientName}, I have accepted your appointment request for ${app.date} at ${app.time}. Please share your current symptoms or any concerns you would like to discuss during our consultation.`);
    navigate('/doctor/consult');
    setActivePatientChat(app.patientName);
  };

  const handleReschedule = (id: number) => {
    if (!newDate) return;
    setPendingReschedule({ id, date: newDate });
    setShowRescheduleConfirm(true);
  };

  const confirmReschedule = () => {
    if (!pendingReschedule) return;
    updateAppointment(pendingReschedule.id, { date: pendingReschedule.date, status: 'Rescheduled' });
    setReschedulingId(null);
    setNewDate('');
    setPendingReschedule(null);
    setShowRescheduleConfirm(false);
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !activePatientChat) return;
    sendMessage(activePatientChat, chatInput);
    setChatInput('');
  };

  const handleDoctorConsultRequest = (doctorName: string) => {
    sendMessage(doctorName, `[CONSULTATION REQUEST] Hello ${doctorName}, I would like to request a professional consultation regarding a complex case. Please let me know when you are available for a brief discussion.`);
    setActivePatientChat(doctorName);
    navigate('/doctor/consult');
  };

  const handleDoctorMessage = (doctorName: string) => {
    setActivePatientChat(doctorName);
    navigate('/doctor/consult');
  };

  const handleDownload = (record: HealthRecord) => {
    const blob = new Blob([
      `MediConnect Official Health Record\n`,
      `==============================\n`,
      `Title: ${record.title}\n`,
      `Type: ${record.type}\n`,
      `Date: ${record.date}\n`,
      `Issuing Doctor: ${record.doctorName}\n`,
      `Patient ID: ${record.patientUsername}\n\n`,
      `Clinical Findings & Notes:\n`,
      `--------------------------\n`,
      `${record.content}\n\n`,
      `Status: ${record.status}\n`,
      `This is a computer-generated report and is part of the integrated clinical archive.\n`,
      `MediConnect Health Network © 2024`
    ], { type: 'text/plain' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title.replace(/\s+/g, '_')}_${record.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const currentChatHistory = useMemo(() => {
    if (!activePatientChat) return [];
    return messages.filter(m => 
      (m.senderName === user?.fullName && m.recipientName === activePatientChat) ||
      (m.senderName === activePatientChat && m.recipientName === user?.fullName)
    );
  }, [messages, user, activePatientChat]);

  const renderDashboard = () => (
    <div style={{ animation: 'popIn 0.3s ease-out' }}>
      {pendingRequests.length > 0 && (
        <div style={{ 
          background: 'var(--danger)', color: 'white', padding: '1.25rem 2rem', borderRadius: '20px', 
          marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 10px 20px var(--danger-glow)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🔔</span>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{pendingRequests.length} New Booking Requests</div>
              <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>Patients are waiting for your confirmation.</div>
            </div>
          </div>
          <button 
            style={{ background: 'white', color: 'var(--danger)', fontWeight: 800, padding: '0.75rem 1.5rem', borderRadius: '12px' }} 
            onClick={() => navigate('/doctor/schedule')}
          >
            Review Now
          </button>
        </div>
      )}

      <div className="banner" style={{ textAlign: 'center', borderRadius: '24px' }}>
        <h1 style={{ color: 'white', margin: 0 }}>Dr. {user?.fullName.replace('Dr. ', '')}'s Portal</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0.75rem', fontSize: '1.1rem' }}>
          Clinical Management & Diagnostics Hub
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="card" style={{ borderLeft: '6px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>🏥 Practice Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Specialty</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{user?.specialty || 'General Practitioner'}</div>
             </div>
             <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clinic Address</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.clinicAddress || 'Address not set'}</div>
             </div>
             <button className="secondary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => navigate('/doctor/profile')}>Update Profile</button>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Clinical Data Vault</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => navigate('/doctor/records')}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SYSTEM RECORDS</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{contextRecords.length}</div>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--primary-glow)', border: '1px solid var(--primary)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>AWAITING ACTION</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{pendingRequests.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Accepted':
      case 'Confirmed':
      case 'Completed':
        return 'status-success';
      case 'Pending':
      case 'Rescheduled':
        return 'status-warning';
      case 'Cancelled':
        return 'status-danger';
      default:
        return 'status-info';
    }
  };

  const renderSchedule = () => (
    <div className="card" style={{ padding: 0, borderRadius: '24px', overflow: 'visible' }}>
      <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Clinical Schedule Hub</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your incoming patient requests and confirmed appointments.</p>
        
        {/* Search Bar */}
        <div style={{ maxWidth: '500px', margin: '0 auto 2rem', position: 'relative' }}>
          <input 
            placeholder="Search patient name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ marginBottom: 0, paddingLeft: '3rem', borderRadius: '14px', height: '54px' }}
          />
          <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(filterCounts).map(([status, count]) => (
            <button
              key={status}
              className="secondary"
              onClick={() => setStatusFilter(status)}
              style={{
                fontSize: '0.75rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                background: statusFilter === status ? 'var(--primary)' : 'var(--bg-card)',
                color: statusFilter === status ? 'white' : 'var(--text-muted)',
                borderColor: statusFilter === status ? 'var(--primary)' : 'var(--border-color)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {status}
              <span style={{ 
                background: statusFilter === status ? 'rgba(255,255,255,0.2)' : 'var(--bg-main)', 
                padding: '2px 8px', 
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <table style={{ margin: 0 }}>
        <thead>
          <tr>
            <th>Patient Identity</th>
            <th>Requested Slot</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map(app => {
            const isFinalized = app.status === 'Confirmed' || app.status === 'Accepted' || app.status === 'Completed' || app.status === 'Cancelled';
            return (
              <tr key={app.id}>
                <td>
                  <div className="patient-identity-cell" style={{ flexDirection: 'row', justifyContent: 'flex-start', textAlign: 'left', gap: '1rem', paddingLeft: '2rem' }}>
                    <div className="avatar" style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', width: '36px', height: '36px' }}>{app.patientName.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--name-highlight)' }}>{app.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age: {app.patientAge} | City: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{app.city || 'N/A'}</span></div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Contact: {app.patientPhone || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 800 }}>
                  <div>{app.date}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>{app.time}</div>
                </td>
                <td>
                  <span className={`status ${getStatusClass(app.status)}`}>{app.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {app.status === 'Pending' && (
                      <button style={{ background: 'var(--success)', padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '10px' }} onClick={() => handleAccept(app)}>Accept</button>
                    )}
                    
                    {!isFinalized && (
                      <>
                        {reschedulingId === app.id ? (
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ padding: '0.4rem', borderRadius: '8px', marginBottom: 0, width: '130px', fontSize: '0.8rem' }} />
                            <button onClick={() => handleReschedule(app.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Update</button>
                            <button className="secondary" onClick={() => setReschedulingId(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>X</button>
                          </div>
                        ) : (
                          <button className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '10px' }} onClick={() => setReschedulingId(app.id)}>Reschedule</button>
                        )}
                        
                        <button 
                          className="secondary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '10px', color: 'var(--danger)', borderColor: 'var(--danger-glow)' }} 
                          onClick={() => cancelAppointment(app.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {(app.status === 'Accepted' || app.status === 'Confirmed') && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>Ready for Session</span>
                    )}
                    {app.status === 'Cancelled' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Appointment Voided</span>
                    )}
                    {app.status === 'Completed' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>Clinical Success</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {filteredAppointments.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No appointments found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderConsultations = () => (
    <div style={{ height: 'calc(100vh - 200px)', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
      <div className="card" style={{ padding: 0, overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', background: 'var(--bg-main)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Consultation List</h3>
        </div>
        {/* Combine patient appointments and doctor network contacts who have messages */}
        {(() => {
          const chatPartners = new Set<string>();
          messages.forEach(m => {
            if (m.senderName === user?.fullName) chatPartners.add(m.recipientName);
            if (m.recipientName === user?.fullName) chatPartners.add(m.senderName);
          });

          const partners = Array.from(chatPartners).filter(name => name !== user?.fullName);
          
          return partners.length > 0 ? partners.map(name => {
            const isDoctor = name.startsWith('Dr.');
            return (
              <div 
                key={name} 
                onClick={() => setActivePatientChat(name)}
                style={{ 
                  padding: '1.5rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                  background: activePatientChat === name ? 'var(--primary-glow)' : 'transparent',
                  borderLeft: activePatientChat === name ? '4px solid var(--primary)' : '4px solid transparent'
                }}
              >
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {name}
                  {isDoctor && <span style={{ fontSize: '0.6rem', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>MD</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {isDoctor ? 'Professional Collaboration' : 'Patient Consultation'}
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No active consultations.</div>
          );
        })()}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {activePatientChat ? (
          <>
            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-main)' }}>
              <h3 style={{ margin: 0 }}>{activePatientChat.startsWith('Dr.') ? 'Collaborating with' : 'Consulting with'} {activePatientChat}</h3>
            </div>
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {currentChatHistory.map(m => (
                <div key={m.id} style={{ alignSelf: m.senderName === user?.fullName ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                  <div style={{ 
                    background: m.senderName === user?.fullName ? 'var(--primary)' : 'var(--bg-card)',
                    color: m.senderName === user?.fullName ? 'white' : 'var(--text-main)',
                    padding: '1rem 1.25rem', borderRadius: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: m.senderName === user?.fullName ? 'right' : 'left', fontWeight: 600 }}>{m.timestamp}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
              <input 
                placeholder={activePatientChat.startsWith('Dr.') ? "Type your professional query..." : "Type your medical findings..."}
                style={{ marginBottom: 0, height: '54px', flex: 1 }}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              />
              <button onClick={handleSendChat} style={{ width: '100px' }}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.1 }}>💬</div>
            <p>Select a contact to start clinical messaging.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderNetwork = () => (
    <div style={{ animation: 'popIn 0.3s ease-out' }}>
      <div className="banner" style={{ textAlign: 'center', borderRadius: '24px', marginBottom: '3rem' }}>
        <h1 style={{ color: 'white', margin: 0 }}>Clinical Network</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0.75rem', fontSize: '1.1rem' }}>
          Connect and collaborate with other medical professionals.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {NETWORK_DOCTORS.map(doc => (
          <div key={doc.username} className="card" style={{ textAlign: 'center', border: doc.name === user?.fullName ? '2px solid var(--primary)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div className="avatar" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              {doc.name.charAt(4)}
            </div>
            <h3 style={{ margin: '0 0 0.5rem' }}>{doc.name}</h3>
            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '1rem' }}>{doc.specialty}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{doc.experience} Experience</div>
            
            <div style={{ marginTop: 'auto', display: 'grid', gap: '0.75rem' }}>
              <button className="secondary" style={{ width: '100%', borderRadius: '12px' }} onClick={() => setViewingDoctorProfile(doc)}>
                View Profile
              </button>
              
              {doc.name !== user?.fullName && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button className="secondary" style={{ borderRadius: '12px', fontSize: '0.75rem' }} onClick={() => handleDoctorMessage(doc.name)}>
                      Message
                    </button>
                    <button style={{ borderRadius: '12px', fontSize: '0.75rem' }} onClick={() => handleDoctorConsultRequest(doc.name)}>
                      Consult
                    </button>
                  </div>
                  <button 
                    className="secondary"
                    style={{ width: '100%', borderRadius: '12px', background: 'var(--bg-main)', borderStyle: 'dashed' }} 
                    onClick={() => loginAs(doc.name, doc.username, UserRole.DOCTOR)}
                  >
                    Switch Dashboard
                  </button>
                </>
              )}
              
              {doc.name === user?.fullName && (
                <div style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Current Dashboard
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'popIn 0.3s ease-out' }}>
      {currentPath === '/doctor' && renderDashboard()}
      {currentPath === '/doctor/schedule' && renderSchedule()}
      {currentPath === '/doctor/consult' && renderConsultations()}
      {currentPath === '/doctor/network' && renderNetwork()}
      {currentPath === '/doctor/records' && (
        <div className="card" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-main)' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Medical Records Archive</h2>
            <p style={{ color: 'var(--text-muted)' }}>Secure vault containing complete patient diagnostics.</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contextRecords.map(record => (
                  <tr key={record.id}>
                    <td style={{ fontWeight: 800 }}>{record.patientUsername}</td>
                    <td><span className="status status-info" style={{ fontSize: '0.65rem' }}>{record.type}</span></td>
                    <td style={{ fontWeight: 700 }}>{record.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{record.date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button onClick={() => setViewingRecord(record)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>View</button>
                        <button className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleDownload(record)}>📥</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {currentPath === '/doctor/patients' && (
        <div style={{ animation: 'popIn 0.3s ease-out' }}>
          <h2 style={{ marginBottom: '2.5rem', textAlign: 'center' }}>Clinical Patient Roster</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
             {myPatients.map(p => (
               <div key={p.username} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="patient-identity-cell" style={{ marginBottom: '1.5rem' }}>
                    <div className="avatar" style={{ width: '80px', height: '80px', background: getRoleColor('patient'), fontSize: '2rem', marginBottom: '1rem', border: 'none' }}>{p.name.charAt(0)}</div>
                    <div className="info-box">
                      <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{p.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Age: {p.age} | City: {p.city}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last Visit: {p.lastVisit}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button className="secondary" style={{ borderRadius: '12px' }} onClick={() => navigate('/doctor/records')}>View Records</button>
                    <button style={{ borderRadius: '12px' }} onClick={() => { setActivePatientChat(p.name); navigate('/doctor/consult'); }}>Message</button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {viewingRecord && (
        <div className="modal-overlay" onClick={() => setViewingRecord(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>{viewingRecord.title}</h2>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>CLINICAL DOCUMENT</span>
              </div>
              <button className="secondary" onClick={() => setViewingRecord(null)} style={{ borderRadius: '50%', width: '40px', height: '40px' }}>✕</button>
            </div>
            
            <div style={{ padding: '2rem', background: 'var(--bg-main)', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>PATIENT ID</div>
                  <div style={{ fontWeight: 800 }}>{viewingRecord.patientUsername}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>DATE</div>
                  <div style={{ fontWeight: 800 }}>{viewingRecord.date}</div>
                </div>
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {viewingRecord.content}
              </pre>
            </div>
            <button style={{ width: '100%', height: '56px' }} onClick={() => handleDownload(viewingRecord)}>Download Official Record</button>
          </div>
        </div>
      )}

      {viewingDoctorProfile && (
        <div className="modal-overlay" onClick={() => setViewingDoctorProfile(null)}>
          <div className="modal-content" style={{ maxWidth: '600px', padding: 0, borderRadius: '32px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '2.5rem', background: 'var(--primary)', color: 'white', textAlign: 'center' }}>
              <div className="avatar" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'white', color: 'var(--primary)', fontSize: '2rem' }}>
                {viewingDoctorProfile.name.charAt(4)}
              </div>
              <h2 style={{ margin: 0, color: 'white' }}>{viewingDoctorProfile.name}</h2>
              <div style={{ opacity: 0.9, fontWeight: 700, marginTop: '0.5rem' }}>{viewingDoctorProfile.specialty}</div>
            </div>
            
            <div style={{ padding: '2.5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Professional Bio</h4>
                <p style={{ lineHeight: '1.6', color: 'var(--text-main)', margin: 0 }}>{viewingDoctorProfile.bio}</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Education</h4>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{viewingDoctorProfile.education}</div>
                </div>
                <div>
                  <h4 style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Experience</h4>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{viewingDoctorProfile.experience}</div>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Languages</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {viewingDoctorProfile.languages.map((lang: string) => (
                    <span key={lang} style={{ background: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-color)' }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {viewingDoctorProfile.name !== user?.fullName && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button style={{ height: '56px', borderRadius: '16px' }} onClick={() => { handleDoctorConsultRequest(viewingDoctorProfile.name); setViewingDoctorProfile(null); }}>
                    Request Consultation
                  </button>
                  <button className="secondary" style={{ height: '56px', borderRadius: '16px' }} onClick={() => { handleDoctorMessage(viewingDoctorProfile.name); setViewingDoctorProfile(null); }}>
                    Send Message
                  </button>
                </div>
              )}
              
              <button className="secondary" style={{ width: '100%', marginTop: '1rem', borderRadius: '16px' }} onClick={() => setViewingDoctorProfile(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleConfirm && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📅</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Confirm Reschedule?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              Are you sure you want to reschedule this appointment to <strong>{pendingReschedule?.date}</strong>? 
              The patient will be notified of this change.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={confirmReschedule} 
                style={{ background: 'var(--primary)', color: 'white', fontWeight: 800, borderRadius: '14px', height: '54px' }}
              >
                Yes, Reschedule
              </button>
              <button 
                className="secondary" 
                onClick={() => { setShowRescheduleConfirm(false); setPendingReschedule(null); }} 
                style={{ fontWeight: 800, borderRadius: '14px', height: '54px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPanel;
