'use client';

import React from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { ProfileForm } from '@/features/profile/components/ProfileForm';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <Modal>
      <ProfileForm onClose={onClose} />
    </Modal>
  );
}
