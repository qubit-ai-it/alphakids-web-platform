import React from 'react';

export type IconName = 'close' | 'visibility' | 'visibility_off' | 'google' | 'apple' | 'person' | 'account_circle' | 'badge' | 'logout' | 'home' | 'refresh';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export function Icon({ name, className = '', size }: IconProps) {
  const style = size ? { fontSize: `${size}px`, width: `${size}px`, height: `${size}px` } : undefined;

  if (name === 'google' || name === 'apple') {
    const brandClass = name === 'google' ? 'fa-google' : 'fa-apple';
    return (
      <i
        className={`fa-brands ${brandClass} flex items-center justify-center ${className}`}
        style={style}
      />
    );
  }

  return (
    <span
      className={`material-symbols-outlined select-none flex items-center justify-center ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}