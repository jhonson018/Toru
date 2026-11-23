import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type SegmentedProgressProps = {
  total: number;
  filled: number;
  tone?: 'cyan' | 'amber';
  height?: number;
};

/** Cuadrados del diseño: sub-objetivos (bajos) y energía de misión (más altos). */
export function SegmentedProgress({
  total,
  filled,
  tone = 'cyan',
  height = 8,
}: SegmentedProgressProps) {
  const theme = useTheme();
  const count = Math.max(total, 1);
  const capped = Math.min(count, 10);
  const color = tone === 'amber' ? theme.colors.amber : theme.colors.line;
  const ratio = total === 0 ? 0 : filled / total;
  const lit = Math.round(ratio * capped);

  return (
    <View style={{ flexDirection: 'row', gap: 3, flex: 1 }}>
      {Array.from({ length: capped }, (_, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height,
            backgroundColor: index < lit ? color : 'transparent',
            borderWidth: 1,
            borderColor: index < lit ? color : theme.colors.lineDim,
          }}
        />
      ))}
    </View>
  );
}
