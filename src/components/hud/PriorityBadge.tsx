import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PRIORITY_LABEL } from '@/features/tasks/labels';
import { useTheme } from '@/theme/ThemeProvider';
import type { TaskPriority } from '@/types/database';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const theme = useTheme();
  const filled = priority === 'high';
  const color = theme.colors.priority[priority];

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: color,
        backgroundColor: filled ? color : 'transparent',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
      }}
    >
      <AppText
        variant="label"
        style={{
          color: filled ? theme.colors.onPrimary : color,
          fontSize: 10,
        }}
      >
        Prioridad {PRIORITY_LABEL[priority]}
      </AppText>
    </View>
  );
}
