import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../components/design-tokens';

function TabIcon({ emoji }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { borderTopColor: colors.borderTertiary },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} /> }} />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline', tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} /> }} />
      <Tabs.Screen name="records" options={{ title: 'Records', tabBarIcon: ({ color }) => <TabIcon emoji="📁" color={color} /> }} />
      <Tabs.Screen name="trends" options={{ title: 'Trends', tabBarIcon: ({ color }) => <TabIcon emoji="📈" color={color} /> }} />
      <Tabs.Screen name="ask" options={{ title: 'Ask', tabBarIcon: ({ color }) => <TabIcon emoji="🤖" color={color} /> }} />
    </Tabs>
  );
}
