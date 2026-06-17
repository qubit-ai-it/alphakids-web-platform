'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/shared/hooks/useAuth';
import { Modal } from '@/shared/components/ui/Modal';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Button } from '@/shared/components/ui/Button';
import Hero from '@/features/landing/components/Hero';
import DemoVideo from '@/features/landing/components/DemoVideo';
import GameModes from '@/features/landing/components/GameModes';
import ProductShowcase from '@/features/landing/components/ProductShowcase';
import HowItWorks from '@/features/landing/components/HowItWorks';
import Pricing from '@/features/landing/components/Pricing';
import ComparisonTable from '@/features/landing/components/ComparisonTable';
import FAQ from '@/features/landing/components/FAQ';
import LeadForm from '@/features/landing/components/LeadForm';
import Footer from '@/features/landing/components/Footer';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      {/* ============ NAVBAR ============ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-[24px] py-[16px]">
          <div className="flex items-center gap-[10px]">
            <Image
              src="/assets/alphi.png"
              alt="AlphaKids"
              width={40}
              height={40}
              className="rounded-[10px] object-cover"
            />
            <span className="text-[22px] font-bold text-secondary-900">AlphaKids</span>
          </div>
          <div className="flex items-center gap-[24px]">
            <a href="#game-modes" className="text-[14px] text-secondary-600 hover:text-secondary-900 hidden sm:inline font-medium">Modos</a>
            <a href="#product-showcase" className="text-[14px] text-secondary-600 hover:text-secondary-900 hidden sm:inline font-medium">App/Web</a>
            <a href="#how-it-works" className="text-[14px] text-secondary-600 hover:text-secondary-900 hidden sm:inline font-medium">Cómo funciona</a>
            <a href="#pricing" className="text-[14px] text-secondary-600 hover:text-secondary-900 hidden sm:inline font-medium">Precios</a>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => router.push('/dashboard')}>
                Volver al Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsOpen(true)}>
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </nav>

      <Hero />
      <DemoVideo />
      <GameModes />
      <ProductShowcase />
      <HowItWorks />
      <Pricing />
      <ComparisonTable />
      <FAQ />
      <LeadForm />
      <Footer />

      {isOpen && !isAuthenticated && (
        <Modal>
          <LoginForm onClose={() => setIsOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
