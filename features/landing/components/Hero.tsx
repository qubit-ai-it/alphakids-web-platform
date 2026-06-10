import { heroContent } from '@/features/landing/data/content';

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/hero_alphakids.png)' }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-primary-800/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full pt-[120px] pb-[80px] md:pt-[140px] md:pb-[100px]">
        <div className="max-w-[1200px] mx-auto px-[24px]">
          <div className="max-w-[640px] mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-[8px] bg-white/20 backdrop-blur-sm rounded-full px-[20px] py-[8px] mb-[32px]">
              <span className="material-symbols-outlined text-[18px] text-white">school</span>
              <span className="text-[14px] text-white font-medium">{heroContent.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-[40px] md:text-[56px] font-extrabold text-white leading-tight mb-[20px]">
              {heroContent.title}
              <br />
              <span className="text-yellow-300">{heroContent.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[16px] md:text-[18px] text-white/90 mb-[40px] leading-relaxed">
              {heroContent.subtitle}
            </p>

            {/* CTA */}
            <a
              href="#lead-form"
              className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-secondary-100 rounded-[10px] px-[32px] py-[14px] text-[16px] font-bold transition-colors"
            >
              {heroContent.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
