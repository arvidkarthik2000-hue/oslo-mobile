import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../components/design-tokens';

export default function TimelineScreen() {
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
          Timeline
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            marginTop: spacing(2),
          }}
        >
          Your health events will appear here chronologically.
        </Text>
      </View>
    </SafeAreaView>
  );
}
