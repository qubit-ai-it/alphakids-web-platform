import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col">
      <label className="label-auth">{label}</label>
      <div className={`input-auth-wrapper ${error ? 'border-red-500' : ''}`}>
        <input
          className={`input-auth-text ${className}`}
          {...props}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
