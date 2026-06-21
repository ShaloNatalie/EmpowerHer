import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const AdminDashboard = () => {
  const stats = {
    articles: 5,
    facilities: 5,
    feedback: 3
  };

  const userFeedbackList = [
    { id: 1, user: 'Mary O.', message: 'The Swahili language toggle really helped my grandmother understand the steps!', rating: '⭐⭐⭐⭐⭐' },
    { id: 2, user: 'Faith K.', message: 'Can you add clinic telephone details for Mombasa County hospitals?', rating: '⭐⭐⭐⭐' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="masthead-row">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '500' }}>
            Admin Dashboard 🛠️
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Manage database directories, educational posts, and view community feedback.
          </p>
        </div>
        <div className="stamp">Admin Area</div>
      </div>

      {/* Grid Stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div className="card text-center" style={{ padding: '12px', border: '1px solid var(--line)', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--oxblood)' }}>{stats.articles}</h3>
          <span className="mono-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Articles</span>
        </div>
        <div className="card text-center" style={{ padding: '12px', border: '1px solid var(--line)', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--oxblood)' }}>{stats.facilities}</h3>
          <span className="mono-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Clinics</span>
        </div>
        <div className="card text-center" style={{ padding: '12px', border: '1px solid var(--line)', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--oxblood)' }}>{stats.feedback}</h3>
          <span className="mono-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Feedback</span>
        </div>
      </div>

      {/* Admin Modules */}
      <div>
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '600', marginBottom: '16px' }}>Directory & Content Tools</h3>
        
        <div className="zine-grid">
          <Link to="/admin/education" className="zine-card">
            <span className="corner" />
            <span className="no">01</span>
            <h4>Manage Educational Library</h4>
            <p>Create, edit, or remove articles on symptoms, risks, and prevention.</p>
          </Link>
          <Link to="/admin/facilities" className="zine-card alt">
            <span className="corner" />
            <span className="no">02</span>
            <h4>Manage Screening Facilities</h4>
            <p>Add or adjust local screening centers, maps, and telephone data.</p>
          </Link>
        </div>
      </div>

      {/* View User Feedback Section */}
      <div className="card" style={{ border: '1px solid var(--line)', backgroundColor: 'white', padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', backgroundColor: 'var(--mustard)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '600', marginBottom: '16px', color: 'var(--ink)' }}>
          💬 Community Feedback
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {userFeedbackList.map((feed) => (
            <div key={feed.id} style={{
              padding: '12px',
              backgroundColor: 'var(--paper)',
              borderLeft: '2px solid var(--coral)',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <strong>{feed.user}</strong>
                <span style={{ color: 'var(--coral)' }}>{feed.rating}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>"{feed.message}"</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <Link to="/dashboard">
          <Button variant="secondary">Exit Admin Area</Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
