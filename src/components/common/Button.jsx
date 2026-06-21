import React from 'react';
import '../../styles/global.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      style={{
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
    >
      {children}
    </button>
  );
};

export default Button;
