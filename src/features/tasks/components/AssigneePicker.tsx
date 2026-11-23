import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { personName } from '@/features/tasks/labels';
import { useTheme } from '@/theme/ThemeProvider';
import type { TeamMemberWithProfile } from '@/types/database';

type AssigneePickerProps = {
  members: TeamMemberWithProfile[];
  value: string | null;
  onChange: (assigneeId: string | null) => void;
  loading?: boolean;
};

export function AssigneePicker({ members, value, onChange, loading = false }: AssigneePickerProps) {
  const theme = useTheme();
  const options = [
    { id: null as string | null, label: 'Sin asignar' },
    ...members.map((member) => ({
      id: member.user_id,
      label: personName(member.profile, 'Persona del equipo'),
    })),
  ];

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="label">Asignada a</AppText>
      {loading ? <AppText variant="muted">Cargando personas del equipo…</AppText> : null}
      <View style={{ gap: theme.spacing.sm }}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <Pressable
              key={option.id ?? 'unassigned'}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.id)}
              style={{
                minHeight: 44,
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.md,
                borderRadius: theme.radius.md,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
              }}
            >
              <AppText
                variant="body"
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
