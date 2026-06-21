import React from 'react';
import '../../styles/global.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, name }) => {
  return (
    <div style={{ marginBottom: '16px', width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          fontSize: '0.9rem',
          color: 'var(--text-primary)'
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-field"
      />
    </div>
  );
};

export default Input;
