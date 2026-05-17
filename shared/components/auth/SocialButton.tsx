import React from 'react';
import { Icon } from '../ui/Icon';

interface SocialButtonProps {
  provider: 'google' | 'apple';
}

export function SocialButton({ provider }: SocialButtonProps) {
  return (
    <button
      type="button"
      className="btn-auth-social"
    >
      <Icon name={provider} />
    </button>
  );
}