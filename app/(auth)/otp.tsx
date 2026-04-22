import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth';

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setTokens = useAuthStore((s) => s.setTokens);
  const setIsNewUser = useAuthStore((s) => s.setIsNewUser);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.post<{
        access_token: string;
        refresh_token: string;
        owner_id: string;
        is_new_user: boolean;
        consent_required: boolean;
      }>('/auth/otp/verify', { phone_number: phone, otp }, { noAuth: true });

      setTokens(data.access_token, data.refresh_token, data.owner_id);
      setIsNewUser(data.is_new_user);

      if (data.consent_required) {
        router.replace('/(auth)/consent');
      } else if (data.is_new_user) {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      setError(e.detail || 'Incorrect code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Enter the code</Text>
        <Text style={styles.sub}>Sent to {phone}.</Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          placeholder="123456"
          placeholderTextColor={colors.textTertiary}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, otp.length < 6 && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={otp.length < 6 || loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resend}>
          <Text style={styles.resendText}>Resend code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
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
  otpInput: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingVertical: spacing(3),
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: spacing(4),
  },
  error: {
    color: colors.statusFlag,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing(2),
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing(4),
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing(6),
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: colors.textOnDark, fontSize: 16, fontWeight: '500' },
  resend: { alignItems: 'center', marginTop: spacing(4) },
  resendText: { color: colors.textTertiary, fontSize: 13 },
});
