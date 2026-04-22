/**
 * Timeline tab — date-threaded vertical list of all events.
 * Filter chips: All / Lab / Rx / Imaging / Notes.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { FilterChip, OnboardingTooltip } from '../../components';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

interface TimelineEventItem {
  event_id: string;
  event_type: string;
  occurred_at: string;
  title: string;
  subtitle?: string;
  provider?: string;
  source_ref?: string;
  source_ref_type?: string;
  flags?: any;
}

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'lab', label: 'Lab' },
  { key: 'prescription', label: 'Rx' },
  { key: 'imaging', label: 'Imaging' },
  { key: 'note', label: 'Notes' },
];

const eventIcon = (type: string) => {
  switch (type) {
    case 'lab': return '🧪';
    case 'prescription': return '💊';
    case 'imaging': return '🩻';
    case 'discharge': return '🏥';
    case 'note': return '📝';
    case 'voice_note': return '🎤';
    case 'visit': return '🩺';
    default: return '📋';
  }
};

export default function TimelineScreen() {
  const profileId = useAuthStore((s) => s.activeProfileId);
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      let path = '/timeline?limit=100';
      if (profileId) path += `&profile_id=${profileId}`;
      if (filter) path += `&event_type=${filter}`;
      if (search) path += `&search=${encodeURIComponent(search)}`;

      const res = await api.get<{ events: TimelineEventItem[]; total: number }>(path);
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profileId, filter, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const renderEvent = ({ item }: { item: TimelineEventItem }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        if (item.source_ref && item.source_ref_type === 'document') {
          router.push({
            pathname: '/document/[id]',
            params: { id: item.source_ref },
          });
        }
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.eventIcon}>{eventIcon(item.event_type)}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.eventSub} numberOfLines={2}>
            {item.subtitle}
          </Text>
        )}
        <Text style={styles.eventDate}>
          {new Date(item.occurred_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
          {item.provider ? ` · ${item.provider}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <View style={{ flexDirection: 'row', gap: spacing(4) }}>
          <TouchableOpacity onPress={() => router.push('/timeline/add-note')}>
            <Text style={styles.searchIcon}>✚</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      {showSearch && (
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchEvents}
            returnKeyType="search"
          />
        </View>
      )}

      {/* Onboarding tooltip */}
      <OnboardingTooltip
        id="timeline_intro"
        text="Your health timeline shows every lab, prescription, and note in one place. Tap any event to see details."
      />

      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>

      {/* Events list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>No events yet</Text>
          <Text style={styles.emptyHint}>Upload a document to see your timeline</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.event_id}
          renderItem={renderEvent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: spacing(10) }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(5),
    paddingBottom: spacing(2),
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchIcon: { fontSize: 20 },
  searchWrap: {
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(2),
  },
  searchInput: {
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing(4),
    fontSize: 14,
    color: colors.textPrimary,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing(2),
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(3),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(8),
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing(3) },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing(2),
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(3),
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  eventIcon: { fontSize: 24, marginTop: 2 },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  eventSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  eventDate: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing(1),
  },
});
