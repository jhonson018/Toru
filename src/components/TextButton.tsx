import { Pressable } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type TextButtonProps = {
  label: string;
  onPress: () => void;
};

export function TextButton({ label, onPress }: TextButtonProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <AppText variant="label" style={{ color: theme.colors.primary, fontSize: theme.fontSize.md }}>
        {label}
      </AppText>
    </Pressable>
  );
}
