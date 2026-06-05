"use client";

import { useEffect } from 'react';
import { ErrorTemplate } from '@/shared/components/ui/ErrorTemplate';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Aquí podrías registrar el error en Sentry, LogRocket, etc.
        console.error(error);
    }, [error]);

    return (
        <ErrorTemplate
            statusCode="500"
            title="Error Interno del Servidor"
            description="Nuestros servidores tuvieron un pequeño tropiezo. Estamos trabajando para solucionarlo lo antes posible."
            resetAction={reset}
        />
    );
}