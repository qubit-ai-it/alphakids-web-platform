import { howItWorks } from '@/features/landing/data/content';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-[80px] md:py-[100px] bg-secondary-50">
      <div className="max-w-[900px] mx-auto px-[24px]">
        <div className="text-center mb-[60px]">
          <h2 className="text-[36px] md:text-[40px] font-extrabold text-secondary-900 mb-[16px]">
            Empezá en 3 pasos
          </h2>
          <p className="text-[16px] md:text-[18px] text-secondary-600 max-w-[500px] mx-auto">
            Comprar, descargar y aprender. Así de simple.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-[32px] items-start">
          {howItWorks.map((step) => (
            <div key={step.step} className="flex-1 text-center">
              <div className="w-[56px] h-[56px] rounded-full bg-primary-500 text-white text-[22px] font-bold flex items-center justify-center mx-auto mb-[20px] shadow-lg">
                {step.step}
              </div>
              <h3 className="text-[18px] font-bold text-secondary-900 mb-[8px]">{step.title}</h3>
              <p className="text-[14px] text-secondary-600 leading-relaxed max-w-[280px] mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
