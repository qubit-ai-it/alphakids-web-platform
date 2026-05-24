import React from 'react';
import { Icon } from '../ui/Icon';

interface SocialButtonProps {
  provider: 'google' | 'apple';
}

export function SocialButton({ provider }: SocialButtonProps) {
  const handleClick = () => {
    if (provider === 'google') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
      window.location.href = `${apiUrl}/auth/google`;
    }
  };

  return (
    <button type="button" className="btn-auth-social" onClick={handleClick}>
      <Icon name={provider} />
    </button>
  );
}