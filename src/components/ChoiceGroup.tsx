import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Choice<T extends string> = {
  value: T;
  label: string;
};

type ChoiceGroupProps<T extends string> = {
  label: string;
  value: T;
  options: readonly Choice<T>[];
  onChange: (value: T) => void;
};

export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceGroupProps<T>) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="label">{label}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={{
                minHeight: 40,
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.md,
                borderRadius: theme.radius.md,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
              }}
            >
              <AppText
                variant="label"
                style={{ color: selected ? theme.colors.primary : theme.colors.text }}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
