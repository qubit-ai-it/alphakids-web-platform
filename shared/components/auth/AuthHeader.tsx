import React from 'react';

export function AuthHeader() {
  return (
    <div className="flex flex-col items-center w-full mb-[24px]">
      <div className="w-full flex justify-end">
        <button className="text-sm font-medium text-slate-500 hover:text-slate-900 px-2 py-1">
          close
        </button>
      </div>
      <div className="mb-[16px]">
        <img src="/path/to/your/logo.png" alt="App Logo" className="w-[48px] h-[48px]" />
      </div>
      <h1 className="text-[36px] font-extrabold text-black leading-tight">
        Iniciar Sesión
      </h1>
    </div>
  );
}