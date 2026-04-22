import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from './design-tokens';

export function AIDisclaimer() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        AI-generated information is for reference only and is not a diagnosis or
        medical advice. Always consult a qualified doctor.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing(3),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
  },
  text: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
