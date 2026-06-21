import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="text-center d-flex flex-column align-center gap-2" style={{ padding: '40px 16px' }}>
      <div style={{ fontSize: '4rem' }}>⚠️</div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        The page you are looking for might have been moved or is currently unavailable.
      </p>
      
      <div style={{ marginTop: '24px', width: '100%' }}>
        <Link to="/dashboard">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
