import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import {
  formatDueDate,
  isOverdue,
  personName,
  PRIORITY_LABEL,
  STATUS_LABEL,
} from '@/features/tasks/labels';
import { useTheme } from '@/theme/ThemeProvider';
import type { TaskWithPeople } from '@/types/database';

type TaskCardProps = {
  task: TaskWithPeople;
  onPress: () => void;
};

export function TaskCard({ task, onPress }: TaskCardProps) {
  const theme = useTheme();
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
      })}
    >
      <AppText variant="label" style={{ fontSize: theme.fontSize.md }}>
        {task.title}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        <AppText variant="muted" style={{ color: theme.colors.status[task.status] }}>
          {STATUS_LABEL[task.status]}
        </AppText>
        <AppText variant="muted" style={{ color: theme.colors.priority[task.priority] }}>
          Prioridad {PRIORITY_LABEL[task.priority].toLowerCase()}
        </AppText>
      </View>
      <AppText variant="muted">
        {personName(task.assignee, 'Sin asignar')} ·{' '}
        <AppText
          variant="muted"
          style={{ color: overdue ? theme.colors.danger : theme.colors.textMuted }}
        >
          {overdue ? `Venció el ${formatDueDate(task.due_date)}` : formatDueDate(task.due_date)}
        </AppText>
      </AppText>
    </Pressable>
  );
}
