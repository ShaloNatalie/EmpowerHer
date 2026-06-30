import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import Navbar from './Navbar';
import { useReminderChecker } from '../../hooks/useReminderChecker';
import '../../styles/global.css';
import '../../styles/responsive.css';

const UserLayout = () => {
  const { toastMessage, dismissToast } = useReminderChecker();

  return (
    <div className="app-container app-container-with-sidebar">
      {/* Reminder Toast Overlay */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'var(--oxblood)',
          color: 'var(--paper)',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'var(--font-base)',
          fontSize: '14px'
        }}>
          <span>{toastMessage}</span>
          <button 
            onClick={dismissToast} 
            style={{ background: 'transparent', border: 'none', color: 'var(--paper)', cursor: 'pointer', fontSize: '18px', padding: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Desktop User Sidebar */}
      <UserSidebar />

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header Bar */}
        <header className="desktop-header-hide" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--paper)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌸</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--oxblood)', fontFamily: 'var(--font-display)' }}>
              Empower<em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: '500' }}>Her</em>
            </h1>
          </div>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--oxblood)' }}>ED. 2026</div>
        </header>

        {/* Main Content Area */}
        <main className="main-content" style={{ paddingBottom: '84px' }}>
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Menu */}
        <div className="hide-desktop">
          <Navbar />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
