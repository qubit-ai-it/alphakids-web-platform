'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Modal } from '@/shared/components/ui/Modal';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Button } from '@/shared/components/ui/Button';

const features = [
  {
    icon: 'abc',
    title: 'Banco de Palabras',
    desc: 'Gestioná vocabulario por niveles: desde inicial hasta experto, con imágenes y audio.',
  },
  {
    icon: 'assignment_turned_in',
    title: 'Asignaciones',
    desc: 'Asignale palabras a cada alumno, seguí su progreso y monitoreá resultados en tiempo real.',
  },
  {
    icon: 'diversity_3',
    title: 'Gestión de Alumnos',
    desc: 'Administrá grados, secciones y alumnos con datos completos y control de estado.',
  },
  {
    icon: 'bar_chart',
    title: 'Métricas y Reportes',
    desc: 'Visualizá el rendimiento por sección, alumno y período con gráficos claros.',
  },
  {
    icon: 'school',
    title: 'Múltiples Roles',
    desc: 'Director, docente y apoderado: cada rol con su vista y permisos específicos.',
  },
  {
    icon: 'business',
    title: 'Multiinstitución',
    desc: 'Una plataforma que soporta múltiples instituciones educativas de forma independiente.',
  },
];

const steps = [
  {
    num: '1',
    title: 'Creá la institución',
    desc: 'Registrá tu colegio o jardín en segundos. Configurá grados, secciones y docentes.',
  },
  {
    num: '2',
    title: 'Cargá alumnos y palabras',
    desc: 'Importá tus alumnos y empezá a construir el banco de palabras con imágenes y audio.',
  },
  {
    num: '3',
    title: 'Asigná y monitoreá',
    desc: 'Asignale palabras a cada alumno, seguí su progreso y ajustá la dificultad según avance.',
  },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
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

  if (isAuthenticated) {
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
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-[24px] py-[16px]">
          <div className="flex items-center gap-[10px]">
            <span className="material-symbols-outlined text-primary-500 text-[32px]">auto_stories</span>
            <span className="text-[22px] font-bold text-secondary-900">AlphaKids</span>
          </div>
          <div className="flex items-center gap-[24px]">
            <a href="#features" className="text-[14px] text-secondary-600 hover:text-secondary-900 hidden sm:inline font-medium">Características</a>
            <a href="#how-it-works" className="text-[14px] text-secondary-600 hover:text-secondary-900 hidden sm:inline font-medium">Cómo funciona</a>
            <Button size="sm" onClick={() => setIsOpen(true)}>
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 pt-[120px] pb-[80px] md:pt-[140px] md:pb-[100px]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[10%] left-[5%] text-[80px] text-white">auto_stories</div>
          <div className="absolute top-[20%] right-[10%] text-[60px] text-white">star</div>
          <div className="absolute bottom-[15%] left-[15%] text-[50px] text-white">psychology</div>
          <div className="absolute bottom-[25%] right-[20%] text-[70px] text-white">school</div>
        </div>
        <div className="max-w-[1200px] mx-auto px-[24px] relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-[8px] bg-white/20 backdrop-blur-sm rounded-full px-[20px] py-[8px] mb-[32px]">
              <span className="material-symbols-outlined text-[18px] text-white">stadia_metric</span>
              <span className="text-[14px] text-white font-medium">Plataforma educativa para nivel inicial y primario</span>
            </div>
            <h1 className="text-[48px] md:text-[64px] font-extrabold text-white leading-tight mb-[20px]">
              Aprendizaje de palabras
              <br />
              <span className="text-yellow-300">que cobra vida</span>
            </h1>
            <p className="text-[18px] md:text-[20px] text-white/90 max-w-[640px] mx-auto mb-[40px] leading-relaxed">
              La plataforma que ayuda a docentes y colegios a gestionar el aprendizaje de vocabulario
              con asignaciones personalizadas, seguimiento por alumno y métricas claras.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-[16px]">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-secondary-100 min-w-[200px] text-[16px] font-bold" onClick={() => setIsOpen(true)}>
                Iniciar Sesión
              </Button>
              <a
                href="#features"
                className="inline-flex items-center gap-[8px] text-white/90 hover:text-white text-[16px] font-medium px-[24px] py-[12px] rounded-[8px] border border-white/30 hover:border-white/50 transition-all"
              >
                <span>Conocé más</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="py-[80px] md:py-[100px] bg-secondary-50">
        <div className="max-w-[1200px] mx-auto px-[24px]">
          <div className="text-center mb-[60px]">
            <h2 className="text-[36px] md:text-[40px] font-extrabold text-secondary-900 mb-[16px]">
              Todo lo que necesitás en un solo lugar
            </h2>
            <p className="text-[16px] md:text-[18px] text-secondary-600 max-w-[600px] mx-auto">
              Una plataforma pensada para docentes, directores y familias que impulsan el aprendizaje infantil.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {features.map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-shadow duration-200">
                <div className="w-[48px] h-[48px] rounded-[12px] bg-primary-100 flex items-center justify-center mb-[16px]">
                  <span className="material-symbols-outlined text-[24px] text-primary-600">{f.icon}</span>
                </div>
                <h3 className="text-[18px] font-bold text-secondary-900 mb-[8px]">{f.title}</h3>
                <p className="text-[14px] text-secondary-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-[60px] md:py-[80px] bg-white">
        <div className="max-w-[1000px] mx-auto px-[24px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px] text-center">
            {[
              { icon: 'auto_stories', value: '5 niveles', label: 'de dificultad' },
              { icon: 'diversity_3', value: 'Ilimitados', label: 'alumnos por institución' },
              { icon: 'bar_chart', value: 'Tiempo real', label: 'métricas y reportes' },
            ].map((s) => (
              <div key={s.label}>
                <span className="material-symbols-outlined text-[40px] text-primary-500 mb-[12px] block">{s.icon}</span>
                <p className="text-[28px] font-extrabold text-secondary-900">{s.value}</p>
                <p className="text-[14px] text-secondary-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-[80px] md:py-[100px] bg-secondary-50">
        <div className="max-w-[900px] mx-auto px-[24px]">
          <div className="text-center mb-[60px]">
            <h2 className="text-[36px] md:text-[40px] font-extrabold text-secondary-900 mb-[16px]">
              Empezá en 3 pasos
            </h2>
            <p className="text-[16px] md:text-[18px] text-secondary-600 max-w-[500px] mx-auto">
              Configurá tu institución y empezá a trabajar en minutos.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-[32px] items-start">
            {steps.map((s, i) => (
              <div key={s.num} className="flex-1 text-center">
                <div className="w-[56px] h-[56px] rounded-full bg-primary-500 text-white text-[22px] font-bold flex items-center justify-center mx-auto mb-[20px] shadow-lg">
                  {s.num}
                </div>
                <h3 className="text-[18px] font-bold text-secondary-900 mb-[8px]">{s.title}</h3>
                <p className="text-[14px] text-secondary-600 leading-relaxed max-w-[280px] mx-auto">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-[80px] md:py-[100px] bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-[700px] mx-auto px-[24px] text-center">
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-white mb-[16px]">
            ¿Listo para transformar el aprendizaje?
          </h2>
          <p className="text-[16px] md:text-[18px] text-white/80 mb-[36px] max-w-[480px] mx-auto">
            Unite a las instituciones que ya confían en AlphaKids para potenciar el vocabulario de sus alumnos.
          </p>
          <Button size="lg" className="bg-white text-primary-600 hover:bg-secondary-100 min-w-[240px] text-[16px] font-bold" onClick={() => setIsOpen(true)}>
            Iniciar Sesión
          </Button>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-secondary-900 text-secondary-400 py-[48px]">
        <div className="max-w-[1200px] mx-auto px-[24px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-[24px]">
            <div className="flex items-center gap-[10px]">
              <span className="material-symbols-outlined text-primary-400 text-[28px]">auto_stories</span>
              <span className="text-[20px] font-bold text-white">AlphaKids</span>
            </div>
            <p className="text-[13px] text-center md:text-left">
              &copy; {new Date().getFullYear()} AlphaKids. Plataforma educativa para nivel inicial y primario.
            </p>
          </div>
        </div>
      </footer>

      {/* ============ LOGIN MODAL ============ */}
      {isOpen && (
        <Modal>
          <LoginForm onClose={() => setIsOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
