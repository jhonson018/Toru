import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type StatBoxProps = {
  label: string;
  value: string;
  accent?: boolean;
};

export function StatBox({ label, value, accent = false }: StatBoxProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.lineDim,
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
        alignItems: 'center',
        gap: 2,
      }}
    >
      <AppText variant="label" style={{ fontSize: 9, textAlign: 'center' }}>
        {label}
      </AppText>
      <AppText
        variant="mono"
        style={{
          color: accent ? theme.colors.amber : theme.colors.text,
          fontFamily: theme.fontFamily.display,
          fontSize: theme.fontSize.sm,
          textAlign: 'center',
        }}
      >
        {value}
      </AppText>
    </View>
  );
}
