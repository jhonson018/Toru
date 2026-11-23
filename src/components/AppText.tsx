import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'title' | 'heading' | 'body' | 'muted' | 'label' | 'mono';

type AppTextProps = TextProps & {
  variant?: Variant;
};

export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  const theme = useTheme();

  const variantStyle = {
    title: {
      fontFamily: theme.fontFamily.displayBold,
      fontSize: theme.fontSize.lg,
      color: theme.colors.text,
      letterSpacing: theme.letterSpacing.title,
      textTransform: 'uppercase' as const,
    },
    heading: {
      fontFamily: theme.fontFamily.bodyBold,
      fontSize: theme.fontSize.lg,
      color: theme.colors.text,
    },
    body: {
      fontFamily: theme.fontFamily.body,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    muted: {
      fontFamily: theme.fontFamily.mono,
      fontSize: theme.fontSize.xs,
      color: theme.colors.textMuted,
      letterSpacing: 0.6,
    },
    label: {
      fontFamily: theme.fontFamily.mono,
      fontSize: theme.fontSize.xs,
      color: theme.colors.line,
      letterSpacing: theme.letterSpacing.label,
      textTransform: 'uppercase' as const,
    },
    mono: {
      fontFamily: theme.fontFamily.mono,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
  }[variant];

  return <Text style={[variantStyle, style]} {...props} />;
}
