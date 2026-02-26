
import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth, useChat, useTheme, useCart, useAppointments } from './contexts/index';
import { UserRole } from './types';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import DoctorPanel from './pages/DoctorPanel';
import Pharmacy from './pages/Pharmacy';
import HealthRecords from './pages/HealthRecords';
import MyAppointments from './pages/MyAppointments';
import LabTests from './pages/LabTests';
import PatientConsultation from './pages/PatientConsultation';
import Profile from './pages/Profile';

interface NavLinkConfig {
  to: string;
  icon: string;
  label: string;
  badgeCount?: (context: { patientUnread: number; pendingAppointments: number }) => number;
}

const NAV_CONFIG: Record<UserRole, NavLinkConfig[]> = {
  [UserRole.DOCTOR]: [
    { to: '/doctor', icon: '🏠', label: 'Dashboard' },
    { to: '/doctor/schedule', icon: '📅', label: 'My Schedule', badgeCount: (ctx) => ctx.pendingAppointments },
    { to: '/doctor/patients', icon: '👥', label: 'My Patients' },
    { to: '/doctor/consult', icon: '💬', label: 'Consultations' },
    { to: '/doctor/network', icon: '🌐', label: 'Network' },
    { to: '/doctor/records', icon: '📁', label: 'Health Records' },
    { to: '/doctor/profile', icon: '⚙️', label: 'Settings' },
  ],
  [UserRole.PATIENT]: [
    { to: '/dashboard', icon: '🏠', label: 'Home' },
    { to: '/doctors', icon: '🔍', label: 'Find Doctor' },
    { to: '/appointments', icon: '📅', label: 'Appointments' },
    { to: '/lab-tests', icon: '🧪', label: 'Lab Tests' },
    { to: '/pharmacy', icon: '💊', label: 'Pharmacy' },
    { to: '/records', icon: '📁', label: 'Records' },
    { to: '/consultations', icon: '💬', label: 'Consult Chat', badgeCount: (ctx) => ctx.patientUnread },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ],
};

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, originalAdmin, revertToAdmin, logout, isAuthenticated } = useAuth();
  const { messages } = useChat();
  const { appointments } = useAppointments();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isAuthenticated || !user) return null;

  const links = NAV_CONFIG[user.role] || [];
  const isActive = (path: string) => location.pathname === path ? 'active' : '';
  const patientUnread = messages.filter(m => m.recipientName === user.fullName && m.senderRole === UserRole.DOCTOR).length;
  const pendingAppointments = appointments.filter(app => app.doctorName === user.fullName && app.status === 'Pending').length; 

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.DOCTOR: return 'var(--color-doctor)';
      case UserRole.PATIENT: return 'var(--color-patient)';
      default: return 'var(--primary)';
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <aside className={isOpen ? 'open' : ''}>
        <div className="brand">
          <span>🛡️</span>
          HealthPlus
        </div>

        <div className="sidebar-user" style={{ 
          border: originalAdmin ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
          marginBottom: '2rem', 
          cursor: 'pointer', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '1rem', 
          padding: '1.5rem',
          background: 'rgba(99, 102, 241, 0.05)',
          borderRadius: '16px',
          width: '100%',
          textAlign: 'center'
        }} onClick={() => onClose()}>
          <div className="avatar" style={{ 
            background: getRoleColor(user.role),
            width: '56px',
            height: '56px',
            fontSize: '1.25rem'
          }}>
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.fullName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginTop: '0.4rem', letterSpacing: '0.1em' }}>
              {originalAdmin ? 'Admin Override' : user.role}
            </div>
          </div>
        </div>

        <nav className="nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {links.map((link) => {
            const count = link.badgeCount ? link.badgeCount({ patientUnread, pendingAppointments }) : 0;
            return (
              <Link key={link.to} to={link.to} className={`nav-item ${isActive(link.to)}`} onClick={onClose}>
                <div className="icon-box" style={{ width: '24px', textAlign: 'center' }}>{link.icon}</div> 
                <span style={{ flex: 1 }}>{link.label}</span>
                {count > 0 && (
                  <span className="badge" style={{ 
                    background: 'var(--danger)', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontSize: '0.65rem', 
                    fontWeight: 800,
                    boxShadow: '0 2px 8px var(--danger-glow)'
                  }}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {originalAdmin && (
            <button onClick={revertToAdmin} style={{ background: 'var(--text-main)', color: '#ffffff', width: '100%', fontSize: '0.75rem', justifyContent: 'center', borderRadius: '10px' }}>
              ⬅ Exit Override
            </button>
          )}
          <button onClick={handleLogoutClick} className="secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: '10px' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🚪</div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Sign Out?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Are you sure you want to end your current session? You will need to re-authenticate to access your records.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={handleConfirmLogout} 
                style={{ background: 'var(--danger)', color: 'white', fontWeight: 800, borderRadius: '14px', height: '54px' }}
              >
                Yes, Sign Out
              </button>
              <button 
                className="secondary" 
                onClick={() => setShowLogoutConfirm(false)} 
                style={{ fontWeight: 800, borderRadius: '14px', height: '54px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1150 }} onClick={onClose} />}
    </>
  );
};

const Navbar: React.FC<{ onToggleSidebar: () => void; isSidebarOpen: boolean }> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { cart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (!isAuthenticated) return null;

  return (
    <nav className={`top-navbar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="menu-toggle" onClick={onToggleSidebar}>
        <div style={{ background: 'var(--primary-glow)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
            {isSidebarOpen ? '✕' : '☰'} <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>MENU</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user?.role === UserRole.PATIENT && (
          <Link to="/pharmacy" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.2rem', animation: cartItemCount > 0 ? 'cartBounce 0.3s ease' : 'none' }}>🛒</span>
            {cartItemCount > 0 && (
              <span style={{ 
                position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', 
                fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' 
              }}>
                {cartItemCount}
              </span>
            )}
          </Link>
        )}
        <div className="theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode" style={{ cursor: 'pointer' }}>
          {isDarkMode ? '☀️' : '🌙'}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main className={isSidebarOpen ? 'sidebar-open' : ''}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={[UserRole.PATIENT]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/appointments" element={<MyAppointments />} />
            <Route path="/lab-tests" element={<LabTests />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/records" element={<HealthRecords />} />
            <Route path="/consultations" element={<PatientConsultation />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[UserRole.DOCTOR]} />}>
            <Route path="/doctor" element={<DoctorPanel />} />
            <Route path="/doctor/schedule" element={<DoctorPanel />} />
            <Route path="/doctor/patients" element={<DoctorPanel />} />
            <Route path="/doctor/consult" element={<DoctorPanel />} />
            <Route path="/doctor/network" element={<DoctorPanel />} />
            <Route path="/doctor/records" element={<DoctorPanel />} />
            <Route path="/doctor/profile" element={<Profile />} />
          </Route>
          <Route path="/" element={<Navigate to={
            user?.role === UserRole.DOCTOR ? "/doctor" : "/dashboard"
          } replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
