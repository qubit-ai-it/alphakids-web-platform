import { pricingPlans } from '@/features/landing/data/content';

export default function Pricing() {
  return (
    <section id="pricing" className="py-[80px] md:py-[100px] bg-white">
      <div className="max-w-[1000px] mx-auto px-[24px]">
        <div className="text-center mb-[60px]">
          <h2 className="text-[36px] md:text-[40px] font-extrabold text-secondary-900 mb-[16px]">
            Un solo precio, todo incluido
          </h2>
          <p className="text-[16px] md:text-[18px] text-secondary-600 max-w-[600px] mx-auto">
            Sin sorpresas ni cargos ocultos. Pagás una vez al año.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] max-w-[700px] mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.title}
              className={`card flex flex-col ${
                plan.highlighted
                  ? 'ring-2 ring-primary-500 shadow-lg relative'
                  : 'shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-[12px] left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[12px] font-bold px-[16px] py-[4px] rounded-full">
                  RECOMENDADO
                </span>
              )}

              <div className="text-center mb-[24px]">
                <h3 className="text-[22px] font-bold text-secondary-900 mb-[8px]">{plan.title}</h3>
                <div className="mb-[4px]">
                  <span className="text-[40px] font-extrabold text-primary-500">{plan.price}</span>
                </div>
                <p className="text-[14px] text-secondary-600">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-[12px] mb-[24px]">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-[10px]">
                    {feature.included ? (
                      <span className="material-symbols-outlined text-[20px] text-green-500 mt-[2px] flex-shrink-0">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-secondary-400 mt-[2px] flex-shrink-0">
                        cancel
                      </span>
                    )}
                    <span className="text-[14px] text-secondary-700">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#lead-form"
                className={`btn w-full btn-lg ${plan.highlighted ? 'btn-primary' : 'btn-outline'} inline-flex`}
              >
                Lo quiero
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
