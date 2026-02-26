import React, { useState } from 'react';
import { useAuth } from '../contexts/index';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = identifier.toLowerCase().trim();
    setError('');

    if (selectedRole === UserRole.DOCTOR) {
      if ((val === 'doctor1' || val === 'doctor@healthplus.com') && password === 'doctor123') {
        login('doctor1', UserRole.DOCTOR);
      } else if (val === 'doctor2' && password === 'doctor123') {
        login('doctor2', UserRole.DOCTOR);
      } else {
        setError('Invalid Doctor credentials');
      }
    } else if (selectedRole === UserRole.PATIENT) {
      if ((val === 'user1' || val === 'yuva@gmail.com') && password === 'user123') {
        login('user1', UserRole.PATIENT);
      } else {
        setError('Invalid Patient credentials');
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-main)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      transition: 'background 0.5s ease'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '3rem', 
        margin: '1rem', 
        border: '1px solid var(--border-color)',
        animation: 'popInElastic 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛡️</div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>MediConnect Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Secure health network authentication</p>
        </div>

        <div style={{ 
          display: 'flex', 
          background: 'var(--bg-main)', 
          padding: '0.4rem', 
          borderRadius: '14px', 
          marginBottom: '2rem', 
          border: '1px solid var(--border-color)',
          animation: 'fadeInUp 0.6s ease-out 0.3s both'
        }}>
          {(Object.values(UserRole)).map(role => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                setError('');
              }}
              style={{
                flex: 1,
                background: selectedRole === role ? 'var(--primary)' : 'transparent',
                color: selectedRole === role ? '#ffffff' : 'var(--text-muted)',
                padding: '0.75rem',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                borderRadius: '10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {role}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Identity / Username
          </label>
          <input 
            type="text" 
            placeholder={selectedRole === UserRole.DOCTOR ? 'doctor1' : 'user1'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{ marginBottom: '1.5rem', fontWeight: 600 }}
          />

          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Access Password
          </label>
          <input 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ fontWeight: 600 }}
          />

          {error && (
            <div style={{ 
              color: '#ffffff', 
              fontSize: '0.85rem', 
              marginTop: '1.25rem', 
              padding: '1rem', 
              background: 'var(--danger)', 
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              animation: 'popIn 0.3s ease'
            }}>
              {error}
            </div>
          )}

          <button type="submit" style={{ 
            width: '100%', 
            padding: '1.1rem', 
            fontSize: '1rem', 
            marginTop: '2rem', 
            borderRadius: '14px', 
            fontWeight: 800,
            animation: 'fadeInUp 0.6s ease-out 0.5s both'
          }}>
            Enter Portal Now
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1.25rem', 
          background: 'var(--bg-main)', 
          borderRadius: '16px', 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)', 
          border: '1px solid var(--border-color)', 
          lineHeight: '1.6',
          animation: 'fadeInUp 0.6s ease-out 0.6s both'
        }}>
          <strong style={{ color: 'var(--text-main)' }}>Sandbox Logins:</strong><br/>
          {selectedRole === 'patient' ? 'user1 / user123' : 'doctor1 / doctor123'}
        </div>
      </div>
    </div>
  );
};

export default Login;