import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../components/design-tokens';

export default function RecordsScreen() {
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
          Records
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            marginTop: spacing(2),
          }}
        >
          All your documents organized by category.
        </Text>
      </View>
    </SafeAreaView>
  );
}
