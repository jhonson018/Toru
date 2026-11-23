import type { ZodError } from 'zod';

/** Convierte los errores de Zod en un mapa { campo: mensaje } para el formulario. */
export function fieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !result[key]) {
      result[key] = issue.message;
    }
  }

  return result;
}
