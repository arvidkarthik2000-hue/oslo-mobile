import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { api } from '../../lib/api';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    setError('');
    try {
      await api.post(
        '/auth/otp/send',
        { phone_number: `+91${phone}` },
        { noAuth: true },
      );
      router.push({ pathname: '/(auth)/otp', params: { phone: `+91${phone}` } });
    } catch (e: any) {
      setError(e.detail || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>What's your number?</Text>
          <Text style={styles.sub}>We'll send a one-time code to verify.</Text>

          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="98765 43210"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[styles.btn, phone.length < 10 && styles.btnDisabled]}
            onPress={handleSend}
            disabled={phone.length < 10 || loading}
          >
            <Text style={styles.btnText}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  kav: { flex: 1 },
  container: { flex: 1, padding: spacing(6) },
  back: { marginBottom: spacing(8) },
  backText: { color: colors.accent, fontSize: 15 },
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderSecondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(4),
    backgroundColor: colors.bgSecondary,
    borderRightWidth: 1,
    borderRightColor: colors.borderTertiary,
  },
  prefixText: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  input: {
    flex: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(4),
    fontSize: 16,
    color: colors.textPrimary,
  },
  error: {
    color: colors.statusFlag,
    fontSize: 13,
    marginTop: spacing(2),
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
