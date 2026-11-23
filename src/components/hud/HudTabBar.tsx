import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

const TABS = [
  { name: 'index', label: 'Misiones' },
  { name: 'objetivos', label: 'Objetivos' },
  { name: 'hangar', label: 'Hangar' },
  { name: 'perfil', label: 'Perfil' },
] as const;

function hexPoints(size: number): string {
  const radius = size / 2;
  const points: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push(`${radius + radius * Math.cos(angle)},${radius + radius * Math.sin(angle)}`);
  }
  return points.join(' ');
}

type HudTabBarProps = {
  state: { index: number; routes: { name: string; key: string }[] };
  navigateToTab: (routeKey: string) => void;
};

export function HudTabBar({ state, navigateToTab }: HudTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  function open(name: (typeof TABS)[number]['name']) {
    const route = state.routes.find((item) => item.name === name);
    if (!route) return;
    navigateToTab(route.key);
  }

  function renderTab(name: (typeof TABS)[number]['name'], label: string) {
    const active = state.routes[state.index]?.name === name;
    return (
      <Pressable
        key={name}
        accessibilityRole="button"
        onPress={() => open(name)}
        style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: theme.spacing.sm }}
      >
        <AppText
          variant="label"
          style={{
            color: active ? theme.colors.line : theme.colors.textMuted,
            fontSize: 9,
            textAlign: 'center',
          }}
        >
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: insets.bottom,
        borderTopWidth: 1,
        borderTopColor: theme.colors.lineDim,
        backgroundColor: '#070B14',
      }}
    >
      {left.map((tab) => renderTab(tab.name, tab.label))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nueva misión"
        onPress={() => router.push('/tareas/nueva')}
        style={{ width: 88, alignItems: 'center', marginTop: -22 }}
      >
        <Svg width={56} height={56}>
          <Polygon points={hexPoints(56)} fill={theme.colors.amber} />
        </Svg>
        <AppText
          style={{
            position: 'absolute',
            top: 14,
            fontFamily: theme.fontFamily.displayBold,
            color: theme.colors.onPrimary,
            fontSize: 26,
          }}
        >
          +
        </AppText>
        <AppText
          variant="label"
          style={{ color: theme.colors.amber, fontSize: 8, textAlign: 'center' }}
        >
          Nueva misión
        </AppText>
      </Pressable>
      {right.map((tab) => renderTab(tab.name, tab.label))}
    </View>
  );
}
