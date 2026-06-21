import React, { useState } from 'react';
import Button from '../components/common/Button';

const Records = () => {
  const [records, setRecords] = useState([
    { id: 1, date: '2026-05-15', notes: 'Completed self-examination in the morning. Breasts feel normal and healthy. No skin dimpling or bumps noted.', status: 'Normal' },
    { id: 2, date: '2026-06-15', notes: 'No unusual changes observed. Scheduled clinic appointment for annual screening.', status: 'Normal' }
  ]);

  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!notes.trim()) return;

    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      notes: notes,
      status: 'Normal'
    };

    setRecords([newRecord, ...records]);
    setNotes('');
  };

  const handleStartEdit = (rec) => {
    setEditingId(rec.id);
    setEditNotes(rec.notes);
  };

  const handleSaveEdit = (id) => {
    setRecords(records.map(r => r.id === id ? { ...r, notes: editNotes } : r));
    setEditingId(null);
    setEditNotes('');
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this check log?")) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="masthead-row">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '500' }}>
            History Log 📝
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            A private log of your monthly checks, so you can track your own patterns.
          </p>
        </div>
        <div className="stamp">Confidential Log</div>
      </div>

      {/* Add Record Form */}
      <form onSubmit={handleAdd} className="card d-flex flex-column gap-2" style={{ border: '1px solid var(--line)', backgroundColor: 'white', padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', backgroundColor: 'var(--mustard)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '600' }}>Log Today's Exam</h3>
        <div>
          <label className="input-label">Observations / Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you felt/saw. e.g. Checked in shower. Left and right breasts feel uniform. No lumps."
            style={{
              width: '100%',
              height: '80px',
              padding: '12px',
              border: '1.5px solid var(--line)',
              backgroundColor: 'var(--paper)',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              marginBottom: '12px'
            }}
            required
          />
        </div>
        <Button type="submit" variant="primary">Add Record</Button>
      </form>

      {/* History Log List */}
      <div>
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '600', marginBottom: '16px' }}>
          Your Entries
        </h3>
        
        <div className="zine-grid">
          {records.length === 0 ? (
            <div className="zine-card">
              <p style={{ color: 'var(--text-muted)' }}>No records logged yet. Try adding one above.</p>
            </div>
          ) : (
            records.map((rec, idx) => (
              <div key={rec.id} className={`zine-card ${idx % 3 === 1 ? 'alt' : idx % 3 === 2 ? 'alt2' : ''}`}>
                <span className="corner" />
                <span className="no" style={{ fontFamily: 'var(--font-mono)' }}>Entry #{records.length - idx}</span>
                
                <span className="mono-label" style={{ color: 'var(--coral)', display: 'block', marginBottom: '4px' }}>
                  {rec.date}
                </span>
                
                <h4 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: '600' }}>Status: {rec.status}</h4>
                
                {editingId === rec.id ? (
                  <div className="d-flex flex-column gap-1 mt-1">
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      style={{
                        width: '100%',
                        height: '70px',
                        padding: '8px',
                        border: '1.5px solid var(--coral)',
                        backgroundColor: 'var(--paper)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        resize: 'none',
                        outline: 'none'
                      }}
                    />
                    <div className="d-flex gap-1 mt-1">
                      <Button variant="primary" onClick={() => handleSaveEdit(rec.id)}>Save</Button>
                      <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.55' }}>
                      {rec.notes}
                    </p>
                    <div className="d-flex gap-1 mt-2" style={{ justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleStartEdit(rec)}
                        style={{ color: 'var(--oxblood)', fontWeight: '600', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Edit
                      </button>
                      <span style={{ color: 'var(--line)' }}>|</span>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        style={{ color: 'var(--coral)', fontWeight: '600', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
