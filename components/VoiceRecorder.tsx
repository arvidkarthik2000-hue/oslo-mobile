/**
 * VoiceRecorder — record audio up to 2 minutes using expo-av.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { colors, spacing, radius } from './design-tokens';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, durationSec: number) => void;
  onCancel: () => void;
  maxDurationSec?: number;
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  maxDurationSec = 120,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Microphone Permission',
          'Microphone access is needed to record voice notes. Please enable it in Settings.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= maxDurationSec - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Could not start recording. Check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recording = recordingRef.current;
    if (!recording) {
      setIsRecording(false);
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (uri) {
        onRecordingComplete(uri, elapsed);
      } else {
        Alert.alert('Error', 'Recording failed — no audio file was created.');
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setIsRecording(false);
      Alert.alert('Error', 'Could not save recording.');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(elapsed)}</Text>
      <Text style={styles.limit}>Max {Math.floor(maxDurationSec / 60)} minutes</Text>

      {isRecording ? (
        <View style={styles.controls}>
          <View style={styles.pulseIndicator}>
            <Text style={styles.pulseText}>●</Text>
            <Text style={styles.recordingLabel}>Recording...</Text>
          </View>
          <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
            <Text style={styles.stopText}>⏹ Stop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
            <Text style={styles.recordText}>🎤 Start Recording</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing(6),
    gap: spacing(4),
  },
  timer: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  limit: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  controls: {
    alignItems: 'center',
    gap: spacing(4),
    marginTop: spacing(4),
  },
  pulseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  pulseText: {
    fontSize: 24,
    color: colors.statusFlag,
  },
  recordingLabel: {
    fontSize: 15,
    color: colors.statusFlag,
    fontWeight: '500',
  },
  recordBtn: {
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(4),
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  recordText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnDark,
  },
  stopBtn: {
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(4),
    borderRadius: radius.pill,
    backgroundColor: colors.statusFlag,
  },
  stopText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnDark,
  },
  cancelBtn: {
    paddingVertical: spacing(2),
  },
  cancelText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
