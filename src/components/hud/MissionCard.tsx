import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { HudFrame } from '@/components/hud/HudFrame';
import { PriorityBadge } from '@/components/hud/PriorityBadge';
import { SegmentedProgress } from '@/components/hud/SegmentedProgress';
import {
  formatMissionWhen,
  missionEnergy,
  nextObjective,
  subtaskProgress,
} from '@/features/tasks/mission';
import { useTheme } from '@/theme/ThemeProvider';
import type { TaskWithPeople } from '@/types/database';

type MissionCardProps = {
  task: TaskWithPeople;
  number: number;
  onOpen: () => void;
};

export function MissionCard({ task, number, onOpen }: MissionCardProps) {
  const theme = useTheme();
  const when = formatMissionWhen(task.due_date);
  const progress = subtaskProgress(task);
  const energy = missionEnergy(task);
  const energySegments = Math.round(energy / 10);

  return (
    <HudFrame>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="label">Misión {String(number).padStart(2, '0')}</AppText>
        <PriorityBadge priority={task.priority} />
      </View>
      <AppText variant="heading" numberOfLines={2}>
        {task.title}
      </AppText>
      <AppText variant="label">Objetivo</AppText>
      <AppText
        variant="body"
        numberOfLines={3}
        style={{ color: theme.colors.textMuted, fontFamily: theme.fontFamily.body }}
      >
        {task.description?.trim() ? task.description : 'Sin objetivo escrito.'}
      </AppText>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <AppText variant="label">Fecha límite</AppText>
          <AppText variant="mono">{when.date}</AppText>
          <AppText variant="mono" style={{ color: theme.colors.line }}>
            {when.countdown}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <AppText variant="label">Sub-objetivos</AppText>
          <AppText variant="mono">
            {progress.done}/{progress.total}
          </AppText>
          <SegmentedProgress
            total={Math.max(progress.total, 1)}
            filled={progress.done}
            height={8}
          />
        </View>
      </View>
      <View style={{ gap: theme.spacing.xs }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="label">Energía de misión</AppText>
          <AppText variant="mono" style={{ color: theme.colors.amber }}>
            {energy}%
          </AppText>
        </View>
        <SegmentedProgress total={10} filled={energySegments} tone="amber" height={12} />
      </View>
      <AppText variant="label">Siguiente objetivo</AppText>
      <AppText variant="body" numberOfLines={2}>
        ▸ {nextObjective(task)}
      </AppText>
      <Button label="Abrir misión ›" variant="secondary" onPress={onOpen} />
    </HudFrame>
  );
}
