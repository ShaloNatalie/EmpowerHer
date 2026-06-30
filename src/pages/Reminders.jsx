import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchReminders, saveReminder, deleteReminder } from '../services/firestore';
import { serverTimestamp } from 'firebase/firestore';
import '../styles/reminders.css';

const Reminders = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Reminders list state
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Monthly self-check');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [repeat, setRepeat] = useState('Monthly');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Active');
  
  // Notification states
  const [notifyMethod, setNotifyMethod] = useState('In-app'); // 'In-app' or 'In-app + Browser'
  const [browserPermission, setBrowserPermission] = useState('default');

  // Notice states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);

  // Check initial notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setBrowserPermission(Notification.permission);
    } else {
      setBrowserPermission('unsupported');
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser notifications are not supported on this browser.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
    } catch (err) {
      console.error("Failed to request notification permission:", err);
    }
  };

  // Prefill logic from location state (e.g. from Self-Examination)
  useEffect(() => {
    if (location.state?.prefill) {
      setTitle(location.state.title || '');
      setType(location.state.type || 'Monthly self-check');
      setRepeat(location.state.repeat || 'Monthly');
      setStatus(location.state.status || 'Active');
      if (location.state.method === 'In-app + Browser') setNotifyMethod('In-app + Browser');
      
      // Clear state so it doesn't prefill again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch reminders on load
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchReminders(user.uid)
        .then(data => {
          setReminders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading user reminders:", err);
          setErrorMsg("Failed to load reminders.");
          setLoading(false);
        });
    }
  }, [user]);

  // Helpers to display date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[monthIndex]} ${year}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minute} ${ampm}`;
  };

  // Form handlers
  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    
    setSuccessMsg('');
    setErrorMsg('');

    // Combine date and time to calculate nextDueAt
    let nextDueAt = null;
    if (date && time) {
      const dateTimeString = `${date}T${time}`;
      nextDueAt = new Date(dateTimeString).getTime();
    }

    const browserNotificationEnabled = notifyMethod === 'In-app + Browser' && browserPermission === 'granted';

    const payload = {
      userId: user.uid,
      title,
      type,
      date,
      time,
      repeat,
      notes: note,
      status,
      method: notifyMethod,
      browserNotificationEnabled,
      notificationShown: false,
      nextDueAt,
      updatedAt: serverTimestamp()
    };
    
    if (!editingId) {
      payload.createdAt = serverTimestamp();
    }

    // Optimistic UI updates
    const prevReminders = [...reminders];
    if (editingId) {
      setReminders(reminders.map(r => r.id === editingId ? { ...payload, id: editingId } : r));
      setEditingId(null);
    } else {
      const tempId = `temp-${Date.now()}`;
      setReminders([...reminders, { ...payload, id: tempId }]);
    }

    resetForm();

    try {
      const savedId = await saveReminder(editingId, payload);
      if (!editingId) {
        setReminders(prev => prev.map(r => r.id.toString().startsWith('temp-') ? { ...r, id: savedId } : r));
      }
      if (browserNotificationEnabled) {
        setSuccessMsg("Reminder saved. Browser notification will appear when EmpowerHer is open.");
      } else {
        setSuccessMsg("Reminder saved. It will appear inside the app.");
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Error saving reminder:", err);
      setReminders(prevReminders); // Rollback
      setErrorMsg("Failed to save reminder.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleEditClick = (reminder) => {
    setEditingId(reminder.id);
    setTitle(reminder.title || '');
    setType(reminder.type || 'Monthly self-check');
    setDate(reminder.date || '');
    setTime(reminder.time || '');
    setRepeat(reminder.repeat || 'Monthly');
    setNote(reminder.notes || '');
    setStatus(reminder.status || 'Active');
    setNotifyMethod(reminder.method || 'In-app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStatus = async (id) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    const nextStatus = reminder.status === 'Active' ? 'Off' : 'Active';
    
    // Optimistic update
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, status: nextStatus } : r
    ));

    try {
      await saveReminder(id, { status: nextStatus, updatedAt: serverTimestamp() });
      setSuccessMsg("Reminder updated successfully.");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setReminders(reminders); // rollback on error
      setErrorMsg("Failed to update reminder.");
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleDeleteTrigger = (reminder) => {
    setReminderToDelete(reminder);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (reminderToDelete) {
      const prevReminders = [...reminders];
      setReminders(reminders.filter(r => r.id !== reminderToDelete.id));
      setShowDeleteModal(false);
      const targetId = reminderToDelete.id;
      setReminderToDelete(null);

      try {
        await deleteReminder(targetId);
        setSuccessMsg("Reminder deleted successfully.");
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        console.error(err);
        setReminders(prevReminders); // Rollback
        setErrorMsg("Failed to delete reminder.");
        setTimeout(() => setErrorMsg(''), 3000);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setType('Monthly self-check');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('08:00');
    setRepeat('Monthly');
    setNote('');
    setStatus('Active');
    setNotifyMethod('In-app');
  };

  // Processing Due Today and Upcoming
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Sort reminders by date, then time
  const sortedReminders = [...reminders].sort((a, b) => {
    const dateCompare = (a.date || '').localeCompare(b.date || '');
    if (dateCompare !== 0) return dateCompare;
    return (a.time || '').localeCompare(b.time || '');
  });

  const dueToday = sortedReminders.filter(r => r.date === todayStr && r.status === 'Active');
  const upcoming = sortedReminders.filter(r => r.date !== todayStr || r.status !== 'Active');

  const activeCount = reminders.filter(r => r.status === 'Active').length;
  const activeReminders = reminders.filter(r => r.status === 'Active').sort((a, b) => a.date.localeCompare(b.date));
  const nextReminderText = activeReminders.length > 0 ? formatDate(activeReminders[0].date) : 'Not set';

  const monthlyCheckReminder = reminders.find(r => r.type === 'Monthly self-check' && r.status === 'Active');
  const monthlyCheckText = monthlyCheckReminder ? 'Active' : 'Not set';

  const clinicFollowupReminder = reminders.find(r => r.type === 'Clinic appointment' && r.status === 'Active');
  const clinicFollowupText = clinicFollowupReminder ? 'Active' : 'Not set';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <p className="eyebrow">Section 05</p>
        <h2 className="h1">Breast Health <em>Reminders</em></h2>
        <p className="dek">Set gentle reminders for your monthly self-checks, clinic visits, and follow-up care.</p>
      </div>

      <div className="notice">
        <b>About reminders</b>
        Reminders are here to support your routine. EmpowerHer does not provide diagnosis or medical advice. If you notice unusual changes, please visit a qualified healthcare provider.
      </div>

      {successMsg && (
        <div style={{ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--oxblood)', fontSize: '14px', borderRadius: '4px' }}>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--oxblood)', fontSize: '14px', borderRadius: '4px' }}>
          {errorMsg}
        </div>
      )}

      {/* Summary Row */}
      <div className="summary-row">
        <div className="sum-card">
          <span className="corner"></span>
          <p className="label">Active reminders</p>
          <p className="value">{loading ? '...' : activeCount}</p>
        </div>
        <div className="sum-card alt">
          <span className="corner"></span>
          <p className="label">Next reminder</p>
          <p className="value" style={{ fontSize: '17px' }}>{loading ? '...' : nextReminderText}</p>
        </div>
        <div className="sum-card alt2">
          <span className="corner"></span>
          <p className="label">Monthly self-check</p>
          <p className="value" style={{ fontSize: '17px' }}>{loading ? '...' : monthlyCheckText}</p>
        </div>
        <div className="sum-card">
          <span className="corner"></span>
          <p className="label">Clinic follow-up</p>
          <p className="value" style={{ fontSize: '17px', opacity: clinicFollowupText === 'Not set' ? 0.55 : 1 }}>{loading ? '...' : clinicFollowupText}</p>
        </div>
      </div>

      {/* Layout Split Grid */}
      <div className="layout">
        
        {/* Left Form Panel */}
        <div>
          
          {/* Notification Permission Box */}
          <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid var(--line)', background: 'var(--paper)', borderRadius: '0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Enable browser notifications</h4>
            {browserPermission === 'granted' ? (
              <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>✓ Browser notifications enabled.</div>
            ) : browserPermission === 'denied' ? (
              <div style={{ color: '#ef4444', fontSize: '13px' }}>Notifications are blocked. Please enable them in your browser settings.</div>
            ) : browserPermission === 'unsupported' ? (
              <div style={{ color: '#f59e0b', fontSize: '13px' }}>Browser notifications are not supported on this browser.</div>
            ) : (
              <button type="button" className="btn-secondary" onClick={requestNotificationPermission}>Allow Notifications</button>
            )}
          </div>

          <div className="section-head">
            <h3>{editingId ? 'Edit' : 'New'}</h3>
            <div className="rule"></div>
            <span className="tag">{editingId ? 'Modify reminder' : 'Add reminder'}</span>
          </div>

          <div className="form-card">
            <p className="form-title">{editingId ? 'Modify reminder' : 'Create a reminder'}</p>
            <p className="form-sub">Set it once — we'll do the remembering.</p>
            
            <form onSubmit={handleSaveReminder}>
              <div className="field">
                <label>Reminder title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Monthly self-check" 
                  required 
                />
              </div>

              <div className="field">
                <label>Reminder type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Monthly self-check">Monthly self-check</option>
                  <option value="Clinic appointment">Clinic appointment</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required
                />
              </div>

              <div className="field">
                <label>Time</label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  required
                />
              </div>

              <div className="field">
                <label>Repeat</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="repeat" 
                      value="Once" 
                      checked={repeat === 'Once'} 
                      onChange={(e) => setRepeat(e.target.value)} 
                    /> Once
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="repeat" 
                      value="Monthly" 
                      checked={repeat === 'Monthly'} 
                      onChange={(e) => setRepeat(e.target.value)} 
                    /> Monthly
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Notes</label>
                <textarea 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  placeholder="Optional notes for this reminder."
                />
              </div>

              <div className="field">
                <label>Notify me by</label>
                <div className="choice-row" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                  <label className="choice" style={{ margin: 0 }}>
                    <input 
                      type="radio"
                      name="notifyMethod"
                      value="In-app"
                      checked={notifyMethod === 'In-app'} 
                      onChange={() => setNotifyMethod('In-app')} 
                    /> In-app only
                  </label>
                  <label className="choice" style={{ margin: 0 }}>
                    <input 
                      type="radio" 
                      name="notifyMethod"
                      value="In-app + Browser"
                      checked={notifyMethod === 'In-app + Browser'} 
                      onChange={() => setNotifyMethod('In-app + Browser')} 
                    /> In-app + Browser notification
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Status</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Active" 
                      checked={status === 'Active'} 
                      onChange={(e) => setStatus(e.target.value)} 
                    /> Active
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Off" 
                      checked={status === 'Off'} 
                      onChange={(e) => setStatus(e.target.value)} 
                    /> Off
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save reminder</button>
                <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>

        {/* Right List Panel */}
        <div>
          
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading reminders...</div>
          ) : reminders.length === 0 ? (
            <>
              <div className="section-head">
                <h3>Your reminders</h3>
                <div className="rule"></div>
              </div>
              <div className="empty">
                <h3>No reminders yet.</h3>
                <p>Set a reminder to help make breast self-checks part of your routine.</p>
                <button className="btn-primary" onClick={resetForm}>Create reminder</button>
              </div>
            </>
          ) : (
            <>
              {/* Due Today Section */}
              {dueToday.length > 0 && (
                <>
                  <div className="section-head">
                    <h3>Due Today</h3>
                    <div className="rule"></div>
                    <span className="tag" style={{ color: 'var(--coral)', borderColor: 'var(--coral)' }}>{dueToday.length} active</span>
                  </div>
                  {dueToday.map((rem, idx) => (
                    <div key={rem.id} className={`rem-card ${idx % 2 === 1 ? 'alt' : ''}`} style={{ borderLeft: '4px solid var(--coral)' }}>
                      <span className="corner"></span>
                      <div className="rem-top">
                        <p className="rem-title">{rem.title}</p>
                        <span className="status-pill">{rem.status}</span>
                      </div>
                      <div className="rem-meta">
                        <span>{rem.type}</span>
                        <span>{formatDate(rem.date)}, {formatTime(rem.time)}</span>
                        <span>Repeats {rem.repeat}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', marginTop: '4px', opacity: 0.7 }}>
                        <span>Method: {rem.method || 'In-app'}</span>
                      </div>
                      {rem.notes && <p className="rem-note">{rem.notes}</p>}
                      
                      <div className="rem-actions">
                        <button className="btn-mini primary" onClick={() => handleEditClick(rem)}>Edit</button>
                        <button className="btn-mini" onClick={() => handleToggleStatus(rem.id)}>
                          {rem.status === 'Active' ? 'Turn Off' : 'Turn On'}
                        </button>
                        <button className="btn-mini danger" onClick={() => handleDeleteTrigger(rem)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ height: '30px' }} />
                </>
              )}

              {/* Upcoming Section */}
              <div className="section-head">
                <h3>Upcoming & Inactive</h3>
                <div className="rule"></div>
                <span className="tag">{upcoming.length} total</span>
              </div>
              {upcoming.length === 0 && (
                <div style={{ fontSize: '13px', opacity: 0.6, padding: '10px' }}>No upcoming reminders.</div>
              )}
              {upcoming.map((rem, idx) => (
                <div key={rem.id} className={`rem-card ${idx % 2 === 1 ? 'alt' : ''}`} style={{ opacity: rem.status === 'Off' ? 0.6 : 1 }}>
                  <span className="corner"></span>
                  <div className="rem-top">
                    <p className="rem-title">{rem.title}</p>
                    <span className={`status-pill ${rem.status === 'Off' ? 'off' : ''}`}>
                      {rem.status}
                    </span>
                  </div>
                  <div className="rem-meta">
                    <span>{rem.type}</span>
                    <span>{formatDate(rem.date)}, {formatTime(rem.time)}</span>
                    <span>Repeats {rem.repeat}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', marginTop: '4px', opacity: 0.7 }}>
                    <span>Method: {rem.method || 'In-app'}</span>
                  </div>
                  {rem.notes && <p className="rem-note">{rem.notes}</p>}
                  
                  <div className="rem-actions">
                    <button className="btn-mini primary" onClick={() => handleEditClick(rem)}>Edit</button>
                    <button className="btn-mini" onClick={() => handleToggleStatus(rem.id)}>
                      {rem.status === 'Active' ? 'Turn Off' : 'Turn On'}
                    </button>
                    <button className="btn-mini danger" onClick={() => handleDeleteTrigger(rem)}>Delete</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

      </div>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <div className={`modal-overlay ${showDeleteModal ? 'show' : ''}`}>
        <div className="modal">
          <h4>Delete this reminder?</h4>
          <p>This reminder will be removed from your list. You can create a new one anytime.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="btn-mini danger" style={{ padding: '13px' }} onClick={confirmDelete}>Delete reminder</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reminders;
