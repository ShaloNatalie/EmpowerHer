import React from 'react';
import '../../styles/global.css';

const Footer = () => {
  return (
    <footer style={{
      padding: '24px 16px',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--bg-tertiary)',
      textAlign: 'center',
      fontSize: '0.8rem',
      color: 'var(--text-muted)'
    }}>
      <p>© {new Date().getFullYear()} EmpowerHer Project I</p>
      <p style={{ marginTop: '4px' }}>Educational and Preventive Breast Health Platform</p>
    </footer>
  );
};

export default Footer;
