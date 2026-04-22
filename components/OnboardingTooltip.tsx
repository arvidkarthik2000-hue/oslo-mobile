/**
 * OnboardingTooltip — dismissible tooltip shown on first visit.
 * Stores dismissal state in AsyncStorage.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius } from './design-tokens';

interface OnboardingTooltipProps {
  id: string; // unique key for persistence
  text: string;
  position?: 'top' | 'bottom';
}

export function OnboardingTooltip({
  id,
  text,
  position = 'top',
}: OnboardingTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(`tooltip_${id}`).then((val) => {
      if (val !== 'dismissed') setVisible(true);
    });
  }, [id]);

  const dismiss = async () => {
    await AsyncStorage.setItem(`tooltip_${id}`, 'dismissed');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, position === 'bottom' && styles.bottom]}>
      <View style={styles.tooltip}>
        <Text style={styles.text}>{text}</Text>
        <TouchableOpacity onPress={dismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing(4),
    right: spacing(4),
    zIndex: 100,
  },
  bottom: {
    top: undefined,
    bottom: 0,
  },
  tooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(3),
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: colors.textOnDark,
    lineHeight: 18,
  },
  dismissBtn: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dismissText: {
    fontSize: 12,
    color: colors.textOnDark,
    fontWeight: '600',
  },
});
