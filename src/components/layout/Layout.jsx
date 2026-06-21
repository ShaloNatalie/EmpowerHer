import React from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import Navbar from './Navbar';
import '../../styles/global.css';
import '../../styles/responsive.css';

const Layout = () => {
  const location = useLocation();
  
  // Hide bottom navigation on auth and landing routes
  const hideNavbarRoutes = ['/', '/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  // Navigation items matching mockup sidebar
  const sidebarItems = [
    { path: '/dashboard', no: '01', label: 'Home' },
    { path: '/education', no: '02', label: 'Learn' },
    { path: '/self-examination', no: '03', label: 'Self-check guide' },
    { path: '/records', no: '04', label: 'History log' },
    { path: '/reminders', no: '05', label: 'Reminders' },
    { path: '/clinics', no: '06', label: 'Clinic directory' },
    { path: '/profile', no: '07', label: 'Profile & settings' },
    { path: '/admin', no: '08', label: 'Admin panel' }
  ];

  return (
    <div className={`app-container ${shouldHideNavbar ? 'app-container-fluid' : 'app-container-with-sidebar'}`}>
      {/* Desktop TOC Sidebar */}
      {!shouldHideNavbar && (
        <aside className="sidebar-navigation" style={{ display: 'none' }}>
          <h1 className="toc-title" style={{ fontFamily: 'var(--font-display)', fontSize: '27px', fontWeight: '600' }}>
            Empower<em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: '500' }}>Her</em>
          </h1>
          <p className="toc-sub" style={{ fontSize: '12px', opacity: 0.55, margin: '0 0 26px' }}>
            Private breast health support
          </p>
          <hr className="toc-rule" style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '0 0 18px' }} />
          
          <ul className="toc-list" style={{ listStyle: 'none', padding: 0, margin: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
            {sidebarItems.map((item) => (
              <React.Fragment key={item.path}>
                {item.no === '07' && (
                  <div className="sep" style={{ height: '1px', backgroundColor: 'var(--line)', margin: '14px 0' }} />
                )}
                <li style={{ marginBottom: '2px' }}>
                  <NavLink
                    to={item.path}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '10px',
                      textDecoration: 'none',
                      color: 'var(--ink)',
                      fontSize: '14.5px',
                      padding: '9px 4px',
                      borderBottom: '1px dotted transparent',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? '600' : '400'
                    })}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <span className="no" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.4 }}>
                      {item.no}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              </React.Fragment>
            ))}
          </ul>
          
          <div className="toc-foot" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.45, letterSpacing: '0.05em', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
            EMPOWERHER PWA — ED. 2026
          </div>
        </aside>
      )}

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
        <main className="main-content" style={{ paddingBottom: shouldHideNavbar ? '30px' : '84px' }}>
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Menu */}
        {!shouldHideNavbar && (
          <div className="hide-desktop">
            <Navbar />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
