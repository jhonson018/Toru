import { Tabs } from 'expo-router';

import { HudTabBar } from '@/components/hud/HudTabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <HudTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Misiones' }} />
      <Tabs.Screen name="objetivos" options={{ title: 'Objetivos' }} />
      <Tabs.Screen name="hangar" options={{ title: 'Hangar' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
