export function getErrorMessage(err: unknown): { title: string; message: string } {
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status;

    if (status) {
      switch (status) {
        case 400:
          return {
            title: 'Datos inválidos',
            message: 'Revisa los campos del formulario. Puede que algún dato no tenga el formato esperado.',
          };
        case 401:
          return {
            title: 'Sesión expirada',
            message: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
          };
        case 403:
          return {
            title: 'Acceso denegado',
            message: 'No tienes permisos para realizar esta acción.',
          };
        case 404:
          return {
            title: 'No encontrado',
            message: 'El recurso solicitado no existe o fue eliminado.',
          };
        case 409:
          return {
            title: 'Conflicto',
            message: 'Ya existe un registro con esos datos (slug o RUC duplicado).',
          };
        case 413:
          return {
            title: 'Archivo demasiado grande',
            message: 'La imagen es muy pesada. Usa una imagen de menor tamaño o comprímela.',
          };
        case 422:
          return {
            title: 'Error de validación',
            message: err.message || 'El servidor rechazó los datos enviados.',
          };
        case 500:
        case 502:
        case 503:
          return {
            title: 'Error del servidor',
            message: 'El servidor no está disponible en este momento. Intenta de nuevo más tarde.',
          };
        default:
          return {
            title: `Error (${status})`,
            message: err.message || 'Ocurrió un error inesperado.',
          };
      }
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
