import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`w-full 
        h-[65px] 
        bg-primary-500 
        text-white font-sans 
        font-semibold text-[22px] 
        rounded-[16px] 
        transition-all hover:bg-primary-600 
        active:bg-primary-700 
        active:scale-[0.99] 
        cursor-pointer flex items-center 
        justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}