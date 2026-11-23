import { useRef } from 'react';
import {
  FlatList,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { MissionCard } from '@/components/hud/MissionCard';
import { useTheme } from '@/theme/ThemeProvider';
import type { TaskWithPeople } from '@/types/database';

type MissionCarouselProps = {
  tasks: TaskWithPeople[];
  resetKey: string;
  onIndexChange: (index: number) => void;
  onOpen: (task: TaskWithPeople) => void;
};

/**
 * Carrusel con snap. La tarjeta ocupa ~78% del ancho y las vecinas asoman.
 * snapToInterval hace que cada deslizamiento se detenga en una misión.
 */
export function MissionCarousel({ tasks, resetKey, onIndexChange, onOpen }: MissionCarouselProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<TaskWithPeople>>(null);
  const gap = theme.spacing.sm;
  const cardWidth = Math.min(width * 0.78, 420);
  const snap = cardWidth + gap;
  const sideInset = Math.max((width - cardWidth) / 2, theme.spacing.md);

  function handleEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / snap);
    const clamped = Math.max(0, Math.min(tasks.length - 1, next));
    onIndexChange(clamped);
  }

  return (
    <FlatList
      key={resetKey}
      ref={listRef}
      horizontal
      data={tasks}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={snap}
      snapToAlignment="start"
      disableIntervalMomentum
      onMomentumScrollEnd={handleEnd}
      contentContainerStyle={{ paddingHorizontal: sideInset }}
      ItemSeparatorComponent={() => <View style={{ width: gap }} />}
      renderItem={({ item, index }) => (
        <View style={{ width: cardWidth }}>
          <MissionCard task={item} number={index + 1} onOpen={() => onOpen(item)} />
        </View>
      )}
    />
  );
}
