import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

function Bars() {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {[6, 9, 12, 15].map((height) => (
        <View key={height} style={{ width: 3, height, backgroundColor: theme.colors.line }} />
      ))}
    </View>
  );
}

export function StatusLine() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const time = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(now);

  return (
    <View
      style={{
        paddingTop: insets.top + theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <AppText variant="mono">{time}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <AppText variant="label">LNK</AppText>
        <Bars />
      </View>
      <AppText variant="label">PWR</AppText>
    </View>
  );
}
