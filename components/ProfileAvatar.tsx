import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from './design-tokens';

interface Props {
  size: 32 | 44 | 52;
  initials: string;
  color?: string;
}

export function ProfileAvatar({ size, initials, color = colors.accent }: Props) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: size < 40 ? 12 : size < 50 ? 16 : 18 },
        ]}
      >
        {initials.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.textOnDark, fontWeight: '500', letterSpacing: 0.3 },
});
