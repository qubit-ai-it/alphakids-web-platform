'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { productShowcaseContent } from '@/features/landing/data/content';

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<'mobile' | 'web'>('mobile');

  return (
    <section id="product-showcase" className="py-[80px] md:py-[100px] bg-white">
      <div className="max-w-[1200px] mx-auto px-[24px]">
        <div className="text-center mb-[48px]">
          <h2 className="text-[36px] md:text-[40px] font-extrabold text-secondary-900 mb-[16px]">
            Dos formas de usar AlphaKids
          </h2>
          <p className="text-[16px] md:text-[18px] text-secondary-600 max-w-[600px] mx-auto">
            Una app para aprender jugando y una plataforma web para gestionar el aula.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-[40px]">
          <div className="bg-secondary-100 rounded-[12px] p-[4px] inline-flex">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`px-[24px] py-[10px] rounded-[10px] text-[14px] font-semibold transition-all duration-200 ${
                activeTab === 'mobile'
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] mr-[6px] align-middle">phone_android</span>
              App Móvil
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`px-[24px] py-[10px] rounded-[10px] text-[14px] font-semibold transition-all duration-200 ${
                activeTab === 'web'
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] mr-[6px] align-middle">laptop_chromebook</span>
              Plataforma Web
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'mobile' ? (
            /* ── App Móvil ── */
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] mb-[40px]">
                {productShowcaseContent.mobile.images.map((img, i) => (
                  <div key={i} className="card hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <div className="relative w-full aspect-[9/16] max-h-[400px] rounded-[8px] overflow-hidden bg-secondary-100">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-[16px]">
                      <h3 className="text-[16px] font-bold text-secondary-900 mb-[4px]">{img.title}</h3>
                      <p className="text-[13px] text-secondary-500">{img.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-[12px]">
                {productShowcaseContent.mobile.features.map((f) => (
                  <div key={f} className="flex items-center gap-[6px] bg-primary-50 text-primary-700 px-[16px] py-[8px] rounded-[8px] text-[13px] font-medium">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Plataforma Web ── */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                {productShowcaseContent.web.features.map((f) => (
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
          )}
        </div>
      </div>
    </section>
  );
}
