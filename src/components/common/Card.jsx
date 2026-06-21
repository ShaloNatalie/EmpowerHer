import React from 'react';
import '../../styles/global.css';

const Card = ({ children, title, subtitle, onClick }) => {
  return (
    <div className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {title && <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--secondary)' }}>{title}</h3>}
      {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{subtitle}</p>}
      <div style={{ marginTop: title || subtitle ? '8px' : '0' }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
