import { type ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

function Bracket({ corner }: { corner: Corner }) {
  const theme = useTheme();
  const size = 14;
  const color = theme.colors.line;
  const horizontal = {
    position: 'absolute' as const,
    width: size,
    height: 2,
    backgroundColor: color,
    top: corner.startsWith('top') ? -1 : undefined,
    bottom: corner.startsWith('bottom') ? -1 : undefined,
    left: corner.endsWith('Left') ? -1 : undefined,
    right: corner.endsWith('Right') ? -1 : undefined,
  };
  const vertical = {
    ...horizontal,
    width: 2,
    height: size,
  };

  return (
    <>
      <View style={horizontal} />
      <View style={vertical} />
    </>
  );
}

export function HudFrame({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.lineDim,
        backgroundColor: 'rgba(14, 28, 51, 0.92)', // #0E1C33, cardG de build.py
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <Bracket corner="topLeft" />
      <Bracket corner="topRight" />
      <Bracket corner="bottomLeft" />
      <Bracket corner="bottomRight" />
      {children}
    </View>
  );
}
