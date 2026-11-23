import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type GestureRootProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** El import sin llaves vive en app/_layout.tsx. Aquí solo se usa el componente. */
export function GestureRoot({ children, style }: GestureRootProps) {
  return <GestureHandlerRootView style={style}>{children}</GestureHandlerRootView>;
}
