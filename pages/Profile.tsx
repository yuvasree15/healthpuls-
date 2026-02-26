import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useTheme, useHealthRecords } from '../contexts/index';
import { UserRole } from '../types';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { records, addRecord } = useHealthRecords();
  
  const [viewMode, setViewMode] = useState<'profile' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '+91 6369151414',
    dob: user?.dob || '12-04-2005',
    address: user?.address || '24 ragavendra nagar,villivakkam,chennai-600049',
    bloodGroup: user?.bloodGroup || 'O+',
    age: user?.age || 20,
    emergencyContact: user?.emergencyContact || 'Srimathi (+91 9884980015)',
    allergies: user?.allergies || 'None',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '+91 6369151414',
        dob: user.dob || '12-04-2005',
        address: user.address || '24 ragavendra nagar,villivakkam,chennai-600049',
        bloodGroup: user.bloodGroup || 'O+',
        age: user.age || 20,
        emergencyContact: user.emergencyContact || 'Srimathi (+91 9884980015)',
        allergies: user.allergies || 'None',
      });
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      addRecord({
        title: file.name.split('.')[0],
        date: new Date().toISOString().split('T')[0],
        type: 'Report',
        doctorName: 'Self Uploaded',
        patientUsername: user.username,
        content: `Uploaded file: ${file.name}. Size: ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
      });
      alert(`Report "${file.name}" uploaded successfully and added to your medical records.`);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: isEditing ? 'var(--bg-card)' : 'var(--bg-main)',
    border: isEditing ? '1px solid var(--primary)' : '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    width: '100%',
    marginBottom: 0,
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.5rem'
  };

  const myRecords = records.filter(r => r.patientUsername === user?.username);

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Account & Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage your personal data and system preferences</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button 
            className="secondary" 
            style={{ 
              background: viewMode === 'profile' ? 'var(--primary)' : 'transparent', 
              color: viewMode === 'profile' ? 'white' : 'var(--text-muted)',
              padding: '0.5rem 1rem', fontSize: '0.85rem'
            }}
            onClick={() => setViewMode('profile')}
          >
            Profile Information
          </button>
          <button 
            className="secondary" 
            style={{ 
              background: viewMode === 'settings' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'settings' ? 'white' : 'var(--text-muted)',
              padding: '0.5rem 1rem', fontSize: '0.85rem'
            }}
            onClick={() => setViewMode('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      {viewMode === 'profile' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Profile Identity Card */}
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ 
                width: '100px', height: '100px', background: 'var(--primary)', color: 'white', 
                borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 
              }}>
                {formData.fullName.charAt(0)}
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{formData.fullName}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{formData.email}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blood Group</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>{formData.bloodGroup}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Age</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.25rem' }}>{formData.age}</div>
                </div>
              </div>
            </div>

            {/* Medical Records Card */}
            <div className="card">
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📄</span> Medical Records
              </h3>
              
              <div 
                style={{ 
                  border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '2rem', 
                  textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer' 
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📤</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upload Report (PDF/JPG)</div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                {myRecords.length > 0 ? myRecords.map(record => (
                  <div key={record.id} style={{ 
                    background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', 
                    display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' 
                  }}>
                    <div style={{ fontSize: '1.2rem' }}>📗</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{record.title}.pdf</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--name-highlight)' }}>{record.date} • {record.doctorName}</div>
                    </div>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No records found.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <form onSubmit={handleSave}>
              {/* Personal Details Section */}
              <div className="card" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--success)' }}>👤</span>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Personal Details</h3>
                  </div>
                  {!isEditing && (
                    <button 
                      type="button"
                      className="secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '8px', color: 'var(--success)', border: '1px solid var(--success-glow)', background: 'var(--success-glow)' }}
                      onClick={() => setIsEditing(true)}
                    >
                      ✎ Edit Details
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input style={inputStyle} value={formData.fullName} readOnly={!isEditing} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} value={formData.email} readOnly={!isEditing} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} value={formData.phone} readOnly={!isEditing} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input style={inputStyle} type={isEditing ? 'date' : 'text'} value={formData.dob} readOnly={!isEditing} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Address</label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle, paddingLeft: '2.5rem' }} value={formData.address} readOnly={!isEditing} onChange={e => setFormData({...formData, address: e.target.value})} />
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>📍</span>
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                  <span style={{ color: 'var(--danger)' }}>🛡️</span>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Medical Information</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Blood Group</label>
                    {isEditing ? (
                      <select style={inputStyle} value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <input style={inputStyle} value={formData.bloodGroup} readOnly />
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Emergency Contact</label>
                    <input style={inputStyle} value={formData.emergencyContact} readOnly={!isEditing} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Allergies</label>
                  <input style={inputStyle} value={formData.allergies} readOnly={!isEditing} onChange={e => setFormData({...formData, allergies: e.target.value})} />
                </div>

                {isEditing && (
                  <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                    <button type="submit" style={{ flex: 1, height: '54px' }}>Save Changes</button>
                    <button type="button" className="secondary" style={{ flex: 1, height: '54px' }} onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                )}
              </div>
            </form>

          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>App Settings</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your visual and security preferences</p>
          
          <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
              <span style={{ fontWeight: 700 }}>Dark Theme</span>
              <button className="secondary" onClick={toggleTheme} style={{ borderRadius: '20px', padding: '0.4rem 1.25rem' }}>
                {isDarkMode ? 'Disable' : 'Enable'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
              <span style={{ fontWeight: 700 }}>Push Notifications</span>
              <button className="secondary" style={{ borderRadius: '20px', padding: '0.4rem 1.25rem' }}>Enabled</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
              <span style={{ fontWeight: 700 }}>Two-Factor Auth</span>
              <button className="secondary" style={{ borderRadius: '20px', padding: '0.4rem 1.25rem' }}>Setup</button>
            </div>
          </div>
        </div>
      )}

      {/* Black Box Overlay for restricted editing */}
      {showOverlay && (
        <div 
          className="modal-overlay" 
          style={{ 
            zIndex: 3000,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowOverlay(false)}
        >
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '450px', 
              textAlign: 'center', 
              padding: '3rem',
              background: '#1a1a2e',
              borderRadius: '24px',
              border: '2px solid var(--primary)',
              boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
            <h2 style={{ marginBottom: '1rem', color: 'white' }}>Editing Restricted</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
              Profile editing is restricted. Please use the Edit Profile option.
            </p>
            <button 
              onClick={() => setShowOverlay(false)}
              style={{ 
                background: 'var(--primary)', 
                color: 'white', 
                fontWeight: 800, 
                borderRadius: '14px', 
                height: '54px',
                width: '100%'
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
