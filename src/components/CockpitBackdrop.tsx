import { type ReactNode } from 'react';
import { ImageBackground, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

const cockpit = require('../../assets/cockpit_bg_1170x2532.png');

type CockpitBackdropProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * Opacidad del velo #03060C de build.py.
   * Misiones usa 0.22; el resto de pantallas, 0.45.
   */
  dim?: number;
};

/** Foto de cabina detrás de la interfaz. El velo deja leer el texto. */
export function CockpitBackdrop({ children, style, dim = 0.45 }: CockpitBackdropProps) {
  const theme = useTheme();

  return (
    <ImageBackground
      source={cockpit}
      resizeMode="cover"
      style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#03060C', opacity: dim }]}
      />
      {children}
    </ImageBackground>
  );
}
