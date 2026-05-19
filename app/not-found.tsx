"use client";

import { ErrorTemplate } from '@/shared/components/ui/ErrorTemplate';

export default function NotFound() {
    return (
        <ErrorTemplate
            statusCode="404"
            title="¡Página no encontrada!"
            description="Parece que te has perdido. La página que estás buscando no existe o ha sido movida a otro lugar."
        />
    );
}