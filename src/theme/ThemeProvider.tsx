import { createContext, useContext, type ReactNode } from 'react';

import { theme, type AppTheme } from '@/theme/theme';

const ThemeContext = createContext<AppTheme>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
