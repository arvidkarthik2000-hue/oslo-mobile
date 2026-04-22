import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from './design-tokens';

export interface Tab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function TabBar({ tabs, active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={styles.tab}
        >
          {tab.icon}
          <Text
            style={[
              styles.label,
              { color: active === tab.key ? colors.accent : colors.textTertiary },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderTertiary,
    backgroundColor: colors.bgPrimary,
    paddingBottom: spacing(2),
  },
  tab: { flex: 1, alignItems: 'center', paddingTop: spacing(2) },
  label: { fontSize: 10, fontWeight: '500', marginTop: 2 },
});
