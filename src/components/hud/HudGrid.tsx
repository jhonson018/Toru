import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

/** Rejilla tenue del fondo. No intercepta toques. */
export function HudGrid() {
  const theme = useTheme();
  const lines = [];
  for (let i = 1; i < 12; i += 1) {
    lines.push(
      <Line
        key={`h-${i}`}
        x1="0"
        y1={`${i * 8}%`}
        x2="100%"
        y2={`${i * 8}%`}
        stroke={theme.colors.grid}
        strokeWidth="1"
      />,
    );
  }
  for (let i = 1; i < 8; i += 1) {
    lines.push(
      <Line
        key={`v-${i}`}
        x1={`${i * 12.5}%`}
        y1="0"
        x2={`${i * 12.5}%`}
        y2="100%"
        stroke={theme.colors.grid}
        strokeWidth="1"
      />,
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        {lines}
      </Svg>
    </View>
  );
}
