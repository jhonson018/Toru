import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'danger';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = Boolean(disabled || loading);

  const palette = {
    primary: {
      background: theme.colors.primary,
      pressed: theme.colors.primaryPressed,
      text: theme.colors.onPrimary,
      border: theme.colors.primary,
    },
    secondary: {
      background: 'transparent',
      pressed: theme.colors.primarySoft,
      text: theme.colors.line,
      border: theme.colors.line,
    },
    danger: {
      background: 'transparent',
      pressed: theme.colors.surface,
      text: theme.colors.danger,
      border: theme.colors.danger,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        {
          minHeight: 48,
          borderRadius: theme.radius.sm,
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: state.pressed ? palette.pressed : palette.background,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.md,
          opacity: isDisabled ? 0.55 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <AppText
          variant="label"
          style={{ color: palette.text, fontSize: theme.fontSize.sm, letterSpacing: 1.4 }}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
