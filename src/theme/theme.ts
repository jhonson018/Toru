/**
 * Tema de Toru, a partir del diseño de cabina de Astrak.
 *
 * Las pantallas no eligen colores ni fuentes por su cuenta: leen este objeto
 * con useTheme(). Para cambiar el aspecto, edita aquí. La navegación y las
 * llamadas a Supabase no deberían hacer falta.
 *
 * Los hex son los de docs/diseno/build.py (navy, panel, line, cyan, cyan2,
 * amber, orange, text, muted, dim, green). Prioridad: alta naranja, media
 * ámbar, baja cian. El ámbar pulsado es el inicio del degradado (#FF8A2B).
 * No hay rojo en la lámina: el aviso usa el naranja.
 *
 * display: títulos en Orbitron 700. displayBold: Orbitron 800.
 * body: texto de misión (Rajdhani).
 * mono: etiquetas, cuentas atrás y chips (Share Tech Mono).
 * Los nombres coinciden con las claves que carga src/theme/fonts.ts.
 */
export const theme = {
  statusBar: 'light',
  colors: {
    background: '#070B14',
    surface: '#0A1424',
    text: '#EAF1FA',
    textMuted: '#93A7C0',
    border: '#2A4466',
    primary: '#FFB23E',
    primaryPressed: '#FF8A2B',
    primarySoft: 'rgba(108, 196, 255, 0.12)',
    onPrimary: '#070B14',
    danger: '#FF6B35',
    line: '#6CC4FF',
    lineDim: '#3D8BD9',
    amber: '#FFB23E',
    green: '#5BE3A6',
    grid: 'rgba(159, 211, 255, 0.05)',
    status: {
      todo: '#5D708A',
      in_progress: '#6CC4FF',
      done: '#5BE3A6',
    },
    priority: {
      low: '#6CC4FF',
      medium: '#FFB23E',
      high: '#FF6B35',
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
    display: 'Orbitron_700Bold',
    displayBold: 'Orbitron_800ExtraBold',
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
