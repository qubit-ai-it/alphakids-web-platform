import React from 'react';
import { Icon } from '../../../shared/components/ui/Icon';

interface SocialButtonProps {
  provider: 'google' | 'apple';
}

export function SocialButton({ provider }: SocialButtonProps) {
  return (
    <button
      type="button"
      className="
      w-full 
      h-[65px] border border-secondary-300 
      rounded-[16px] flex items-center justify-center 
      bg-white text-secondary-900 
      transition-all duration-200 
      hover:bg-secondary-100 
      hover:border-secondary-400 
      active:bg-secondary-200 
      active:scale-[0.98] 
      cursor-pointer text-[24px]"
    >
      <Icon name={provider} />
    </button>
  );
}