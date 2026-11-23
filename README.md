# Toru

Toru es una app móvil para asignar misiones a una unidad: título, objetivo, prioridad, fecha, sub-objetivos y quién la lleva. El diseño de cabina («Gestor de misiones — cabina mecha») es de **Astrak**. Las pantallas leen colores y fuentes de un solo tema, para poder cambiar el aspecto sin rehacer la navegación.

Si todavía no tienes un proyecto de Supabase, pulsa **Iniciar enlace** con los campos vacíos: se abre una cabina de demostración en memoria. Nada de eso se guarda.

## Qué tienes que configurar

1. Node.js 20 o superior.
2. La app Expo Go en el teléfono.
3. Un proyecto en [supabase.com](https://supabase.com) (gratis basta para aprender).
4. Un archivo `.env` en la raíz, copiado de `.env.example`.

```bash
npm install
cp .env.example .env
npx expo start
```

En `.env` van solo dos valores, los de **Project Settings → API**:

- `EXPO_PUBLIC_SUPABASE_URL`: la Project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: la clave pública. En el panel puede decir **anon** o **publishable**.

No pongas la clave `service_role` en la app. Esa clave ignora las reglas de seguridad. La clave anon es pública; quien protege las filas son las políticas del SQL.

Después de editar `.env`, para el servidor (Ctrl+C) y vuelve a ejecutar `npx expo start`.

## Carpetas

```text
app/                         Pantallas. Cada archivo es una ruta.
  (auth)/                    Quien no ha entrado: acceso, alta, recuperar.
  (app)/(tabs)/              Cabina: misiones, objetivos, hangar, perfil.
  (app)/tareas/              Nueva misión, detalle, edición y cierre.
src/components/              Piezas de interfaz (botón, campo, cabina).
src/features/auth/           Sesión: entrar, registrarse, salir, recuperar.
src/features/tasks/          Misiones, sub-objetivos y notas.
src/features/teams/          La unidad (el equipo).
src/lib/supabase/            Cliente de Supabase.
src/theme/                   Colores, fuentes y espacios. El diseño se cambia aquí.
src/types/                   Tipos del modelo, alineados con las columnas SQL.
src/demo/                    Datos de la cabina de demostración.
supabase/migrations/         Tablas y reglas de seguridad.
supabase/seed.sql            Dos pilotos y misiones de ejemplo.
docs/diseno/                 Notas del diseño de Astrak.
```

Los paréntesis de `(auth)` y `(app)` agrupan rutas y no salen en la URL. `app/(auth)/login.tsx` se abre en `/login`.

## Conceptos, en este repo

- **Tema.** `src/theme/theme.ts` es la única lista de colores y fuentes (Orbitron, Rajdhani, Share Tech Mono). `useTheme()` las reparte.
- **Sesión.** Supabase guarda el token en el teléfono con AsyncStorage. Por eso, al reabrir Toru, sigues dentro. La huella (`expo-local-authentication`) desbloquea esa sesión si el teléfono la tiene; si no hay biometría, se entra con el código.
- **RLS.** En Postgres, cada tabla tiene reglas para que una persona solo vea las misiones de su unidad. Están en la migración, con comentarios.
- **TanStack Query.** Guarda el resultado de las lecturas. El realtime de Supabase avisa de cambios y la caché se vuelve a pedir.
- **Zod.** Revisa el formulario antes de enviar y muestra el error al lado del campo.

## Crear el proyecto de Supabase

1. Entra en supabase.com y crea un proyecto. Anota la contraseña de la base: no va en la app.
2. Abre **SQL Editor → New query**.
3. Pega todo `supabase/migrations/20261123120000_init.sql` y pulsa **Run**.
4. Opcional: en otra query, pega `supabase/seed.sql` y ejecútalo. Crea a Ana y a Luis.
5. En **Authentication → Providers → Email**, para practicar sin esperar correos, desactiva **Confirm email**.
6. En **Authentication → URL Configuration**, añade la dirección de recuperación. En Expo Go suele ser la que imprime `npx expo start` con el camino `/nueva-contrasena`. En un build propio también vale `toru://nueva-contrasena`.
7. Copia la URL y la clave anon al `.env`.

Cuentas del seed (solo para aprender, no las uses en un proyecto real):

| Piloto     | Correo           | Indicativo   | Contraseña |
| ---------- | ---------------- | ------------ | ---------- |
| Ana García | ana@ejemplo.com  | YJ-07 HALCÓN | clave-demo |
| Luis Pérez | luis@ejemplo.com | LP-12 LUCIDO | clave-demo |

Puedes entrar con el indicativo o con el correo. Al registrarte, el trigger `handle_new_user` crea la fila de `profiles` con el indicativo.

## En el teléfono

1. Instala **Expo Go**.
2. El teléfono y el ordenador, en la misma Wi-Fi.
3. `npx expo start` y escanea el QR (en iPhone, la cámara; en Android, desde Expo Go).
4. Si el QR no conecta, prueba `npx expo start --tunnel`.

`npm run android` y `npm run ios` abren un emulador. El simulador de iOS pide un Mac.

## Comprobar el código

```bash
npm run typecheck
npm run lint
```

## Siguientes pasos

1. Cambia un color en `src/theme/theme.ts` y recarga. Las pantallas deberían seguirlo.
2. Sigue una misión: pantalla → esquema Zod → hook → `src/features/tasks/api.ts` → tabla `tasks`.
3. Entra con dos cuentas y comprueba que una no ve la unidad de la otra.
4. Abre la misma unidad en dos teléfonos y completa un objetivo: la lista se actualiza por realtime.
5. La curva de XP y el nivel son provisionales (`estimatedXp` y `pilotLevel` en `src/features/tasks/mission.ts`). El diseño muestra cifras de muestra; cuando Astrak cierre la progresión, se cambia esa función.
6. Invitaciones a la unidad, notificaciones con `expo-notifications` (hace falta un build de EAS, no solo Expo Go) y publicar con EAS Build / EAS Submit.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```
