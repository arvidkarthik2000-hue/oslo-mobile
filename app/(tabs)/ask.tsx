/**
 * Ask AI tab — placeholder shell for Day 5 build.
 * Shows the chat UI concept with disclaimer.
 */
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, radius } from '../../components/design-tokens';
import { AIDisclaimer } from '../../components';

export default function AskScreen() {
  const [question, setQuestion] = React.useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Ask AI</Text>
        <Text style={styles.subtitle}>
          Ask questions about your health records
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🤖</Text>
        <Text style={styles.emptyTitle}>Your health assistant</Text>
        <Text style={styles.emptyText}>
          Ask questions like "What was my HbA1c last time?" or "Show me my
          cholesterol trend."
        </Text>
      </View>

      <AIDisclaimer />

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your health records..."
          placeholderTextColor={colors.textTertiary}
          value={question}
          onChangeText={setQuestion}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !question.trim() && styles.sendDisabled]}
          disabled={!question.trim()}
          onPress={() => {
            Alert.alert(
              'Coming soon',
              'Ask AI will be fully functional on Day 5.'
            );
            setQuestion('');
          }}
        >
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    padding: spacing(5),
    paddingBottom: spacing(2),
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(8),
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing(3) },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing(2),
    lineHeight: 20,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing(2),
    padding: spacing(4),
    borderTopWidth: 1,
    borderTopColor: colors.borderTertiary,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    fontSize: 14,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.bgTertiary,
  },
  sendText: {
    fontSize: 20,
    color: colors.textOnDark,
    fontWeight: '600',
  },
});
