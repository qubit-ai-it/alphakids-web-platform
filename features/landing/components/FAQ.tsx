import { faqItems } from '@/features/landing/data/content';

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function FAQ() {
  return (
    <section id="faq" className="py-[80px] md:py-[100px] bg-white">
      {/* JSON-LD schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <div className="max-w-[700px] mx-auto px-[24px]">
        <div className="text-center mb-[60px]">
          <h2 className="text-[36px] md:text-[40px] font-extrabold text-secondary-900 mb-[16px]">
            Preguntas frecuentes
          </h2>
          <p className="text-[16px] md:text-[18px] text-secondary-600 max-w-[500px] mx-auto">
            Todo lo que necesitás saber antes de comprar.
          </p>
        </div>

        <div className="space-y-[12px]">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="card cursor-pointer group open:shadow-md transition-shadow duration-200"
            >
              <summary className="list-none flex items-center justify-between gap-[12px] cursor-pointer select-none">
                <span className="text-[16px] font-semibold text-secondary-900 group-open:text-primary-600 transition-colors">
                  {item.question}
                </span>
                <span className="material-symbols-outlined text-[24px] text-secondary-400 group-open:text-primary-500 group-open:rotate-180 transition-all duration-200 flex-shrink-0">
                  expand_more
                </span>
              </summary>
              <p className="mt-[16px] text-[14px] text-secondary-600 leading-relaxed border-t border-secondary-100 pt-[16px]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
