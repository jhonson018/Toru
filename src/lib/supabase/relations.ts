/**
 * Un join de muchos-a-uno llega como objeto.
 * Si la relación no está declarada con el nombre exacto, PostgREST
 * a veces responde con una lista de un solo elemento. Normalizamos los dos casos.
 */
export function asSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
