import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [language, setLanguage] = useState('English');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const translations = {
    English: {
      title: "Settings 👤",
      subtitle: "Language, notifications, and the small things that make this app yours.",
      accountDetails: "Account Details",
      name: "Full Name",
      email: "Email Address",
      languagePref: "Language Preference",
      notifPref: "Notification Preferences",
      privacySettings: "Privacy Settings",
      privacySummary: "Private Data Logging Mode",
      adminBtn: "🛠️ Open Admin Panel",
      logoutBtn: "Log Out",
      successMsg: "Preferences saved successfully!"
    },
    Kiswahili: {
      title: "Mipangilio 👤",
      subtitle: "Lugha, arifa, na mambo madogo yanayofanya programu hii iwe yako.",
      accountDetails: "Maelezo ya Akaunti",
      name: "Majina Kamili",
      email: "Barua Pepe",
      languagePref: "Lugha Pendwa",
      notifPref: "Mapendeleo ya Arifa",
      privacySettings: "Mipangilio ya Faragha",
      privacySummary: "Njia ya Kumbukumbu ya Kibinafsi",
      adminBtn: "🛠️ Fungua Dashibodi ya Utawala",
      logoutBtn: "Ondoka",
      successMsg: "Mapendeleo yamehifadhiwa kwa mafanikio!"
    }
  };

  const text = translations[language];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="masthead-row">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '500' }}>
            {text.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {text.subtitle}
          </p>
        </div>
        <div className="stamp">Preferences</div>
      </div>

      {/* User Details card */}
      <div className="card d-flex align-center gap-2" style={{ border: '1px solid var(--line)', backgroundColor: 'white', padding: '20px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', backgroundColor: 'var(--mustard)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: 'var(--paper-deep)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.6rem'
        }}>
          👩‍⚕️
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: '600' }}>{user?.name || 'Jane Auma'}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.email || 'jane.auma@domain.com'}</p>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="card d-flex flex-column gap-2" style={{ padding: '20px', border: '1px solid var(--line)', backgroundColor: 'white' }}>
        <div>
          <label className="input-label">🌐 {text.languagePref}</label>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              alert(translations[e.target.value].successMsg);
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1.5px solid var(--line)',
              backgroundColor: 'var(--paper)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              outline: 'none'
            }}
          >
            <option value="English">English</option>
            <option value="Kiswahili">Kiswahili (Swahili)</option>
          </select>
        </div>

        {/* Notifications push toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
          <div>
            <label className="input-label" style={{ marginBottom: '2px' }}>
              🔔 {text.notifPref}
            </label>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Send push notifications</span>
          </div>
          <input
            type="checkbox"
            checked={pushEnabled}
            onChange={(e) => setPushEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--oxblood)' }}
          />
        </div>

        {/* Privacy options */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
          <div>
            <label className="input-label" style={{ marginBottom: '2px' }}>
              🔒 {text.privacySettings}
            </label>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{text.privacySummary}</span>
          </div>
          <input
            type="checkbox"
            checked={privacyMode}
            onChange={(e) => setPrivacyMode(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--oxblood)' }}
          />
        </div>
      </div>

      {/* Admin Panel Direct Link */}
      <div style={{ marginTop: '8px' }}>
        <Link to="/admin">
          <Button variant="secondary">{text.adminBtn}</Button>
        </Link>
      </div>

      {/* Logout button */}
      <div>
        <Button variant="danger" onClick={handleLogout}>{text.logoutBtn}</Button>
      </div>
    </div>
  );
};

export default Profile;
