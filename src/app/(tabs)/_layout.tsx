import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UpdateNotice } from '@/components/UpdateNotice';
import { WorkoutBanner } from '@/components/WorkoutBanner';
import type { IconName } from '@/components/ui';
import { C, SIZE, T } from '@/theme';

function icon(name: IconName, active: IconName) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? active : name} size={24} color={color as string} />;
  };
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // Icon (24) + label (14) fit in the bar with room to spare; each tab is a full-height target.
  const height = SIZE.tabBar + insets.bottom;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: C.text,
          tabBarInactiveTintColor: C.textFaint,
          tabBarStyle: {
            backgroundColor: C.bg,
            borderTopColor: C.control,
            borderTopWidth: 1,
            height,
            paddingTop: 4,
            paddingBottom: insets.bottom,
          },
          tabBarLabelStyle: { ...T.smallest, fontWeight: '600' },
          sceneStyle: { backgroundColor: C.bg },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('calendar-clear-outline', 'calendar-clear') }} />
        <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: icon('list-outline', 'list') }} />
        <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: icon('stats-chart-outline', 'stats-chart') }} />
        <Tabs.Screen name="library" options={{ title: 'Library', tabBarIcon: icon('book-outline', 'book') }} />
      </Tabs>
      <WorkoutBanner bottom={height} />
      <UpdateNotice bottom={height} />
    </View>
  );
}
