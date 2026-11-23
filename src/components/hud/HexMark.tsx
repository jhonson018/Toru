import { View } from 'react-native';
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

function points(size: number): string {
  const radius = size / 2 - 2;
  const list: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    list.push(`${size / 2 + radius * Math.cos(angle)},${size / 2 + radius * Math.sin(angle)}`);
  }
  return list.join(' ');
}

export function HexMark({ size = 92 }: { size?: number }) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Polygon
          points={points(size)}
          fill="rgba(7, 11, 20, 0.65)"
          stroke={theme.colors.amber}
          strokeWidth={2}
        />
        <SvgText
          x={size / 2}
          y={size / 2 + 8}
          fill={theme.colors.amber}
          fontSize={28}
          fontWeight="700"
          textAnchor="middle"
        >
          M
        </SvgText>
      </Svg>
    </View>
  );
}
