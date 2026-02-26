import React, { useState } from 'react';
import { useAppointments, useAuth } from '../contexts/index';
import { Link } from 'react-router-dom';

const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const { appointments, updateAppointment, cancelAppointment } = useAppointments();
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState('');
  
  const myAppointments = appointments.filter(app => (app as any).patientUsername === user?.username);

  const handleRescheduleSubmit = (id: number) => {
    if (!newDate) return;
    updateAppointment(id, { date: newDate, status: 'Rescheduled' });
    setReschedulingId(null);
    setNewDate('');
  };

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

  return (
    <div style={{ animation: 'popIn 0.3s ease-out' }}>
      <style>{`
        .appointment-row {
          position: relative;
          transition: background 0.2s ease;
        }
        .appointment-row:hover {
          background: var(--primary-glow) !important;
        }
        .tooltip {
          visibility: hidden;
          position: absolute;
          background: #1e293b;
          color: #fff;
          text-align: left;
          padding: 1rem;
          border-radius: 12px;
          z-index: 100;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          width: 220px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: opacity 0.3s, transform 0.3s;
          pointer-events: none;
          border: 1px solid var(--primary);
        }
        .tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: var(--primary) transparent transparent transparent;
        }
        .appointment-row:hover .tooltip {
          visibility: visible;
          opacity: 1;
          transform: translateX(-50%) translateY(-10px);
        }
        .tooltip-title {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }
        .tooltip-val {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
      `}</style>

      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1>My Medical Bookings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track and manage your scheduled clinical consultations.</p>
      </header>

      <div className="card" style={{ padding: 0, borderRadius: '24px', overflow: 'visible' }}>
        <table style={{ overflow: 'visible' }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Date & Time</th>
              <th>Specialist</th>
              <th>Patient Profile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myAppointments.map(app => {
              const isFinalized = app.status === 'Confirmed' || app.status === 'Accepted' || app.status === 'Completed' || app.status === 'Cancelled';
              return (
                <tr key={app.id} className="appointment-row">
                  <td>
                    <span className={`status ${getStatusClass(app.status)}`}>{app.status}</span>
                    <div className="tooltip">
                      <div className="tooltip-title">Patient Location</div>
                      <div className="tooltip-val">{app.city || 'City not specified'}</div>
                      <div className="tooltip-title">Patient Age</div>
                      <div className="tooltip-val">{app.patientAge} years old</div>
                      <div className="tooltip-title">Full Schedule</div>
                      <div className="tooltip-val">{app.date} at {app.time}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Secure Video Link will be sent 15m before start.</div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    <div>{app.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>{app.time}</div>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--name-highlight)' }}>{app.doctorName}</td>
                  <td>
                    <div className="patient-identity-cell" style={{ flexDirection: 'row', justifyContent: 'center', gap: '0.5rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', background: 'var(--bg-main)', color: 'var(--text-muted)' }}>{app.patientName.charAt(0)}</div>
                      <div>
                          <div style={{ fontWeight: 800, color: 'var(--name-highlight)' }}>{app.patientName}</div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>{app.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      {!isFinalized && (
                        <>
                          {reschedulingId === app.id ? (
                            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                              <input 
                                type="date" 
                                value={newDate} 
                                onChange={e => setNewDate(e.target.value)} 
                                style={{ padding: '0.4rem', borderRadius: '8px', marginBottom: 0, width: '130px', fontSize: '0.8rem' }} 
                              />
                              <button onClick={() => handleRescheduleSubmit(app.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Ok</button>
                              <button className="secondary" onClick={() => setReschedulingId(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>X</button>
                            </div>
                          ) : (
                            <button className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setReschedulingId(app.id)}>Reschedule</button>
                          )}
                          <button 
                            className="secondary" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger-glow)' }} 
                            onClick={() => cancelAppointment(app.id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(app.status === 'Accepted' || app.status === 'Confirmed') && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>Appointment Locked</span>
                      )}
                      {app.status === 'Cancelled' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Booking Voided</span>
                      )}
                      {app.status === 'Completed' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>Fulfilled</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {myAppointments.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '4rem', color: 'var(--text-muted)', textAlign: 'center' }}>No appointments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAppointments;
