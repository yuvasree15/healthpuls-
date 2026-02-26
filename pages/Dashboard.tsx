import React from 'react';
import { useAuth, useChat, useAppointments, useNotifications } from '../contexts/index';
import { Link } from 'react-router-dom';
import { UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { messages } = useChat();
  const { appointments } = useAppointments();
  const { notifications, markAsRead } = useNotifications();

  // Get latest doctor message for this patient
  const lastDoctorMessage = [...messages]
    .reverse()
    .find(m => m.recipientName === user?.fullName && m.senderRole === UserRole.DOCTOR);

  // Get patient's appointments
  const myAppointments = appointments.filter(app => app.patientName === user?.fullName);

  // Notifications for this specific patient
  const myNotifications = notifications.filter(n => n.recipientUsername === user?.username);

  return (
    <div>
      <div className="banner">
        <h1 style={{ color: 'white', margin: 0, fontSize: '2.5rem' }}>Welcome back, {user?.fullName}!</h1>
        <p style={{ margin: '0.75rem 0 0', opacity: 0.9, fontSize: '1.1rem' }}>Manage your appointments, pharmacy orders, and medical records in one place.</p>
        <Link to="/doctors"><button style={{ background: 'white', color: 'var(--primary)', fontWeight: '800', marginTop: '1.5rem', padding: '0.75rem 1.5rem' }}>Book New Specialist</button></Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* NOTIFICATIONS SECTION */}
          <div className="card" style={{ borderLeft: '4.5px solid var(--primary)', background: 'var(--primary-glow)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔔</span> Notifications
            </h3>
            {myNotifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myNotifications.slice(0, 3).map(n => (
                  <div key={n.id} style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{n.title}</div>
                    <p style={{ margin: '0.1rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</p>
                    {!n.read && <button onClick={() => markAsRead(n.id)} style={{ padding: '2px 8px', fontSize: '0.6rem', marginTop: '4px' }}>Read</button>}
                  </div>
                ))}
                {myNotifications.length > 3 && <p style={{ fontSize: '0.75rem', textAlign: 'center', margin: 0, color: 'var(--primary)', fontWeight: '700' }}>View all in profile</p>}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No new updates right now.</p>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📅</span> Upcoming Appointments
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myAppointments.length > 0 ? (
                myAppointments.map(app => (
                  <div key={app.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: app.status === 'Rescheduled' ? 'var(--warning-glow)' : 'var(--bg-main)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, color: 'var(--name-highlight)' }}>{app.doctorName}</div>
                      <span className={`status ${app.status === 'Rescheduled' ? 'status-warning' : 'status-success'}`}>
                        {app.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Scheduled: <strong>{app.date}</strong> at <strong>{app.time}</strong>
                    </div>
                    {app.status === 'Rescheduled' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.5rem', fontWeight: 700 }}>
                        ⚠️ Dr. updated the time. Check notifications.
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>No upcoming appointments found.</p>
                  <Link to="/doctors"><button className="secondary" style={{ width: '100%' }}>Find a Doctor</button></Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ background: 'var(--success-glow)', border: '1px solid var(--success-glow)' }}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>💬</span> Consult Room</h3>
            {lastDoctorMessage ? (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--success)', margin: '0 0 1rem', fontWeight: '600' }}>
                  New message from <strong>{lastDoctorMessage.senderName}</strong>.
                </p>
                <Link to="/consultations"><button style={{ width: '100%', background: 'var(--success)' }}>Open Chat</button></Link>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--success)', margin: '0 0 1rem', fontWeight: '600' }}>Connect with your specialists in real-time.</p>
                <Link to="/consultations"><button className="secondary" style={{ width: '100%' }}>View All Chats</button></Link>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.25rem' }}>Wellness Tracker</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Health Score</span>
                  <span>88%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--success)', width: '88%' }}></div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weight</div>
                  <div style={{ fontWeight: 800 }}>68.4 kg</div>
                </div>
                <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Steps</div>
                  <div style={{ fontWeight: 800 }}>8,432</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;