"use client";

import React from 'react';
import { Icon } from './Icon';

export interface ErrorTemplateProps {
    statusCode: string;
    title: string;
    description: string;
    resetAction?: () => void;
    homeLink?: string;
}

export function ErrorTemplate({
    statusCode,
    title,
    description,
    resetAction,
    homeLink = "/dashboard"
}: ErrorTemplateProps) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary-100 p-6 font-sans">
            <div className="max-w-[600px] w-full bg-white rounded-[32px] shadow-xl p-10 sm:p-14 flex flex-col items-center text-center">

                {/* Contenedor de la Imagen con Bordes Redondeados */}
                <div className="w-[240px] h-[240px] mb-8 flex items-center justify-center overflow-hidden rounded-2xl bg-secondary-50 p-2">
                    <img
                        src={`/errors/${statusCode}.png`}
                        alt={`Error ${statusCode}`}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/errors/default.png';
                        }}
                    />
                </div>

                {/* Badge del código de error */}
                <div className="bg-primary-100 text-primary-600 px-4 py-1 rounded-full text-[14px] font-bold mb-4 tracking-widest w-fit">
                    ERROR {statusCode}
                </div>

                {/* Textos */}
                <h1 className="text-[32px] sm:text-[36px] font-bold text-secondary-900 leading-tight mb-4">
                    {title}
                </h1>
                <p className="text-[16px] text-secondary-700 mb-8 max-w-[400px]">
                    {description}
                </p>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                    {resetAction && (
                        <button
                            onClick={resetAction}
                            className="btn btn-outline btn-lg w-full sm:w-auto justify-center gap-2"
                        >
                            <Icon name="refresh" className="text-[20px]" />
                            Reintentar
                        </button>
                    )}
                    <a href={homeLink} className="w-full sm:w-auto">
                        <button className="btn btn-primary btn-lg w-full justify-center gap-2">
                            <Icon name="home" className="text-[20px]" />
                            Volver al Inicio
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
}