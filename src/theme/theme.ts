/**
 * Tema de Toru, a partir del diseño de cabina de Astrak.
 *
 * Las pantallas no eligen colores ni fuentes por su cuenta: leen este objeto
 * con useTheme(). Para cambiar el aspecto, edita aquí. La navegación y las
 * llamadas a Supabase no deberían hacer falta.
 *
 * display: títulos y el indicativo (Orbitron).
 * body: texto de misión (Rajdhani).
 * mono: etiquetas, cuentas atrás y chips (Share Tech Mono).
 * Los nombres coinciden con las claves que carga src/theme/fonts.ts.
 */
export const theme = {
  statusBar: 'light',
  colors: {
    background: '#070B14',
    surface: '#101A2B',
    text: '#E7F6FF',
    textMuted: '#8AA4B8',
    border: '#1A4E63',
    primary: '#FF9E1B',
    primaryPressed: '#D98412',
    primarySoft: 'rgba(55, 214, 255, 0.14)',
    onPrimary: '#1A1206',
    danger: '#FF5D73',
    line: '#37D6FF',
    lineDim: '#1C6C86',
    amber: '#FF9E1B',
    green: '#3DDC97',
    grid: 'rgba(55, 214, 255, 0.07)',
    status: {
      todo: '#8AA4B8',
      in_progress: '#37D6FF',
      done: '#3DDC97',
    },
    priority: {
      low: '#8AA4B8',
      medium: '#37D6FF',
      high: '#FF9E1B',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 16,
    lg: 22,
    xl: 28,
  },
  fontWeight: {
    regular: '400',
    semibold: '600',
    bold: '700',
  },
  fontFamily: {
    display: 'Orbitron_600SemiBold',
    displayBold: 'Orbitron_700Bold',
    body: 'Rajdhani_500Medium',
    bodySemibold: 'Rajdhani_600SemiBold',
    bodyBold: 'Rajdhani_700Bold',
    mono: 'ShareTechMono_400Regular',
  },
  letterSpacing: {
    label: 1.6,
    title: 1.2,
  },
} as const;

export type AppTheme = typeof theme;
