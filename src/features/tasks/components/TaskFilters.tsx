import { ChoiceGroup } from '@/components/ChoiceGroup';
import { FILTER_OPTIONS, type TaskListFilter } from '@/features/tasks/labels';

type TaskFiltersProps = {
  value: TaskListFilter;
  onChange: (value: TaskListFilter) => void;
};

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return <ChoiceGroup label="Ver" value={value} options={FILTER_OPTIONS} onChange={onChange} />;
}
