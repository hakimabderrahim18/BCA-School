import React from 'react';

/**
 * Champ Honeypot invisible pour la protection anti-spam des formulaires
 * Inaccessible aux utilisateurs humains, mais rempli par les robots spammeurs automatiques
 */
export const HoneypotField = ({ value, onChange, name = 'website_hp' }) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        opacity: 0,
        pointerEvents: 'none',
        left: '-9999px',
        top: '-9999px',
        height: 0,
        width: 0,
        zIndex: -1,
      }}
    >
      <label htmlFor={name}>Ne pas remplir ce champ si vous êtes un humain</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
};
