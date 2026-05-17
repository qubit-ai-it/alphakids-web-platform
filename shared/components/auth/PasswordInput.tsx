"use client";

import React, { useState } from 'react';
import { Icon } from '../ui/Icon';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function PasswordInput({ label, className = '', ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="w-full flex flex-col">
      <label className="label-auth">
        {label}
      </label>

      <div className="input-auth-wrapper input-auth-wrapper-auth-password">
        <input
          type={isVisible ? 'text' : 'password'}
          className={`input-auth-text input-auth-text-password ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="btn-auth-visibility"
        >
          <Icon name={isVisible ? 'visibility_off' : 'visibility'} className="text-[24px]" />
        </button>
      </div>
    </div>
  );
}