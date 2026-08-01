import { Activity, Bookmark, Heart, History, Settings } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { palette } from '@/lib/palette';

export default function TabLayout() {
  return (
    <>
      {/* eslint-disable-next-line react/style-prop-object -- expo-status-bar's `style` prop is a StatusBarStyle string enum ('light' | 'dark' | ...), not a React Native style object */}
      <StatusBar style="light" backgroundColor={palette.background} />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: palette.background },
          tabBarStyle: {
            backgroundColor: palette.canvas,
            borderTopColor: palette.border,
            borderTopWidth: 1,
            elevation: 0,
            shadowColor: 'transparent',
            shadowOpacity: 0,
            shadowRadius: 0,
            height: Platform.OS === 'web' ? 64 : undefined,
          },
          tabBarActiveTintColor: palette.accent,
          tabBarInactiveTintColor: palette.inkDim,
          tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Radar',
            tabBarIcon: ({ color, size }) => <Activity color={color} size={size ?? 22} />,
          }}
        />
        <Tabs.Screen
          name="plays"
          options={{
            title: 'My plays',
            tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size ?? 22} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => <History color={color} size={size ?? 22} />,
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            title: 'Support',
            tabBarIcon: ({ color, size }) => <Heart color={color} size={size ?? 22} />,
          }}
        />
        <Tabs.Screen
          name="you"
          options={{
            title: 'You',
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size ?? 22} />,
          }}
        />
      </Tabs>
    </>
  );
}
