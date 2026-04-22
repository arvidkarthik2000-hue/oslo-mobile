/**
 * ExtractionReview — displays extracted lab values in an editable table.
 * User can tap a value to correct it before confirming.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius } from './design-tokens';
import { StatusPill } from './StatusPill';
import type { LabTest } from '../store/documents';

interface ExtractionReviewProps {
  tests: LabTest[];
  onConfirm: (tests: LabTest[]) => void;
  onCancel: () => void;
  documentClass?: string;
}

export function ExtractionReview({
  tests: initialTests,
  onConfirm,
  onCancel,
  documentClass,
}: ExtractionReviewProps) {
  const [tests, setTests] = useState<LabTest[]>(initialTests);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const updateTest = (idx: number, field: keyof LabTest, value: string) => {
    setTests((prev) =>
      prev.map((t, i) =>
        i === idx
          ? {
              ...t,
              [field]:
                field === 'value_num' || field === 'ref_low' || field === 'ref_high'
                  ? parseFloat(value) || undefined
                  : value,
            }
          : t
      )
    );
  };

  const flagToStatus = (flag?: string) => {
    switch (flag) {
      case 'watch':
        return 'watch' as const;
      case 'flag':
      case 'critical':
        return 'flag' as const;
      default:
        return 'ok' as const;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {documentClass === 'lab_report'
            ? 'Extracted Lab Values'
            : documentClass === 'prescription'
              ? 'Extracted Medications'
              : 'Extracted Data'}
        </Text>
        <Text style={styles.subtitle}>
          Review the values below. Tap any value to edit.
        </Text>
      </View>

      <ScrollView style={styles.tableWrap}>
        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colName]}>Test</Text>
          <Text style={[styles.th, styles.colValue]}>Value</Text>
          <Text style={[styles.th, styles.colUnit]}>Unit</Text>
          <Text style={[styles.th, styles.colRef]}>Ref Range</Text>
          <Text style={[styles.th, styles.colStatus]}>Status</Text>
        </View>

        {/* Table rows */}
        {tests.map((test, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.row,
              idx % 2 === 1 && styles.rowAlt,
              editingIdx === idx && styles.rowEditing,
            ]}
            onPress={() => setEditingIdx(editingIdx === idx ? null : idx)}
            activeOpacity={0.8}
          >
            <Text style={[styles.td, styles.colName]} numberOfLines={2}>
              {test.test_name}
            </Text>

            {editingIdx === idx ? (
              <TextInput
                style={[styles.td, styles.colValue, styles.input]}
                value={String(test.value_num ?? '')}
                onChangeText={(v) => updateTest(idx, 'value_num', v)}
                keyboardType="numeric"
                autoFocus
              />
            ) : (
              <Text style={[styles.td, styles.colValue, styles.valueText]}>
                {test.value_num ?? '—'}
              </Text>
            )}

            <Text style={[styles.td, styles.colUnit]}>{test.unit ?? ''}</Text>

            <Text style={[styles.td, styles.colRef]}>
              {test.ref_low != null && test.ref_high != null
                ? `${test.ref_low}–${test.ref_high}`
                : '—'}
            </Text>

            <View style={[styles.colStatus]}>
              <StatusPill status={flagToStatus(test.flag)} text={test.flag === 'critical' ? 'Critical' : test.flag === 'flag' ? 'High' : test.flag === 'watch' ? 'Watch' : 'Normal'} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => onConfirm(tests)}
        >
          <Text style={styles.confirmText}>Confirm & Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: spacing(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing(1),
  },
  tableWrap: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    backgroundColor: colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  th: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  rowAlt: {
    backgroundColor: colors.bgSecondary,
  },
  rowEditing: {
    backgroundColor: colors.accentMuted,
  },
  td: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  colName: { flex: 3 },
  colValue: { flex: 2, textAlign: 'right' },
  colUnit: { flex: 1.5, textAlign: 'center' },
  colRef: { flex: 2, textAlign: 'center' },
  colStatus: { flex: 1.5, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    backgroundColor: colors.bgPrimary,
  },
  valueText: {
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing(3),
    padding: spacing(5),
    borderTopWidth: 1,
    borderTopColor: colors.borderTertiary,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing(3.5),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: spacing(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    color: colors.textOnDark,
    fontWeight: '600',
  },
});
