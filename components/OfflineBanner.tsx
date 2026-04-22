/**
 * OfflineBanner — shown when the device is offline.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from './design-tokens';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Simple connectivity check — ping the API periodically
    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000';
        await fetch(`${BASE_URL}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        setOffline(false);
      } catch {
        setOffline(true);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        📡 You're offline. Changes will sync when connection returns.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.statusWatchBg,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.statusWatch + '30',
  },
  text: {
    fontSize: 13,
    color: colors.statusWatch,
    textAlign: 'center',
    fontWeight: '500',
  },
});
