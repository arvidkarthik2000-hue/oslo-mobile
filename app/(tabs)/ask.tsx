/**
 * Ask AI tab — chat UI with message bubbles, citations, and disclaimer.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, radius } from '../../components/design-tokens';
import { AIDisclaimer } from '../../components';
import { CriticalValueBanner } from '../../components/CriticalValueBanner';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: Array<{ document_id: string; snippet: string }>;
  refused?: boolean;
  critical_flag?: boolean;
  timestamp: Date;
}

export default function AskScreen() {
  const profileId = useAuthStore((s) => s.activeProfileId);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendQuestion = async () => {
    const q = question.trim();
    if (!q || !profileId || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post<{
        answer_markdown: string;
        intent?: string;
        refused?: boolean;
        critical_flag?: boolean;
        citations?: Array<{ document_id: string; snippet: string }>;
      }>('/ask', {
        profile_id: profileId,
        question: q,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: res.answer_markdown,
        citations: res.citations || undefined,
        refused: res.refused,
        critical_flag: res.critical_flag,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Ask AI is temporarily unavailable. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubble,
        item.role === 'user' ? styles.userBubble : styles.aiBubble,
      ]}
    >
      {item.critical_flag && (
        <CriticalValueBanner
          flags={['Critical values detected in your records']}
        />
      )}
      <Text
        style={[
          styles.bubbleText,
          item.role === 'user' ? styles.userText : styles.aiText,
        ]}
      >
        {item.text}
      </Text>
      {item.citations && item.citations.length > 0 && (
        <View style={styles.citations}>
          <Text style={styles.citationsTitle}>Sources:</Text>
          {item.citations.map((c, i) => (
            <Text key={i} style={styles.citation}>
              [{i + 1}] {c.snippet}
            </Text>
          ))}
        </View>
      )}
      {item.refused && (
        <Text style={styles.refusedNote}>
          This question requires clinical interpretation. Please consult your doctor.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Ask AI</Text>
          <Text style={styles.subtitle}>
            Ask questions about your health records
          </Text>
        </View>

        {messages.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={styles.emptyTitle}>Your health assistant</Text>
            <Text style={styles.emptyText}>
              Ask questions like "What was my HbA1c last time?" or "Show my
              cholesterol trend."
            </Text>
            <View style={styles.suggestions}>
              {[
                'What was my last HbA1c?',
                'Am I taking any medications?',
                'How has my cholesterol changed?',
              ].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestion}
                  onPress={() => setQuestion(s)}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <AIDisclaimer />

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your health records..."
            placeholderTextColor={colors.textTertiary}
            value={question}
            onChangeText={setQuestion}
            multiline
            onSubmitEditing={sendQuestion}
          />
          {loading ? (
            <View style={styles.sendBtn}>
              <ActivityIndicator size="small" color={colors.textOnDark} />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.sendBtn, !question.trim() && styles.sendDisabled]}
              disabled={!question.trim()}
              onPress={sendQuestion}
            >
              <Text style={styles.sendText}>↑</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
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
  suggestions: {
    marginTop: spacing(6),
    gap: spacing(2),
    width: '100%',
  },
  suggestion: {
    padding: spacing(3),
    borderRadius: radius.md,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderTertiary,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.accent,
  },
  messageList: {
    padding: spacing(4),
    gap: spacing(3),
  },
  bubble: {
    maxWidth: '85%',
    padding: spacing(4),
    borderRadius: radius.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgSecondary,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userText: {
    color: colors.textOnDark,
  },
  aiText: {
    color: colors.textPrimary,
  },
  citations: {
    marginTop: spacing(3),
    paddingTop: spacing(2),
    borderTopWidth: 1,
    borderTopColor: colors.borderTertiary,
  },
  citationsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing(1),
  },
  citation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refusedNote: {
    fontSize: 12,
    color: colors.statusWatch,
    fontStyle: 'italic',
    marginTop: spacing(2),
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
