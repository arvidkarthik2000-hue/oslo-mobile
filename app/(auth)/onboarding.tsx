import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';

const features = [
  {
    icon: '📋',
    title: 'All records in one place',
    sub: 'Lab reports, prescriptions, discharges',
  },
  {
    icon: '📈',
    title: 'Track trends over time',
    sub: 'See how your health changes',
  },
  {
    icon: '🔒',
    title: 'Privacy first',
    sub: 'Encrypted. Stored in India. Yours.',
  },
];

export default function Onboarding() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>O</Text>
          </View>
          <Text style={styles.appName}>OSLO</Text>
          <Text style={styles.tagline}>
            Your family's health history,{"\n"}organized and private.
          </Text>
        </View>

        <View style={styles.features}>
          {features.map(({ icon, title, sub }) => (
            <View key={title} style={styles.feature}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureSub}>{sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push('/(auth)/phone')}
        >
          <Text style={styles.ctaText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: {
    flex: 1,
    paddingHorizontal: spacing(6),
    justifyContent: 'space-between',
    paddingVertical: spacing(8),
  },
  hero: { alignItems: 'center', marginTop: spacing(8) },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
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
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing(3),
    lineHeight: 24,
  },
  features: { gap: spacing(4) },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing(4) },
  featureIcon: { fontSize: 24, width: 36 },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  featureSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cta: {
    backgroundColor: colors.accent,
    paddingVertical: spacing(4),
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  ctaText: { color: colors.textOnDark, fontSize: 16, fontWeight: '500' },
});
