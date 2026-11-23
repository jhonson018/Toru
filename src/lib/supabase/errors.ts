const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Confirma tu correo antes de entrar. Revisa la bandeja de entrada.',
  user_already_exists: 'Ya hay una cuenta con ese correo.',
  user_already_registered: 'Ya hay una cuenta con ese correo.',
  weak_password: 'La contraseña es demasiado débil. Usa al menos 6 caracteres.',
  over_request_rate_limit: 'Demasiados intentos. Espera un momento y prueba otra vez.',
};

function readMessage(error: unknown): { message: string; code?: string } | null {
  if (typeof error !== 'object' || error === null || !('message' in error)) {
    return null;
  }

  const message = error.message;
  if (typeof message !== 'string' || message.trim().length === 0) {
    return null;
  }

  const code = 'code' in error && typeof error.code === 'string' ? error.code : undefined;
  return { message, code };
}

export function translateAuthError(error: unknown): string {
  const parsed = readMessage(error);
  if (!parsed) {
    return 'No pudimos completar el acceso.';
  }

  if (parsed.code && AUTH_MESSAGES[parsed.code]) {
    return AUTH_MESSAGES[parsed.code];
  }

  if (parsed.message.toLowerCase().includes('invalid login credentials')) {
    return AUTH_MESSAGES.invalid_credentials;
  }

  return getErrorMessage(error);
}

export function getErrorMessage(error: unknown): string {
  const parsed = readMessage(error);
  if (!parsed) {
    return 'Ocurrió un error inesperado.';
  }

  const lower = parsed.message.toLowerCase();
  if (lower.includes('failed to fetch') || lower.includes('network request failed')) {
    return 'No hay conexión con Supabase. Revisa la URL del proyecto y tu internet.';
  }

  if (lower.includes('invalid api key')) {
    return 'La clave anon no es válida. Revisa EXPO_PUBLIC_SUPABASE_ANON_KEY en el archivo .env.';
  }

  return parsed.message;
}
