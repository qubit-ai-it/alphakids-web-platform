'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';
import { Icon } from '@/shared/components/ui/Icon';
import Image from 'next/image';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-[600px] w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-secondary-100">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-500">
            <Icon name="check_circle" size={48} />
          </div>
        </div>
        
        <h1 className="text-[28px] md:text-[36px] font-bold text-secondary-900 mb-[16px] leading-tight">
          ¡Cuenta creada con éxito!
        </h1>
        
        <p className="text-[16px] md:text-[18px] text-secondary-600 mb-[32px] max-w-xl mx-auto leading-relaxed">
          Para probar nuestra aplicación, escanea el siguiente código QR desde tu celular. Una vez descargada, <span className="font-bold text-secondary-900">inicia sesión con la cuenta que acabas de crear</span>.
        </p>

        <div className="bg-secondary-50 p-[24px] rounded-[24px] inline-flex flex-col items-center mb-[32px] border border-secondary-200">
          <div className="w-[200px] h-[200px] bg-white border-2 border-dashed border-secondary-300 rounded-[16px] flex items-center justify-center flex-col text-secondary-500 mb-[16px]">
            <Icon name="qr_code_scanner" size={48} className="mb-2 text-primary-400" />
            <span className="text-[14px] font-medium">QR de Descarga</span>
          </div>
          <span className="text-[13px] text-secondary-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm">Escanea con tu cámara</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-[16px] justify-center items-center w-full">
          <Button size="lg" onClick={() => router.push('/')} className="w-full sm:w-auto">
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
