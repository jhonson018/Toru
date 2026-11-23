import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HudGrid } from '@/components/hud/HudGrid';
import { useTheme } from '@/theme/ThemeProvider';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

export function Screen({ children, scroll = false, padded = true }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const padding = padded
    ? {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: insets.bottom + theme.spacing.lg,
      }
    : null;

  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.colors.background }, padding]}>
        <HudGrid />
        {children}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HudGrid />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[{ gap: theme.spacing.md }, padding]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
