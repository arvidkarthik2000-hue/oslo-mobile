/**
 * Entry point — POC: skip auth, initialize demo user, go to tabs.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { initializeDemoUser } from '../lib/init';
import { initApiUrl } from '../lib/api';
import { colors, spacing } from '../components/design-tokens';

export default function Index() {
  const token = useAuthStore((s) => s.accessToken);
  const [loading, setLoading] = useState(!token);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) return;

    (async () => {
      await initApiUrl();
      const ok = await initializeDemoUser();
      if (!ok) {
        setError('Could not connect to server. Check your network and API URL.');
      }
      setLoading(false);
    })();
  }, [token]);

  if (token) {
    return <Redirect href="/(tabs)/home" />;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>O</Text>
        </View>
        <Text style={styles.appName}>OSLO</Text>
        <ActivityIndicator
          color={colors.accent}
          size="large"
          style={{ marginTop: spacing(6) }}
        />
        <Text style={styles.loadingText}>Setting up your demo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.hint}>
          Set EXPO_PUBLIC_API_URL in .env to your backend address
        </Text>
      </View>
    );
  }

  // Token was just set by initializeDemoUser, re-render will redirect
  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
    padding: spacing(8),
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(4),
  },
  logoText: { fontSize: 36, color: '#fff', fontWeight: '500' },
  appName: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing(4),
  },
  errorIcon: { fontSize: 48, marginBottom: spacing(4) },
  errorText: {
    fontSize: 16,
    color: colors.statusFlag,
    textAlign: 'center',
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing(3),
  },
});
