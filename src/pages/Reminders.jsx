import React, { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { requestNotificationPermission, scheduleLocalNotification } from '../services/notifications';

const Reminders = () => {
  const [reminders, setReminders] = useState([
    { id: 1, type: 'Monthly Check', day: 1, time: '08:00 AM', status: 'Active' },
    { id: 2, type: 'Awareness Fact Day', day: 15, time: '12:00 PM', status: 'Active' }
  ]);

  const [day, setDay] = useState(1);
  const [time, setTime] = useState('08:00');
  const [notifPermission, setNotifPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const handleRequestPermission = async () => {
    const status = await requestNotificationPermission();
    setNotifPermission(status);
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    const newRem = {
      id: Date.now(),
      type: 'Monthly Check',
      day: parseInt(day),
      time: time,
      status: 'Active'
    };

    setReminders([...reminders, newRem]);
    
    if (notifPermission === 'granted') {
      scheduleLocalNotification('EmpowerHer Reminder Scheduled!', {
        body: `We will remind you on day ${day} of every month at ${time}.`
      });
    }
  };

  const handleDeleteReminder = (id) => {
    setReminders(reminders.filter(rem => rem.id !== id));
  };

  const handleToggleReminder = (id) => {
    setReminders(reminders.map(rem => 
      rem.id === id ? { ...rem, status: rem.status === 'Active' ? 'Disabled' : 'Active' } : rem
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="masthead-row">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '500' }}>
            Reminders 🔔
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            One nudge a month, so checking yourself stays a habit, not an afterthought.
          </p>
        </div>
        <div className="stamp">Alert Settings</div>
      </div>

      {/* Permissions Helper */}
      {notifPermission !== 'granted' && (
        <div style={{
          backgroundColor: 'var(--paper-deep)',
          padding: '16px',
          border: '1px solid var(--line)',
          borderLeft: '4px solid var(--coral)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            EmpowerHer needs browser permission to send you monthly push alerts.
          </p>
          <Button variant="primary" onClick={handleRequestPermission}>Grant Notification Access</Button>
        </div>
      )}

      {/* Add Reminder Form */}
      <form onSubmit={handleAddReminder} className="card d-flex flex-column gap-2" style={{ border: '1px solid var(--line)', backgroundColor: 'white', padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', backgroundColor: 'var(--oxblood)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '600' }}>Schedule Custom Reminder</h3>
        
        <div className="form-row-responsive">
          <Input
            label="Day of Month (1-31)"
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="1"
            required
          />
          <Input
            label="Time (Daily)"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        
        <div style={{ marginTop: '8px' }}>
          <Button type="submit" variant="primary">Add Reminder</Button>
        </div>
      </form>

      {/* Reminders List */}
      <div>
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '600', marginBottom: '16px' }}>
          Your Scheduled Alerts
        </h3>

        <div className="zine-grid">
          {reminders.length === 0 ? (
            <div className="zine-card">
              <p style={{ color: 'var(--text-muted)' }}>No reminders set yet.</p>
            </div>
          ) : (
            reminders.map((rem, idx) => (
              <div key={rem.id} className={`zine-card ${idx % 3 === 1 ? 'alt' : idx % 3 === 2 ? 'alt2' : ''}`}>
                <span className="corner" />
                <span className="no">Alert #{idx + 1}</span>
                
                <span className="mono-label" style={{ color: 'var(--coral)', display: 'block', marginBottom: '4px' }}>
                  {rem.type}
                </span>
                
                <h4 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: '600' }}>Day {rem.day} at {rem.time}</h4>
                
                <div className="d-flex justify-between align-center mt-2">
                  <span className={`badge ${rem.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                    {rem.status}
                  </span>
                  
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleToggleReminder(rem.id)}
                      style={{ color: 'var(--oxblood)', fontWeight: '600', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      {rem.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                    <span style={{ color: 'var(--line)' }}>|</span>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      style={{ color: 'var(--coral)', fontWeight: '600', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;
