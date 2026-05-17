import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col">
      {/* Modificado a text-[16px] para mantener simetría visual */}
      <label className="text-[16px] font-medium text-secondary-800 mb-[8px]">
        {label}
      </label>

      <div className="
        w-full 
        h-[65px] 
        rounded-[16px] 
        bg-secondary-100 
        px-[24px] 
        flex 
        items-center 
        hover:bg-secondary-200 
        focus-within:bg-secondary-100 
        focus-within:ring-2 
        focus-within:ring-primary-500/50 
        transition-all 
        duration-200
      ">
        <input
          className={`
            w-full 
            h-full 
            bg-transparent 
            text-secondary-900 
            text-[16px] 
            placeholder:text-secondary-500 
            outline-none 
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
}