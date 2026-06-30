import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getSelfCheckRecords, clearUserRecords } from '../services/selfCheckService';
import { kenyaCounties } from '../constants/kenyaCounties';
import '../styles/profile.css';

// Simple SHA-256 Hashing helper
const hashPIN = async (pin) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sub-screens: 'overview' | 'edit'
  const [view, setView] = useState('overview');

  // Local Profile State (pre-populated with user context or template defaults)
  const [profile, setProfile] = useState({
    name: user?.fullName || user?.name || 'Christine Wachira',
    email: user?.email || 'christine@example.com',
    ageRange: user?.ageRange || '18–25',
    county: user?.county || 'Nairobi',
    status: user?.accountStatus || 'Active'
  });

  // Edit form buffer state
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editAgeRange, setEditAgeRange] = useState(profile.ageRange);
  const [editCounty, setEditCounty] = useState(profile.county);

  // Privacy Settings Toggles State
  const [privacySettings, setPrivacySettings] = useState({
    hideSensitiveInfo: false,
    requirePinForHistory: false,
    pinHash: null
  });

  // PIN creation UI State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Clear data modal state
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  // Reminder Settings State
  const [reminderSettings, setReminderSettings] = useState({
    monthlySelfCheck: true,
    clinicFollowUp: false,
    preferredTime: '20:00',
    methods: ['inApp']
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTextInput, setDeleteTextInput] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Clear records modal state
  const [showClearRecordsModal, setShowClearRecordsModal] = useState(false);

  // Fetch settings on load
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user?.uid) return;
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.privacySettings) {
            setPrivacySettings({
              hideSensitiveInfo: !!data.privacySettings.hideSensitiveInfo,
              requirePinForHistory: !!data.privacySettings.requirePinForHistory,
              pinHash: data.privacySettings.pinHash || null
            });
          }
          if (data.reminderSettings) {
            setReminderSettings({
              monthlySelfCheck: data.reminderSettings.monthlySelfCheck !== false,
              clinicFollowUp: !!data.reminderSettings.clinicFollowUp,
              preferredTime: data.reminderSettings.preferredTime || '20:00',
              methods: data.reminderSettings.methods || ['inApp']
            });
          }
          setProfile({
            name: data.fullName || data.name || 'Christine Wachira',
            email: data.email || 'christine@example.com',
            ageRange: data.ageRange || '18–25',
            county: data.county || 'Nairobi',
            status: data.accountStatus || 'Active'
          });
        }
      } catch (err) {
        console.error("Error fetching user settings from Firestore:", err);
      }
    };
    fetchUserSettings();
  }, [user]);

  // Switch handlers
  const handlePrivacyToggle = async (key) => {
    if (!user?.uid) return;

    if (key === 'hideSensitiveInfo') {
      const newValue = !privacySettings.hideSensitiveInfo;
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'privacySettings.hideSensitiveInfo': newValue,
          'privacySettings.updatedAt': serverTimestamp()
        });
        setPrivacySettings(prev => ({
          ...prev,
          hideSensitiveInfo: newValue
        }));
      } catch (err) {
        console.error("Failed to update hideSensitiveInfo:", err);
      }
    } else if (key === 'requirePinForHistory') {
      if (privacySettings.requirePinForHistory) {
        // Confirm disabling it
        const confirmDisable = confirm("Are you sure you want to disable PIN protection for your self-check history?");
        if (confirmDisable) {
          try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              'privacySettings.requirePinForHistory': false,
              'privacySettings.pinHash': null,
              'privacySettings.updatedAt': serverTimestamp()
            });
            setPrivacySettings(prev => ({
              ...prev,
              requirePinForHistory: false,
              pinHash: null
            }));
          } catch (err) {
            console.error("Failed to disable PIN protection:", err);
          }
        }
      } else {
        // Trigger PIN creation setup modal
        setPinInput('');
        setConfirmPinInput('');
        setPinError('');
        setShowPinModal(true);
      }
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (pinInput.length !== 4 || !/^\d+$/.test(pinInput)) {
      setPinError('PIN must be a 4-digit number.');
      return;
    }
    if (pinInput !== confirmPinInput) {
      setPinError('PINs do not match. Please try again.');
      return;
    }

    try {
      const hashed = await hashPIN(pinInput);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'privacySettings.requirePinForHistory': true,
        'privacySettings.pinHash': hashed,
        'privacySettings.updatedAt': serverTimestamp()
      });
      setPrivacySettings(prev => ({
        ...prev,
        requirePinForHistory: true,
        pinHash: hashed
      }));
      setShowPinModal(false);
    } catch (err) {
      console.error("Failed to save PIN:", err);
      setPinError("An error occurred while saving the PIN.");
    }
  };

  const handleReminderToggle = (key) => {
    setReminderSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleReminderMethodChange = (method) => {
    const current = reminderSettings.methods;
    if (current.includes(method)) {
      setReminderSettings(prev => ({
        ...prev,
        methods: current.filter(m => m !== method)
      }));
    } else {
      setReminderSettings(prev => ({
        ...prev,
        methods: [...current, method]
      }));
    }
  };

  const handleTimeChange = (e) => {
    setReminderSettings(prev => ({
      ...prev,
      preferredTime: e.target.value
    }));
  };

  // Form actions
  const handleStartEdit = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditAgeRange(profile.ageRange);
    setEditCounty(profile.county);
    setView('edit');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: editName,
        email: editEmail,
        ageRange: editAgeRange,
        county: editCounty
      });
      setProfile(prev => ({
        ...prev,
        name: editName,
        email: editEmail,
        ageRange: editAgeRange,
        county: editCounty
      }));
      setView('overview');
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  // Account / Security Actions
  const handleClearData = () => {
    setShowClearModal(true);
  };

  const confirmClearData = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Try to clear caches safely if window.caches is available
      if (window.caches) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map(key => window.caches.delete(key)));
      }
      setShowClearModal(false);
      setClearSuccess(true);
    } catch (err) {
      console.error("Error clearing local data:", err);
      // Still show success or alert user
      setShowClearModal(false);
      setClearSuccess(true);
    }
  };

  // Change Password UI State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleUpdateReminders = async () => {
    if (!user?.uid) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        reminderSettings: {
          monthlySelfCheck: !!reminderSettings.monthlySelfCheck,
          clinicFollowUp: !!reminderSettings.clinicFollowUp,
          preferredTime: reminderSettings.preferredTime || '20:00',
          methods: reminderSettings.methods || ['inApp'],
          updatedAt: serverTimestamp()
        }
      });
      alert("Reminder preferences updated successfully.");
    } catch (err) {
      console.error("Failed to update reminder settings:", err);
      alert("Failed to update reminder preferences. Please try again.");
    }
  };

  const handleChangePasswordClick = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(false);
    setShowPasswordModal(true);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Your new password should be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    const { auth } = await import('../firebase/firebase');
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      setPasswordError("Please log in again before changing your password.");
      return;
    }

    setPasswordLoading(true);
    try {
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
      
      // 1. Create credential
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      
      // 2. Reauthenticate
      try {
        await reauthenticateWithCredential(currentUser, credential);
      } catch (authErr) {
        console.error("Reauthentication failed:", authErr);
        setPasswordError("The current password you entered is incorrect.");
        setPasswordLoading(false);
        return;
      }

      // 3. Update password
      try {
        await updatePassword(currentUser, newPassword);
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
        alert("Password updated successfully.");
      } catch (updateErr) {
        console.error("Update password failed:", updateErr);
        if (updateErr.code === 'auth/weak-password') {
          setPasswordError("Your new password should be at least 6 characters.");
        } else if (updateErr.code === 'auth/requires-recent-login') {
          setPasswordError("Please log in again before changing your password.");
        } else {
          setPasswordError("Could not update your password. Please try again.");
        }
      }
    } catch (err) {
      console.error("General change password error:", err);
      setPasswordError("Could not update your password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate('/');
  };

  const handleExportRecords = async () => {
    if (!user?.uid) return;
    try {
      const records = await getSelfCheckRecords(user.uid);
      if (!records || records.length === 0) {
        alert("You do not have any self-check records to export yet.");
        return;
      }
      
      const csvRows = [];
      const headers = ['Date', 'Completed guide', 'Side checked', 'Felt normal', 'Changes noticed', 'Notes', 'Reminder requested', 'Created at'];
      csvRows.push(headers.join(','));
      
      records.forEach(rec => {
        const values = [
          rec.date || '',
          rec.completedGuide ? 'Yes' : 'No',
          rec.sideChecked || '',
          rec.feltNormal || '',
          (rec.changesNoticed || []).join('; '),
          `"${(rec.notes || '').replace(/"/g, '""')}"`, // escape quotes for CSV
          rec.reminderRequested ? 'Yes' : 'No',
          rec.createdAt || ''
        ];
        csvRows.push(values.join(','));
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'empowerher-self-check-records.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      alert("Your records have been exported successfully.");
    } catch (err) {
      console.error("Error exporting records:", err);
      alert("An error occurred while exporting your records.");
    }
  };

  const confirmClearRecords = async () => {
    if (!user?.uid) return;
    try {
      await clearUserRecords(user.uid);
      setShowClearRecordsModal(false);
      alert("Your self-check records have been cleared.");
    } catch (err) {
      console.error("Error clearing records:", err);
      alert("An error occurred while clearing your records.");
    }
  };

  const handleDeleteAccountClick = () => {
    setDeleteTextInput('');
    setDeletePassword('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteAccount = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (deleteTextInput !== 'DELETE') {
      setDeleteError("Please type DELETE exactly to confirm.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      const { auth } = await import('../firebase/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        setDeleteError("For security, please log in again before deleting your account.");
        setDeleteLoading(false);
        return;
      }
      
      const { EmailAuthProvider, reauthenticateWithCredential, deleteUser } = await import('firebase/auth');
      
      if (deletePassword) {
        const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
        try {
          await reauthenticateWithCredential(currentUser, credential);
        } catch (reauthErr) {
          console.error("Reauth failed during delete:", reauthErr);
          setDeleteError("Please enter your current password to confirm account deletion.");
          setDeleteLoading(false);
          return;
        }
      } else {
        setDeleteError("Please enter your current password to confirm account deletion.");
        setDeleteLoading(false);
        return;
      }
      
      // 1. Delete user's self check records
      await clearUserRecords(user.uid);
      
      // 2. Delete user doc
      await deleteDoc(doc(db, 'users', user.uid));
      
      // 3. Delete auth user
      await deleteUser(currentUser);
      
      // 4. Logout
      if (logout) {
        await logout();
      }
      navigate('/');
      
    } catch (err) {
      console.error("Error deleting account:", err);
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError("For security, please log in again before deleting your account.");
      } else {
        setDeleteError("An error occurred while deleting your account. Please try again.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="main">
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Section 07</p>
        <h1 className="h1">Profile & <em>Settings</em></h1>
        <p className="dek">Manage your account, privacy, reminders, and personal preferences.</p>
      </div>

      <div className="notice">
        <b>About your privacy</b>
        Your profile settings help personalize your experience. EmpowerHer keeps your self-check records private and does not provide medical diagnosis.
      </div>

      {/* ===== PROFILE OVERVIEW / EDIT VIEW ===== */}
      <div className="section-head">
        <h3>Your profile</h3>
        <div className="rule"></div>
        <span className="tag">Overview</span>
      </div>

      {view === 'overview' && (
        <div className="view show">
          <div className="profile-card">
            <span className="corner"></span>
            <div className="profile-top">
              <div className="avatar">{profile.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="profile-name">{profile.name}</p>
                <span className="status-pill">{profile.status}</span>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <p className="label">Email or phone</p>
                <p className="value">{profile.email}</p>
              </div>
              <div className="info-item">
                <p className="label">Age range</p>
                <p className="value">{profile.ageRange}</p>
              </div>
              <div className="info-item">
                <p className="label">County</p>
                <p className="value">{profile.county}</p>
              </div>
              <div className="info-item">
                <p className="label">Account status</p>
                <p className="value">{profile.status}</p>
              </div>
            </div>
            <div className="btn-row">
              <button className="btn-secondary" onClick={handleStartEdit}>Edit profile</button>
            </div>
          </div>
        </div>
      )}

      {view === 'edit' && (
        <div className="view show">
          <div className="profile-card">
            <span className="corner"></span>
            <form onSubmit={handleSaveChanges}>
              <div className="field">
                <label>Full name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                />
              </div>
              <div className="field">
                <label>Email or phone number</label>
                <input 
                  type="text" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Age range</label>
                  <select value={editAgeRange} onChange={(e) => setEditAgeRange(e.target.value)}>
                    <option value="16–17">16–17</option>
                    <option value="18–25">18–25</option>
                    <option value="26–35">26–35</option>
                    <option value="36–45">36–45</option>
                    <option value="46+">46+</option>
                  </select>
                </div>
                <div className="field">
                  <label>County / location</label>
                  <select value={editCounty} onChange={(e) => setEditCounty(e.target.value)}>
                    <option value="" disabled>Select county</option>
                    {kenyaCounties.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="btn-row">
                <button type="submit" className="btn-primary">Save changes</button>
                <button type="button" className="btn-ghost" onClick={() => setView('overview')}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== PRIVACY SETTINGS ===== */}
      <div className="section-head">
        <h3>Privacy</h3>
        <div className="rule"></div>
        <span className="tag">On this device</span>
      </div>

      <div className="setting-list">
        <div className="setting-row">
          <div>
            <h4>Hide sensitive information on screen</h4>
            <p>Mask details on the history and self-check pages until tapped.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={privacySettings.hideSensitiveInfo} 
              onChange={() => handlePrivacyToggle('hideSensitiveInfo')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <h4>Require PIN before viewing self-check history</h4>
            <p>Add a quick lock screen before opening your records.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={privacySettings.requirePinForHistory} 
              onChange={() => handlePrivacyToggle('requirePinForHistory')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <h4>Clear local app data</h4>
            <p>Remove cached content stored on this device only.</p>
          </div>
          <button className="btn-ghost" onClick={handleClearData}>Clear data</button>
        </div>
      </div>
      <p className="privacy-note">Privacy settings help you control how your personal health information is shown and protected on this device.</p>

      {/* ===== REMINDER PREFERENCES ===== */}
      <div className="section-head">
        <h3>Reminder preferences</h3>
        <div className="rule"></div>
        <span className="tag">Defaults</span>
      </div>

      <div className="setting-list">
        <div className="setting-row">
          <div>
            <h4>Monthly self-check reminders</h4>
            <p>A nudge once a month to do your guided self-check.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={reminderSettings.monthlySelfCheck} 
              onChange={() => handleReminderToggle('monthlySelfCheck')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <h4>Clinic follow-up reminders</h4>
            <p>Reminders for upcoming or past-due clinic visits.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={reminderSettings.clinicFollowUp} 
              onChange={() => handleReminderToggle('clinicFollowUp')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="field-inline">
          <label>Preferred time</label>
          <input 
            type="time" 
            value={reminderSettings.preferredTime} 
            onChange={handleTimeChange} 
          />
        </div>
        <div className="field-inline">
          <label>Reminder method</label>
          <div className="method-row">
            <label>
              <input 
                type="checkbox" 
                checked={reminderSettings.methods.includes('inApp')} 
                onChange={() => handleReminderMethodChange('inApp')} 
              /> In-app
            </label>
            <label style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <input 
                type="checkbox" 
                disabled 
                checked={false} 
              /> Phone notification (Coming soon)
            </label>
            <label style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <input 
                type="checkbox" 
                disabled 
                checked={false} 
              /> SMS (Coming soon)
            </label>
          </div>
        </div>
      </div>
      <div className="btn-row" style={{ marginTop: '16px' }}>
        <button className="btn-primary" onClick={handleUpdateReminders}>Update reminder settings</button>
        <button className="btn-secondary" onClick={() => navigate('/reminders')}>Go to Reminders page</button>
      </div>

      {/* ===== SECURITY ===== */}
      <div className="section-head">
        <h3>Security</h3>
        <div className="rule"></div>
        <span className="tag">Account</span>
      </div>

      <div className="action-list">
        <div className="action-row">
          <div>
            <h4>Change password</h4>
            <p>Update the password you use to sign in.</p>
          </div>
          <button className="btn-secondary" onClick={handleChangePasswordClick}>Change password</button>
        </div>
        <div className="action-row">
          <div>
            <h4>Log out</h4>
            <p>Sign out of EmpowerHer on this device.</p>
          </div>
          <button className="btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {/* ===== ACCOUNT ACTIONS ===== */}
      <div className="section-head">
        <h3>Account actions</h3>
        <div className="rule"></div>
        <span className="tag">Manage data</span>
      </div>

      <div className="action-list">
        <div className="action-row">
          <div>
            <h4>Download or export my records</h4>
            <p>Save a copy of your self-check history for your own reference.</p>
          </div>
          <button className="btn-secondary" onClick={handleExportRecords}>Export records</button>
        </div>
        <div className="action-row danger">
          <div>
            <h4>Clear saved self-check records</h4>
            <p>Remove all entries from your History Log. This cannot be undone.</p>
          </div>
          <button className="btn-secondary" onClick={() => setShowClearRecordsModal(true)}>Clear records</button>
        </div>
        <div className="action-row danger">
          <div>
            <h4>Delete account</h4>
            <p>Permanently remove your account and saved records.</p>
          </div>
          <button className="btn-secondary" onClick={handleDeleteAccountClick}>Delete account</button>
        </div>
      </div>

      {/* ============ CLEAR RECORDS CONFIRMATION MODAL ============ */}
      <div className={`modal-overlay ${showClearRecordsModal ? 'show' : ''}`}>
        <div className="modal">
          <h4>Clear saved self-check records?</h4>
          <p>This will permanently remove all entries from your History Log. This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowClearRecordsModal(false)}>Cancel</button>
            <button className="btn-secondary" style={{ borderColor: 'var(--oxblood)', color: 'var(--oxblood)' }} onClick={confirmClearRecords}>Clear records</button>
          </div>
        </div>
      </div>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <div className={`modal-overlay ${showDeleteModal ? 'show' : ''}`}>
        <div className="modal" style={{ maxWidth: '420px' }}>
          <h4>Delete your account?</h4>
          <p>This will permanently remove your EmpowerHer account and saved records. This action cannot be undone.</p>
          <form onSubmit={handleConfirmDeleteAccount}>
            <div className="field">
              <label>Current password</label>
              <input 
                type="password" 
                value={deletePassword} 
                onChange={(e) => setDeletePassword(e.target.value)} 
                placeholder="Required for security" 
                required 
              />
            </div>
            <div className="field">
              <label>Type DELETE to confirm</label>
              <input 
                type="text" 
                value={deleteTextInput} 
                onChange={(e) => setDeleteTextInput(e.target.value)} 
                placeholder="DELETE" 
                required 
              />
            </div>
            {deleteError && <p style={{ color: 'var(--oxblood)', fontSize: '13px', margin: '0 0 16px' }}>{deleteError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancel</button>
              <button 
                type="submit" 
                className="btn-secondary" 
                style={{ borderColor: 'var(--oxblood)', color: 'var(--oxblood)' }} 
                disabled={deleteTextInput !== 'DELETE' || deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ============ PIN SETUP MODAL ============ */}
      <div className={`modal-overlay ${showPinModal ? 'show' : ''}`}>
        <div className="modal">
          <h4>Set a 4-Digit PIN</h4>
          <p>This PIN will be required to access your Self-Check History on this device.</p>
          <form onSubmit={handleSavePin}>
            <div className="field">
              <label>Enter 4-Digit PIN</label>
              <input 
                type="password" 
                maxLength={4}
                pattern="\d{4}"
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                required
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
              />
            </div>
            <div className="field">
              <label>Confirm 4-Digit PIN</label>
              <input 
                type="password" 
                maxLength={4}
                pattern="\d{4}"
                placeholder="••••"
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                required
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
              />
            </div>
            {pinError && <p style={{ color: 'var(--oxblood)', fontSize: '13px', margin: '0 0 16px' }}>{pinError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowPinModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save PIN</button>
            </div>
          </form>
        </div>
      </div>

      {/* ============ CLEAR DATA CONFIRMATION MODAL ============ */}
      <div className={`modal-overlay ${showClearModal ? 'show' : ''}`}>
        <div className="modal">
          <h4>Clear local app data?</h4>
          <p>This will clear cached content stored on this device only. Your saved self-check records in your account will not be deleted.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowClearModal(false)}>Cancel</button>
            <button className="btn-secondary" onClick={confirmClearData}>Clear data</button>
          </div>
        </div>
      </div>

      {/* ============ CLEAR SUCCESS MODAL ============ */}
      <div className={`modal-overlay ${clearSuccess ? 'show' : ''}`}>
        <div className="modal">
          <h4>Success</h4>
          <p>Local app data cleared successfully.</p>
          <div className="modal-actions">
            <button className="btn-primary" onClick={() => setClearSuccess(false)}>OK</button>
          </div>
        </div>
      </div>

      {/* ============ CHANGE PASSWORD MODAL ============ */}
      <div className={`modal-overlay ${showPasswordModal ? 'show' : ''}`}>
        <div className="modal" style={{ maxWidth: '420px' }}>
          <h4>Change password</h4>
          <p>Please enter your current password to verify your identity before entering a new password.</p>
          <form onSubmit={handleSavePassword}>
            <div className="field">
              <label>Current password</label>
              <input 
                type={showPasswords ? "text" : "password"} 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input 
                type={showPasswords ? "text" : "password"} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                minLength={6}
              />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input 
                type={showPasswords ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
                minLength={6}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', cursor: 'pointer' }} onClick={() => setShowPasswords(!showPasswords)}>
              <input 
                type="checkbox" 
                checked={showPasswords} 
                onChange={() => {}} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', userSelect: 'none' }}>Show passwords</span>
            </div>
            {passwordError && <p style={{ color: 'var(--oxblood)', fontSize: '13px', margin: '0 0 16px' }}>{passwordError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowPasswordModal(false)} disabled={passwordLoading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Profile;
