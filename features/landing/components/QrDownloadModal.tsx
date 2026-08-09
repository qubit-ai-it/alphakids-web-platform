'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/shared/components/ui/Modal';
import { Icon } from '@/shared/components/ui/Icon';

interface QrDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APP_DOWNLOAD_URL = 'https://alphakids.com/app';
const APP_STORE_URL = 'https://apps.apple.com/app/id000000000';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.alphakids.app';

export function QrDownloadModal({ isOpen, onClose }: QrDownloadModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="
          w-full
          modal-md
          bg-white
          p-[24px]
          sm:p-[36px]
          rounded-[24px]
          shadow-xl
          flex
          flex-col
          relative
          font-sans
        "
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="
            absolute
            top-[24px]
            right-[24px]
            text-secondary-900
            hover:text-secondary-600
            active:scale-90
            transition-all
            duration-200
            cursor-pointer
            flex
            items-center
            justify-center
          "
        >
          <Icon name="close" className="text-[24px]" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="material-symbols-outlined mb-[12px] text-[48px] text-primary-500">
            mark_email_read
          </span>

          <h2 className="text-[24px] sm:text-[28px] font-bold text-secondary-900 leading-tight mb-[12px]">
            ¡Listo! Revisa tu correo
          </h2>

          <p className="text-[14px] sm:text-[15px] text-secondary-600 mb-[24px] max-w-[420px]">
            Te enviamos un correo para confirmar tu dirección. Mientras tanto,
            escanea este QR con tu celular para descargar la app de AlphaKids.
          </p>

          <div className="bg-secondary-50 p-[16px] rounded-[16px] mb-[20px]">
            <QRCodeSVG value={APP_DOWNLOAD_URL} size={180} />
          </div>

          <div className="flex flex-col sm:flex-row gap-[12px] w-full max-w-[360px]">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex-1
                inline-flex
                items-center
                justify-center
                gap-[8px]
                px-[16px]
                py-[12px]
                rounded-[10px]
                border border-secondary-200
                bg-white
                text-secondary-900
                text-[14px]
                font-medium
                hover:bg-secondary-50
                transition-colors
              "
            >
              <span className="material-symbols-outlined text-[20px]">apple</span>
              App Store
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex-1
                inline-flex
                items-center
                justify-center
                gap-[8px]
                px-[16px]
                py-[12px]
                rounded-[10px]
                border border-secondary-200
                bg-white
                text-secondary-900
                text-[14px]
                font-medium
                hover:bg-secondary-50
                transition-colors
              "
            >
              <span className="material-symbols-outlined text-[20px]">android</span>
              Google Play
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              mt-[20px]
              text-[14px]
              text-secondary-600
              hover:text-secondary-900
              font-medium
              transition-colors
              cursor-pointer
            "
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}