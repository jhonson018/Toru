import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type PilotHeaderProps = {
  callsign: string;
};

export function PilotHeader({ callsign }: PilotHeaderProps) {
  const theme = useTheme();
  const today = new Intl.DateTimeFormat('es', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date())
    .replace(/\./g, '')
    .toUpperCase();

  return (
    <View style={{ paddingHorizontal: theme.spacing.md, gap: 2 }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}
      >
        <AppText variant="label">Piloto // unidad</AppText>
        <AppText variant="muted" style={{ flexShrink: 1, textAlign: 'right' }}>
          {today}
        </AppText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        <AppText variant="title" style={{ flex: 1, fontSize: theme.fontSize.md }} numberOfLines={1}>
          {callsign}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.green,
            }}
          />
          <AppText variant="label" style={{ color: theme.colors.green, fontSize: 9 }}>
            Sistemas en línea
          </AppText>
        </View>
      </View>
    </View>
  );
}
