import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../components/design-tokens';

export default function TrendsScreen() {
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
          Trends
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            marginTop: spacing(2),
          }}
        >
          Lab value trends and health metrics over time.
        </Text>
      </View>
    </SafeAreaView>
  );
}
