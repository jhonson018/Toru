import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query guarda en memoria el resultado de las peticiones.
 * staleTime: durante 5 segundos, volver a una pantalla no repite la llamada.
 * retry: si una petición falla, se intenta una vez más antes de mostrar el error.
 * La lista en vivo no depende de este tiempo: el realtime invalida la caché al momento.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5_000,
    },
  },
});
