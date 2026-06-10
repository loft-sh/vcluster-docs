import React from 'react';

export default function Mark({children}) {
  return (
    <span
      style={{
        backgroundColor: 'rgb(246, 247, 248)',
        border: '0.1rem solid rgba(0, 0, 0, 0.1)',
        borderRadius: '0.4rem',
        color: '#050b24',
        padding: '0.2rem',
      }}>
      {children}
    </span>
  );
}