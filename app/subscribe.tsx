/**
 * Subscribe screen — Razorpay test mode.
 * Visual demonstration of the paywall flow only.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../components/design-tokens';

const BENEFITS = [
  { icon: '👨‍👩‍👧‍👦', text: 'Up to 6 family profiles' },
  { icon: '📊', text: 'Unlimited Smart Reports' },
  { icon: '🤖', text: 'Unlimited Ask AI questions' },
  { icon: '📤', text: 'Doctor-presentable PDF summaries' },
  { icon: '⌚', text: 'Wearable data integration' },
  { icon: '🔔', text: 'Health alerts and reminders' },
  { icon: '☁️', text: 'Cloud backup and sync' },
  { icon: '🏥', text: 'Teleconsult access (coming soon)' },
];

export default function SubscribeScreen() {
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = () => {
    setProcessing(true);
    // Simulate Razorpay test mode checkout
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        '✅ Subscription Active!',
        'You are now on the Family Plan (test mode). This is a demo — no real payment was charged.',
        [
          {
            text: 'Great!',
            onPress: () => router.back(),
          },
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>✨</Text>
          <Text style={styles.heroTitle}>OSLO Family Plan</Text>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>₹199</Text>
            <Text style={styles.period}>/month</Text>
          </View>
          <Text style={styles.heroSub}>
            Everything in Free, plus family profiles and unlimited AI features.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Comparison */}
        <View style={styles.comparison}>
          <View style={styles.compRow}>
            <Text style={styles.compLabel}></Text>
            <Text style={styles.compHeader}>Free</Text>
            <Text style={[styles.compHeader, styles.compHeaderPro]}>Family</Text>
          </View>
          {[
            ['Profiles', '1', '6'],
            ['Smart Reports', '3/mo', '∞'],
            ['Ask AI', '10/mo', '∞'],
            ['PDF Share', '✓', '✓'],
            ['Wearables', '—', '✓'],
            ['Teleconsult', '—', 'Soon'],
          ].map(([label, free, pro], i) => (
            <View key={i} style={styles.compRow}>
              <Text style={styles.compLabel}>{label}</Text>
              <Text style={styles.compFree}>{free}</Text>
              <Text style={styles.compPro}>{pro}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, processing && styles.ctaDisabled]}
          onPress={handleSubscribe}
          disabled={processing}
        >
          <Text style={styles.ctaText}>
            {processing ? 'Processing...' : 'Subscribe — ₹199/month'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.testNote}>
          🧪 Test mode — no real payment will be charged
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { paddingBottom: spacing(10) },
  header: {
    padding: spacing(5),
  },
  back: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing(6),
    paddingHorizontal: spacing(8),
  },
  heroEmoji: { fontSize: 48, marginBottom: spacing(3) },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing(3),
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.accent,
  },
  period: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: spacing(1),
  },
  heroSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing(3),
    lineHeight: 20,
  },
  benefits: {
    paddingHorizontal: spacing(6),
    gap: spacing(3),
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  benefitIcon: { fontSize: 20, width: 30 },
  benefitText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  comparison: {
    margin: spacing(5),
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.bgSecondary,
  },
  compRow: {
    flexDirection: 'row',
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  compLabel: {
    flex: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  compHeader: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  compHeaderPro: {
    color: colors.accent,
  },
  compFree: {
    flex: 1,
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  compPro: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    textAlign: 'center',
  },
  ctaBtn: {
    marginHorizontal: spacing(5),
    padding: spacing(4.5),
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnDark,
  },
  testNote: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing(3),
    fontStyle: 'italic',
  },
});
