/**
 * Settings screen — Profile, Privacy (placeholder), About, Demo Reset.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../components/design-tokens';
import { useAuthStore } from '../store/auth';
import { useDocumentsStore } from '../store/documents';

export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);
  const clearDocs = useDocumentsStore((s) => s.clear);
  const [name, setName] = useState('Demo User');
  const [dob, setDob] = useState('1978-03-15');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const handleResetDemo = () => {
    Alert.alert(
      'Reset to Demo State',
      'This will clear all data and recreate the demo profile. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearDocs();
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleResetEmpty = () => {
    Alert.alert(
      'Reset to Empty State',
      'This will clear ALL data. You can upload fresh documents. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearDocs();
            // Keep auth — just clear documents
            Alert.alert('Done', 'All documents cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Blood Group</Text>
            <TextInput
              style={styles.input}
              value={bloodGroup}
              onChangeText={setBloodGroup}
              placeholder="e.g. O+, A-, B+"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Data Processing Consent</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Export My Data</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Delete My Account</Text>
            <Text style={[styles.rowText, { color: colors.statusFlag }]}>›</Text>
          </TouchableOpacity>
          <Text style={styles.privacyNote}>
            Full DPDP compliance controls coming in v1.1
          </Text>
        </View>

        {/* Demo Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo Controls</Text>
          <TouchableOpacity style={styles.demoBtn} onPress={handleResetDemo}>
            <Text style={styles.demoBtnText}>🔄 Reset to Demo State</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.demoBtn, styles.demoBtnDestructive]}
            onPress={handleResetEmpty}
          >
            <Text style={[styles.demoBtnText, { color: colors.statusFlag }]}>
              🗑️ Reset to Empty State
            </Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            OSLO v1.0.0 (POC Build){"\n"}
            Built with ❤️ for Indian healthcare{"\n\n"}
            Powered by:{"\n"}
            • EkaCare Health Records Standard{"\n"}
            • Google MedGemma (AI extraction){"\n"}
            • LabSamjho-style explanations{"\n\n"}
            © 2026 XQZ Health Technologies
          </Text>
        </View>
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
  section: {
    padding: spacing(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing(3),
  },
  field: {
    marginBottom: spacing(3),
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing(1),
  },
  input: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing(4),
    fontSize: 15,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  rowText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowChevron: {
    fontSize: 18,
    color: colors.textTertiary,
  },
  privacyNote: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing(2),
  },
  demoBtn: {
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  demoBtnDestructive: {
    backgroundColor: colors.statusFlagBg,
  },
  demoBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
