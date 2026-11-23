import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { personName } from '@/features/tasks/labels';
import { useAddComment, useComments } from '@/features/tasks/hooks';
import { commentSchema } from '@/features/tasks/schemas';
import { getErrorMessage } from '@/lib/supabase/errors';
import { useTheme } from '@/theme/ThemeProvider';

type CommentSectionProps = {
  taskId: string;
};

export function CommentSection({ taskId }: CommentSectionProps) {
  const theme = useTheme();
  const comments = useComments(taskId);
  const addComment = useAddComment(taskId);
  const [body, setBody] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    setFormError(null);
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Escribe un comentario.');
      return;
    }

    setFieldError(undefined);
    try {
      await addComment.mutateAsync(parsed.data);
      setBody('');
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="label">Notas de campo</AppText>
      {comments.isLoading ? <AppText variant="muted">Cargando comentarios…</AppText> : null}
      {comments.error ? (
        <AppText variant="muted" style={{ color: theme.colors.danger }}>
          {getErrorMessage(comments.error)}
        </AppText>
      ) : null}
      {comments.data?.length === 0 ? (
        <AppText variant="muted">Todavía no hay comentarios.</AppText>
      ) : null}
      {comments.data?.map((comment) => (
        <View
          key={comment.id}
          style={{
            gap: theme.spacing.xs,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <AppText variant="label">{personName(comment.author, 'Alguien del equipo')}</AppText>
          <AppText variant="body">{comment.body}</AppText>
        </View>
      ))}
      <TextField
        label="Nuevo comentario"
        value={body}
        onChangeText={setBody}
        error={fieldError}
        placeholder="Una nota para quien tiene la tarea"
        multiline
      />
      {formError ? (
        <AppText variant="muted" style={{ color: theme.colors.danger }}>
          {formError}
        </AppText>
      ) : null}
      <Button
        label="Publicar"
        variant="secondary"
        onPress={() => void handleSubmit()}
        loading={addComment.isPending}
      />
    </View>
  );
}
