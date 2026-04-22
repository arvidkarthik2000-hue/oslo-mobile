import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { api } from '../../lib/api';

interface ConsentItem {
  purpose: string;
  title: string;
  description: string;
  required: boolean;
}

const CONSENTS: ConsentItem[] = [
  {
    purpose: 'storage',
    title: 'Store my health records',
    description:
      'Your documents are encrypted and stored on servers in India (Mumbai). Required to use OSLO.',
    required: true,
  },
  {
    purpose: 'ai_extraction',
    title: 'AI data extraction',
    description:
      'Use AI to read your documents, extract lab values, and organize them. Required for core features.',
    required: true,
  },
  {
    purpose: 'cloud_ai_optin',
    title: 'Cloud AI processing',
    description:
      'Allow cloud-based AI models (e.g., Claude) to process your documents for better accuracy. You can revoke anytime.',
    required: false,
  },
  {
    purpose: 'training_corrections',
    title: 'Help improve accuracy',
    description:
      'Your corrections to AI extractions may be used (anonymized) to improve the system for all users.',
    required: false,
  },
];

const CONSENT_TEXT_VERSION = 'v1.0-2026-04-22';

export default function ConsentScreen() {
  const [grants, setGrants] = useState<Record<string, boolean>>(
    Object.fromEntries(
      CONSENTS.map((c) => [c.purpose, c.required]), // required ones start on
    ),
  );
  const [loading, setLoading] = useState(false);

  const allRequiredGranted = CONSENTS.filter((c) => c.required).every(
    (c) => grants[c.purpose],
  );

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Send each consent
      for (const consent of CONSENTS) {
        await api.post('/consents', {
          purpose: consent.purpose,
          granted: grants[consent.purpose] ?? false,
          consent_text_version: CONSENT_TEXT_VERSION,
          consent_text: `${consent.title}: ${consent.description}`,
        });
      }
      router.replace('/(auth)/profile-setup');
    } catch (e: any) {
      // TODO: show error toast
      console.error('Consent save failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Your data, your choice</Text>
        <Text style={styles.sub}>
          OSLO follows India's Digital Personal Data Protection Act, 2023. Read
          each item carefully.
        </Text>

        {CONSENTS.map((c) => (
          <View key={c.purpose} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                {c.required && <Text style={styles.required}>Required</Text>}
              </View>
              <Switch
                value={grants[c.purpose]}
                onValueChange={(v) => {
                  if (c.required) return; // can't toggle required off
                  setGrants((prev) => ({ ...prev, [c.purpose]: v }));
                }}
                disabled={c.required}
                trackColor={{
                  false: colors.bgTertiary,
                  true: colors.accentMuted,
                }}
                thumbColor={
                  grants[c.purpose] ? colors.accent : colors.textTertiary
                }
              />
            </View>
            <Text style={styles.cardDesc}>{c.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, !allRequiredGranted && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={!allRequiredGranted || loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: spacing(6), paddingBottom: spacing(20) },
  heading: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing(2),
    marginBottom: spacing(6),
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    padding: spacing(4),
    marginBottom: spacing(3),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: { flex: 1, marginRight: spacing(3) },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  required: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '500',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing(2),
    lineHeight: 18,
  },
  footer: {
    padding: spacing(6),
    borderTopWidth: 1,
    borderTopColor: colors.borderTertiary,
    backgroundColor: colors.bgPrimary,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing(4),
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: colors.textOnDark, fontSize: 16, fontWeight: '500' },
});
