export function getErrorMessage(err: unknown): { title: string; message: string } {
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status;

    if (status) {
      // Priorizar el mensaje real del backend sobre los hardcodeados
      const statusMessages: Record<number, { title: string; fallback: string }> = {
        400: { title: 'Datos inválidos', fallback: 'Revisa los campos del formulario. Puede que algún dato no tenga el formato esperado.' },
        401: { title: 'Sesión expirada', fallback: 'Tu sesión ha expirado. Inicia sesión nuevamente.' },
        403: { title: 'Acceso denegado', fallback: 'No tienes permisos para realizar esta acción.' },
        404: { title: 'No encontrado', fallback: 'El recurso solicitado no existe o fue eliminado.' },
        409: { title: 'Conflicto', fallback: 'Ya existe un registro con esos datos (slug o RUC duplicado).' },
        413: { title: 'Archivo demasiado grande', fallback: 'La imagen es muy pesada. Usa una imagen de menor tamaño o comprímela.' },
        422: { title: 'Error de validación', fallback: 'El servidor rechazó los datos enviados.' },
      };

      if (statusMessages[status]) {
        return {
          title: statusMessages[status].title,
          message: err.message || statusMessages[status].fallback,
        };
      }

      if (status >= 500) {
        return {
          title: 'Error del servidor',
          message: err.message || 'El servidor no está disponible en este momento. Intenta de nuevo más tarde.',
        };
      }

      return {
        title: `Error (${status})`,
        message: err.message || 'Ocurrió un error inesperado.',
      };
    }

    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      return {
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      };
    }

    return {
      title: 'Error',
      message: err.message,
    };
  }

  return {
    title: 'Error inesperado',
    message: 'Ocurrió un error desconocido. Intenta de nuevo.',
  };
}
