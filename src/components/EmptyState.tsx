import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type EmptyStateProps = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm, paddingVertical: theme.spacing.lg }}>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="muted">{body}</AppText>
    </View>
  );
}
