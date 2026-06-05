import { heroContent } from '@/features/landing/data/content';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 pt-[120px] pb-[80px] md:pt-[140px] md:pb-[100px]">
      {/* Floating icon decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[10%] left-[5%] text-[80px] text-white">
          <span className="material-symbols-outlined text-[80px]">auto_stories</span>
        </div>
        <div className="absolute top-[20%] right-[10%] text-[60px] text-white">
          <span className="material-symbols-outlined text-[60px]">star</span>
        </div>
        <div className="absolute bottom-[15%] left-[15%] text-[50px] text-white">
          <span className="material-symbols-outlined text-[50px]">psychology</span>
        </div>
        <div className="absolute bottom-[25%] right-[20%] text-[70px] text-white">
          <span className="material-symbols-outlined text-[70px]">school</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-[24px] relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-[8px] bg-white/20 backdrop-blur-sm rounded-full px-[20px] py-[8px] mb-[32px]">
            <span className="material-symbols-outlined text-[18px] text-white">stadia_metric</span>
            <span className="text-[14px] text-white font-medium">{heroContent.badge}</span>
          </div>

          {/* Title */}
          <h1 className="text-[48px] md:text-[64px] font-extrabold text-white leading-tight mb-[20px]">
            {heroContent.title}
            <br />
            <span className="text-yellow-300">{heroContent.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[18px] md:text-[20px] text-white/90 max-w-[640px] mx-auto mb-[40px] leading-relaxed">
            {heroContent.subtitle}
          </p>

          {/* CTA — native anchor for server-component-safe scroll */}
          <a
            href="#lead-form"
            className="btn btn-primary btn-xl bg-white text-primary-600 hover:bg-secondary-100 min-w-[240px] text-[16px] font-bold inline-flex"
          >
            {heroContent.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
