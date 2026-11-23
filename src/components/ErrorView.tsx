import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';

type ErrorViewProps = {
  message: string;
  onRetry?: () => void;
  fill?: boolean;
};

export function ErrorView({ message, onRetry, fill = false }: ErrorViewProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: fill ? 1 : undefined,
        justifyContent: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        backgroundColor: fill ? theme.colors.background : undefined,
      }}
    >
      <AppText variant="heading">Algo no salió bien</AppText>
      <AppText variant="body">{message}</AppText>
      {onRetry ? <Button label="Reintentar" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}
