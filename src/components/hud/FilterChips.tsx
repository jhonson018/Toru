import { Pressable, ScrollView } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Chip<T extends string> = {
  value: T;
  label: string;
};

type FilterChipsProps<T extends string> = {
  options: readonly Chip<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.sm, paddingHorizontal: theme.spacing.md }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={{
              minHeight: 32,
              justifyContent: 'center',
              paddingHorizontal: theme.spacing.sm,
              borderWidth: 1,
              borderColor: selected ? theme.colors.line : theme.colors.lineDim,
              backgroundColor: selected ? theme.colors.primarySoft : 'transparent',
            }}
          >
            <AppText
              variant="label"
              style={{ color: selected ? theme.colors.text : theme.colors.textMuted, fontSize: 10 }}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
