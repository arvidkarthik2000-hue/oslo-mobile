/**
 * Emergency Profile — read-only card with critical health info.
 * Edit screen stubbed with placeholder.
 */
import React from 'react';
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

// Pre-populated demo data
const DEMO_EMERGENCY = {
  name: 'Demo User',
  dob: '15 March 1978',
  bloodGroup: 'O+',
  allergies: ['Sulfa drugs'],
  conditions: ['Type 2 Diabetes (dx 2019)', 'Dyslipidemia (2022)'],
  medications: [
    'Atorvastatin 10mg — 0-0-1',
    'Metformin 500mg — 1-0-1',
    'Vitamin D3 60000 IU — weekly',
  ],
  emergencyContact: {
    name: 'Priya Sharma',
    relation: 'Spouse',
    phone: '+91 98765 43210',
  },
};

export default function EmergencyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🆘 Emergency Profile</Text>
          <Text style={styles.subtitle}>
            Share this screen with emergency responders
          </Text>
        </View>

        {/* Identity */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{DEMO_EMERGENCY.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.value}>{DEMO_EMERGENCY.dob}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Blood Group</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{DEMO_EMERGENCY.bloodGroup}</Text>
            </View>
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ Allergies</Text>
          {DEMO_EMERGENCY.allergies.map((a, i) => (
            <View key={i} style={styles.alertRow}>
              <Text style={styles.alertText}>{a}</Text>
            </View>
          ))}
        </View>

        {/* Conditions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🩺 Chronic Conditions</Text>
          {DEMO_EMERGENCY.conditions.map((c, i) => (
            <Text key={i} style={styles.listItem}>• {c}</Text>
          ))}
        </View>

        {/* Current Medications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💊 Current Medications</Text>
          {DEMO_EMERGENCY.medications.map((m, i) => (
            <Text key={i} style={styles.listItem}>• {m}</Text>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📞 Emergency Contact</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{DEMO_EMERGENCY.emergencyContact.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Relation</Text>
            <Text style={styles.value}>{DEMO_EMERGENCY.emergencyContact.relation}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={[styles.value, { color: colors.accent }]}>
              {DEMO_EMERGENCY.emergencyContact.phone}
            </Text>
          </View>
        </View>

        {/* Edit stub */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => Alert.alert('Coming soon', 'Edit emergency profile will be available in v1.1.')}
        >
          <Text style={styles.editText}>✏️ Edit Emergency Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { paddingBottom: spacing(10) },
  header: {
    padding: spacing(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  back: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: spacing(2),
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing(1),
  },
  card: {
    margin: spacing(5),
    marginBottom: 0,
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderTertiary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing(3),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing(2),
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    backgroundColor: colors.statusFlagBg,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.statusFlag,
  },
  alertRow: {
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    borderRadius: radius.md,
    backgroundColor: colors.statusFlagBg,
    marginBottom: spacing(1),
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.statusFlag,
  },
  listItem: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing(1),
  },
  editBtn: {
    margin: spacing(5),
    padding: spacing(4),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    alignItems: 'center',
  },
  editText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
