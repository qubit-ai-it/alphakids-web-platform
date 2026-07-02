import React from 'react';

export type IconName = 'close' | 'visibility' | 'visibility_off' | 'google' | 'apple' | 'person' | 'account_circle' | 'badge' | 'logout' | 'home' | 'refresh' | 'settings' | 'chevron_left' | 'chevron_right' | 'menu_open' | 'menu' | 'expand_more' | 'expand_less' | 'add_a_photo' | 'auto_stories' | 'camera_alt' | 'document_scanner' | 'mic' | 'check_circle' | 'cancel' | 'psychology' | 'star' | 'school' | 'shopping_cart' | 'add' | 'remove' | 'arrow_forward' | 'check' | 'kid_star' | 'stadia_metric' | 'diversity_3' | 'bar_chart' | 'security' | 'qr_code_scanner' | 'person_add' | 'notifications';

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