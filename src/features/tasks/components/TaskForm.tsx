import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ChoiceGroup } from '@/components/ChoiceGroup';
import { TextField } from '@/components/TextField';
import { AssigneePicker } from '@/features/tasks/components/AssigneePicker';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/features/tasks/labels';
import { estimatedXp } from '@/features/tasks/mission';
import { taskFormSchema, type TaskFormValues } from '@/features/tasks/schemas';
import { getErrorMessage } from '@/lib/supabase/errors';
import { fieldErrors } from '@/lib/validation';
import { useTheme } from '@/theme/ThemeProvider';
import type { SubtaskInput, TeamMemberWithProfile } from '@/types/database';

type DraftLine = { key: string; title: string; is_done: boolean };

type TaskFormProps = {
  initialValues: TaskFormValues;
  initialSubtasks?: SubtaskInput[];
  members: TeamMemberWithProfile[];
  membersLoading?: boolean;
  submitLabel: string;
  codeLabel?: string;
  showStatus?: boolean;
  showAssignee?: boolean;
  onSubmit: (values: TaskFormValues, subtasks: SubtaskInput[]) => Promise<void>;
};

function linesFrom(items: SubtaskInput[] | undefined): DraftLine[] {
  return (items ?? []).map((item, index) => ({
    key: `saved-${index}`,
    title: item.title,
    is_done: item.is_done,
  }));
}

export function TaskForm({
  initialValues,
  initialSubtasks,
  members,
  membersLoading = false,
  submitLabel,
  codeLabel,
  showStatus = true,
  showAssignee = true,
  onSubmit,
}: TaskFormProps) {
  const theme = useTheme();
  const [values, setValues] = useState(initialValues);
  const [lines, setLines] = useState<DraftLine[]>(() => linesFrom(initialSubtasks));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit() {
    setFormError(null);
    const parsed = taskFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    const subtasks = lines
      .map((line) => ({ title: line.title.trim(), is_done: line.is_done }))
      .filter((line) => line.title.length > 0);

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(parsed.data, subtasks);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const reward = estimatedXp(lines.filter((line) => line.title.trim().length > 0).length);

  return (
    <View style={{ gap: theme.spacing.md }}>
      {codeLabel ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="label">Código asignado</AppText>
          <AppText variant="mono">{codeLabel}</AppText>
        </View>
      ) : null}
      <TextField
        label="Nombre de la misión"
        value={values.title}
        onChangeText={(title) => update('title', title)}
        error={errors.title}
        placeholder="Entregar etiquetas"
      />
      <TextField
        label="Objetivo"
        value={values.description}
        onChangeText={(description) => update('description', description)}
        error={errors.description}
        placeholder="Qué hay que lograr"
        multiline
      />
      {showStatus ? (
        <ChoiceGroup
          label="Estado"
          value={values.status}
          options={STATUS_OPTIONS}
          onChange={(status) => update('status', status)}
        />
      ) : null}
      <ChoiceGroup
        label="Nivel de prioridad"
        value={values.priority}
        options={PRIORITY_OPTIONS}
        onChange={(priority) => update('priority', priority)}
      />
      <TextField
        label="Fecha límite"
        value={values.due_date}
        onChangeText={(dueDate) => update('due_date', dueDate)}
        error={errors.due_date}
        placeholder="AAAA-MM-DD"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextField
        label="Hora"
        value={values.due_time}
        onChangeText={(dueTime) => update('due_time', dueTime)}
        error={errors.due_time}
        placeholder="18:00"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showAssignee ? (
        <AssigneePicker
          members={members}
          value={values.assignee_id}
          loading={membersLoading}
          onChange={(assigneeId) => update('assignee_id', assigneeId)}
        />
      ) : null}
      <AppText variant="label">Sub-objetivos</AppText>
      {lines.map((line) => (
        <View
          key={line.key}
          style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' }}
        >
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: line.is_done }}
            onPress={() =>
              setLines((current) =>
                current.map((item) =>
                  item.key === line.key ? { ...item, is_done: !item.is_done } : item,
                ),
              )
            }
            style={{
              width: 22,
              height: 22,
              borderWidth: 1,
              borderColor: theme.colors.line,
              backgroundColor: line.is_done ? theme.colors.line : 'transparent',
            }}
          />
          <View style={{ flex: 1 }}>
            <TextField
              label="Paso"
              value={line.title}
              onChangeText={(title) =>
                setLines((current) =>
                  current.map((item) => (item.key === line.key ? { ...item, title } : item)),
                )
              }
            />
          </View>
          <Pressable
            onPress={() => setLines((current) => current.filter((item) => item.key !== line.key))}
          >
            <AppText variant="label" style={{ color: theme.colors.danger }}>
              Quitar
            </AppText>
          </Pressable>
        </View>
      ))}
      <Button
        label="Añadir sub-objetivo"
        variant="secondary"
        onPress={() =>
          setLines((current) => [
            ...current,
            { key: `new-${Date.now()}`, title: '', is_done: false },
          ])
        }
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="label">Recompensa estimada</AppText>
        <AppText variant="mono" style={{ color: theme.colors.amber }}>
          +{reward} XP
        </AppText>
      </View>
      {formError ? (
        <AppText variant="muted" style={{ color: theme.colors.danger }}>
          {formError}
        </AppText>
      ) : null}
      <Button label={submitLabel} onPress={() => void handleSubmit()} loading={isSubmitting} />
    </View>
  );
}
