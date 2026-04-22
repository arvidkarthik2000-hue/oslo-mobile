import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../components/design-tokens';
import { AIDisclaimer } from '../../components';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <View style={{ padding: spacing(6) }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '500',
            color: colors.textPrimary,
          }}
        >
          Good morning
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            marginTop: spacing(2),
          }}
        >
          No records yet. Tap + to add your first document.
        </Text>
      </View>
      <AIDisclaimer />
    </SafeAreaView>
  );
}
