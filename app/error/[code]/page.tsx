"use client";

import React, { use } from 'react';
import { ErrorTemplate } from '@/shared/components/ui/ErrorTemplate';
import { notFound } from 'next/navigation';

const ERROR_DATA: Record<string, { title: string; description: string }> = {
    "400": { title: "Solicitud Incorrecta", description: "Parece que hubo un error en la información enviada. Por favor, revisa e intenta nuevamente." },
    "401": { title: "No Autorizado", description: "No tienes permiso para ver esta sección. Por favor, inicia sesión para continuar." },
    "403": { title: "Acceso Denegado", description: "No tienes los permisos necesarios para acceder a esta página." },
    "405": { title: "Método No Permitido", description: "Esta acción no está permitida en este momento." },
    "408": { title: "Tiempo de Espera", description: "Tu conexión tardó demasiado en responder. Por favor, revisa tu internet y vuelve a intentarlo." },
    "429": { title: "Demasiadas Solicitudes", description: "¡Wow, más despacio! Has hecho demasiadas peticiones en muy poco tiempo. Espera un momento." },
    "501": { title: "No Implementado", description: "Esta función aún está en construcción y no está disponible actualmente." },
    "502": { title: "Falla de Comunicación", description: "Tuvimos un problema de comunicación interna (Bad Gateway)." },
    "503": { title: "Servicio No Disponible", description: "Estamos realizando mantenimiento en la plataforma. Por favor, regresa pronto." },
    "504": { title: "Tiempo Agotado del Servidor", description: "Nuestros servidores tardaron demasiado en responder a tu solicitud." },
};

interface PageProps {
    params: Promise<{ code: string }>;
}

export default function CustomErrorPage({ params }: PageProps) {
    const { code } = use(params);
    const data = ERROR_DATA[code];

    if (!data) {
        notFound();
    }

    return (
        <ErrorTemplate
            statusCode={code}
            title={data.title}
            description={data.description}
            homeLink={code === "401" ? "/login" : "/dashboard"}
        />
    );
}