import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth';

const SEX_OPTIONS = ['M', 'F', 'Other'] as const;
const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown',
] as const;

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD text input for now
  const [sex, setSex] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setActiveProfile = useAuthStore((s) => s.setActiveProfile);

  const canSubmit = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const profile = await api.post<{ profile_id: string }>('/profiles', {
        name: name.trim(),
        relationship: 'self',
        dob: dob || null,
        sex: sex || null,
        blood_group: bloodGroup || null,
      });
      setActiveProfile(profile.profile_id);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.detail || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Set up your profile</Text>
        <Text style={styles.sub}>This is for you — your personal health record.</Text>

        {/* Name */}
        <Text style={styles.label}>Full name *</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Dr. Arvind Karthik"
          placeholderTextColor={colors.textTertiary}
          autoFocus
        />

        {/* DOB */}
        <Text style={styles.label}>Date of birth</Text>
        <TextInput
          style={styles.textInput}
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        {/* Sex */}
        <Text style={styles.label}>Sex</Text>
        <View style={styles.chipRow}>
          {SEX_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, sex === opt && styles.chipActive]}
              onPress={() => setSex(sex === opt ? '' : opt)}
            >
              <Text
                style={[
                  styles.chipText,
                  sex === opt && styles.chipTextActive,
                ]}
              >
                {opt === 'M' ? 'Male' : opt === 'F' ? 'Female' : 'Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Blood Group */}
        <Text style={styles.label}>Blood group</Text>
        <View style={styles.chipRow}>
          {BLOOD_GROUPS.map((bg) => (
            <TouchableOpacity
              key={bg}
              style={[styles.chip, bloodGroup === bg && styles.chipActive]}
              onPress={() => setBloodGroup(bloodGroup === bg ? '' : bg)}
            >
              <Text
                style={[
                  styles.chipText,
                  bloodGroup === bg && styles.chipTextActive,
                ]}
              >
                {bg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, !canSubmit && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'Creating...' : 'Set up profile'}
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
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing(2),
    marginBottom: spacing(6),
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.3,
    marginBottom: spacing(1),
    marginTop: spacing(4),
    textTransform: 'uppercase',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.borderSecondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontSize: 16,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  chip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    backgroundColor: colors.bgTertiary,
  },
  chipActive: { backgroundColor: colors.accentMuted },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  chipTextActive: { color: colors.accentStrong },
  error: {
    color: colors.statusFlag,
    fontSize: 13,
    marginTop: spacing(3),
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
