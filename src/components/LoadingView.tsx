import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type LoadingViewProps = {
  label?: string;
  fill?: boolean;
};

export function LoadingView({ label = 'Cargando…', fill = false }: LoadingViewProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: fill ? 1 : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.lg,
        backgroundColor: fill ? theme.colors.background : undefined,
      }}
    >
      <ActivityIndicator color={theme.colors.primary} />
      <AppText variant="muted">{label}</AppText>
    </View>
  );
}
