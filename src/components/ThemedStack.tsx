import { Stack } from 'expo-router';
import { type ReactNode } from 'react';

import { useTheme } from '@/theme/ThemeProvider';

export function ThemedStack({
  children,
  headerShown = true,
}: {
  children?: ReactNode;
  headerShown?: boolean;
}) {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.line,
        headerTitleStyle: {
          fontFamily: theme.fontFamily.display,
          fontSize: 14,
          color: theme.colors.text,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {children}
    </Stack>
  );
}
