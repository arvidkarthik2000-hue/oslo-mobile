import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../components/design-tokens';
import { AIDisclaimer } from '../../components';

export default function AskScreen() {
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
          Ask OSLO
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            marginTop: spacing(2),
          }}
        >
          Ask questions about your health records. AI-powered answers from your
          own data.
        </Text>
      </View>
      <AIDisclaimer />
    </SafeAreaView>
  );
}
