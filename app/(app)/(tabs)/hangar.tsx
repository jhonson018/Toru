import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ChoiceGroup } from '@/components/ChoiceGroup';
import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { Screen } from '@/components/Screen';
import { CreateTeamForm } from '@/features/teams/CreateTeamForm';
import { useTeamMembers } from '@/features/teams/hooks';
import { useCurrentTeam } from '@/features/teams/TeamProvider';
import { personName } from '@/features/tasks/labels';
import { useTheme } from '@/theme/ThemeProvider';

export default function HangarScreen() {
  const theme = useTheme();
  const { teams, currentTeam, selectTeam, isLoading, error, refresh } = useCurrentTeam();
  const members = useTeamMembers(currentTeam?.id ?? null);

  return (
    <Screen scroll>
      <AppText variant="title">Hangar</AppText>
      <AppText variant="muted">La unidad a la que pertenecen las misiones.</AppText>
      {isLoading ? <LoadingView label="Buscando la unidad…" /> : null}
      {error ? <ErrorView message={error} onRetry={refresh} /> : null}
      {!isLoading && teams.length === 0 ? <CreateTeamForm /> : null}
      {teams.length > 1 && currentTeam ? (
        <ChoiceGroup
          label="Unidad"
          value={currentTeam.id}
          options={teams.map((team) => ({ value: team.id, label: team.name }))}
          onChange={selectTeam}
        />
      ) : null}
      {currentTeam ? <AppText variant="heading">{currentTeam.name}</AppText> : null}
      {members.data?.map((member) => (
        <View
          key={member.id}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.lineDim,
            padding: theme.spacing.md,
            gap: 4,
          }}
        >
          <AppText variant="body">{personName(member.profile, 'Piloto')}</AppText>
          <AppText variant="muted">{member.role === 'owner' ? 'Responsable' : 'Miembro'}</AppText>
        </View>
      ))}
    </Screen>
  );
}
