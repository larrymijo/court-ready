import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WorkoutBanner } from '@/components/WorkoutBanner';
import type { IconName } from '@/components/ui';
import { C } from '@/theme';

// Icon (28) + label (14) + the item's own padding (10) must fit inside height − padding.
const TAB_HEIGHT = 62;

function icon(name: IconName, active: IconName) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? active : name} size={23} color={color as string} />;
  };
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const height = TAB_HEIGHT + insets.bottom;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: C.text,
          tabBarInactiveTintColor: C.faint,
          tabBarStyle: {
            backgroundColor: C.surface,
            borderTopColor: C.border,
            height,
            paddingTop: 4,
            paddingBottom: insets.bottom + 4,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          sceneStyle: { backgroundColor: C.bg },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('today-outline', 'today') }} />
        <Tabs.Screen
          name="routines"
          options={{ title: 'Routines', tabBarIcon: icon('barbell-outline', 'barbell') }}
        />
        <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('time-outline', 'time') }} />
        <Tabs.Screen
          name="progress"
          options={{ title: 'Progress', tabBarIcon: icon('stats-chart-outline', 'stats-chart') }}
        />
        <Tabs.Screen name="guide" options={{ title: 'Guide', tabBarIcon: icon('book-outline', 'book') }} />
      </Tabs>
      <WorkoutBanner bottom={height} />
    </View>
  );
}
