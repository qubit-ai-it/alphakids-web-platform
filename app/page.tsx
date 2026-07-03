'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/shared/hooks/useAuth';
import { useToast } from '@/shared/contexts/ToastContext';
import { Modal } from '@/shared/components/ui/Modal';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterParentForm } from '@/features/auth/components/RegisterParentForm';
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
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const isOnlyParent = user?.roles?.length === 1 && user.roles[0].role.name === 'parent';

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('login') === 'true') {
        setAuthModalMode('login');
      }
      if (url.searchParams.get('expired') === 'true') {
        addToast('error', 'Sesión Expirada', 'Tu sesión ha caducado o ha sido revocada. Por favor, inicia sesión nuevamente.');
      }
      if (url.searchParams.has('login') || url.searchParams.has('expired')) {
        url.searchParams.delete('login');
        url.searchParams.delete('expired');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [addToast]);

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
              isOnlyParent ? (
                <Button size="sm" onClick={() => logout()}>
                  Cerrar Sesión
                </Button>
              ) : (
                <Button size="sm" onClick={() => router.push('/dashboard')}>
                  Volver al Dashboard
                </Button>
              )
            ) : (
              <Button size="sm" variant="primary" onClick={() => setAuthModalMode('login')}>
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
      <LeadForm onOpenRegister={() => setAuthModalMode('register')} />
      <Footer />

      {authModalMode === 'login' && !isAuthenticated && (
        <Modal>
          <LoginForm 
            onClose={() => setAuthModalMode(null)} 
            onSwitchToRegister={() => setAuthModalMode('register')}
          />
        </Modal>
      )}

      {authModalMode === 'register' && !isAuthenticated && (
        <Modal>
          <RegisterParentForm 
            onClose={() => setAuthModalMode(null)} 
            onSwitchToLogin={() => setAuthModalMode('login')}
          />
        </Modal>
      )}

    </div>
  );
}
