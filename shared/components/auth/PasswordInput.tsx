"use client";

import React, { useState } from 'react';
import { Icon } from '../../../shared/components/ui/Icon';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function PasswordInput({ label, className = '', ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="w-full flex flex-col">
      <label className="text-[16px] font-medium text-secondary-800 mb-[8px]">
        {label}
      </label>

      <div className="
        w-full 
        h-[65px] 
        rounded-[16px] 
        bg-secondary-100 
        flex 
        items-center 
        justify-between 
        px-[24px] 
        border-2 
        border-transparent
        hover:bg-secondary-200 
        focus-within:bg-secondary-100 
        focus-within:border-secondary-500 
        transition-all 
        duration-200
      ">
        <input
          type={isVisible ? 'text' : 'password'}
          className={`
            w-full 
            h-full 
            bg-transparent 
            text-secondary-900 
            text-[16px] 
            placeholder:text-secondary-500 
            outline-none 
            pr-2 
            ${className}
          `}
          {...props}
        />

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="
            text-secondary-500 
            hover:text-secondary-800 
            active:text-secondary-900 
            transition-colors 
            cursor-pointer 
            flex 
            items-center 
            justify-center 
            shrink-0
          "
        >
          <Icon name={isVisible ? 'visibility_off' : 'visibility'} className="text-[24px]" />
        </button>
      </div>
    </div>
  );
}