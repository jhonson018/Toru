import { TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, multiline, ...props }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        multiline={multiline}
        style={[
          {
            minHeight: multiline ? 96 : 48,
            borderWidth: 1,
            borderColor: error ? theme.colors.danger : theme.colors.lineDim,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.body,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <AppText variant="muted" style={{ color: theme.colors.danger }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
