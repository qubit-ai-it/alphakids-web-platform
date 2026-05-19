import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col">
      <label className="label-auth">
        {label}
      </label>

      <div className="input-auth-wrapper">
        <input
          className={`input-auth-text ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}