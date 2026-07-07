import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import EmptyState from '@/components/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Announcement } from '@/types';

const TYPE_CONFIG = {
  payment_deadline: { label: 'Payment Deadline', icon: 'alarm-outline' as const, bg: '#FEF3C7', color: '#D97706', border: '#F59E0B' },
  emergency: { label: 'Emergency', icon: 'warning-outline' as const, bg: '#FEE2E2', color: '#DC2626', border: '#EF4444' },
  general: { label: 'General', icon: 'information-circle-outline' as const, bg: '#DBEAFE', color: '#1D4ED8', border: '#3B82F6' },
};

export default function AnnouncementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { announcements } = useData();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/');
  }, [isLoggedIn]);

  const sorted = [...announcements].sort((a, b) => b.date.localeCompare(a.date));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  const renderItem = ({ item }: { item: Announcement }) => {
    const cfg = TYPE_CONFIG[item.type];
    return (
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[s.typeBar, { backgroundColor: cfg.border }]} />
        <View style={s.cardInner}>
          <View style={s.topRow}>
            <View style={[s.typeBadge, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={13} color={cfg.color} />
              <Text style={[s.typeTxt, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <Text style={[s.date, { color: colors.mutedForeground }]}>{formatDate(item.date)}</Text>
          </View>
          <Text style={[s.title, { color: colors.foreground }]}>{item.title}</Text>
          <Text style={[s.msg, { color: colors.mutedForeground }]}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <Text style={[s.pageTitle, { color: colors.foreground }]}>Announcements</Text>
        <Text style={[s.pageCount, { color: colors.mutedForeground }]}>{sorted.length} notice{sorted.length !== 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={sorted}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad + 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title="No announcements" subtitle="Check back later for updates from your group admin" />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  pageCount: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  card: { borderRadius: 16, borderWidth: 1, flexDirection: 'row', overflow: 'hidden' },
  typeBar: { width: 4 },
  cardInner: { flex: 1, padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeTxt: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  date: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  title: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  msg: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
});
