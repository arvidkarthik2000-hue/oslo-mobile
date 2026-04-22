/**
 * Add timeline note — text or voice.
 * Creates a manual timeline entry.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

type Mode = 'text' | 'voice';

export default function AddNoteScreen() {
  const profileId = useAuthStore((s) => s.activeProfileId);
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const saveTextNote = async () => {
    if (!text.trim() || !profileId) return;
    setSaving(true);
    try {
      await api.post('/timeline/note', {
        profile_id: profileId,
        text: text.trim(),
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save note.');
    } finally {
      setSaving(false);
    }
  };

  const saveVoiceNote = async (uri: string, durationSec: number) => {
    if (!profileId) return;
    setSaving(true);
    try {
      await api.post('/timeline/voice-note', {
        profile_id: profileId,
        audio_url: uri,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save voice note.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add to Timeline</Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'text' && styles.modeBtnActive]}
            onPress={() => setMode('text')}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'text' && styles.modeTextActive,
              ]}
            >
              📝 Text Note
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'voice' && styles.modeBtnActive]}
            onPress={() => setMode('voice')}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'voice' && styles.modeTextActive,
              ]}
            >
              🎤 Voice Note
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'text' ? (
          <View style={styles.textWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="What happened? e.g., 'Started new medication', 'BP check at clinic — 138/88'..."
              placeholderTextColor={colors.textTertiary}
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!text.trim() || saving) && styles.saveBtnDisabled,
              ]}
              onPress={saveTextNote}
              disabled={!text.trim() || saving}
            >
              <Text style={styles.saveText}>
                {saving ? 'Saving...' : 'Save Note'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <VoiceRecorder
            onRecordingComplete={saveVoiceNote}
            onCancel={() => setMode('text')}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
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
  modeToggle: {
    flexDirection: 'row',
    margin: spacing(5),
    borderRadius: radius.lg,
    backgroundColor: colors.bgSecondary,
    padding: spacing(1),
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing(3),
    borderRadius: radius.md,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.bgPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modeTextActive: {
    color: colors.textPrimary,
  },
  textWrap: {
    flex: 1,
    padding: spacing(5),
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  saveBtn: {
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    marginTop: spacing(4),
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnDark,
  },
});
