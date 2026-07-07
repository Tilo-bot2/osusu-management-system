import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/EmptyState';
import { Ionicons } from '@expo/vector-icons';

function InfoRow({ icon, label, value, colors }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; colors: any }) {
  return (
    <View style={[infoRowStyles.row, { borderBottomColor: colors.border }]}>
      <View style={[infoRowStyles.iconBox, { backgroundColor: colors.secondary }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[infoRowStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[infoRowStyles.value, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  value: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});

export default function OsusuInfoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentMember, isLoggedIn } = useAuth();
  const { cycles, contributions, members } = useData();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/');
  }, [isLoggedIn]);

  const activeCycle = cycles.find(c => c.status === 'active');
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatAmt = (n: number) => `GHS ${n.toLocaleString()}`;

  const totalCollected = contributions.reduce((s, c) => s + c.amount, 0);
  const activeMembers = members.filter(m => m.status === 'active').length;

  const s = styles(colors);

  if (!activeCycle) {
    return (
      <View style={[s.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Text style={[s.pageTitle, { color: colors.foreground, paddingHorizontal: 20, paddingTop: 16 }]}>My Osusu</Text>
        <EmptyState icon="refresh-circle-outline" title="No active cycle" subtitle="No Osusu cycle is currently running. Contact your admin for details." />
      </View>
    );
  }

  return (
    <ScrollView
      style={[s.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.pageTitle, { color: colors.foreground }]}>My Osusu</Text>

      {/* Active badge */}
      <View style={[s.activeBanner, { backgroundColor: colors.primary }]}>
        <View style={s.activeBannerLeft}>
          <View style={[s.activeDot, { backgroundColor: '#4ADE80' }]} />
          <Text style={s.activeLabel}>Active Cycle</Text>
        </View>
        <Ionicons name="refresh-circle" size={32} color="rgba(255,255,255,0.25)" />
      </View>

      {/* Group name */}
      <View style={[s.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.groupHeader}>
          <Ionicons name="people" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[s.groupName, { color: colors.foreground }]}>{activeCycle.groupName}</Text>
            <View style={[s.statusPill, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[s.statusPillTxt, { color: '#059669' }]}>Active</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <InfoRow icon="calendar-outline" label="Start Date" value={formatDate(activeCycle.startDate)} colors={colors} />
          <InfoRow icon="calendar" label="End Date" value={formatDate(activeCycle.endDate)} colors={colors} />
          <InfoRow icon="cash-outline" label="Contribution Amount" value={formatAmt(activeCycle.contributionAmount)} colors={colors} />
          <InfoRow icon="time-outline" label="Frequency" value={activeCycle.frequency.charAt(0).toUpperCase() + activeCycle.frequency.slice(1)} colors={colors} />
          <InfoRow icon="people-outline" label="Number of Members" value={activeCycle.numberOfMembers.toString()} colors={colors} />
        </View>
      </View>

      {/* Group Stats */}
      <Text style={[s.sectionTitle, { color: colors.foreground }]}>Group Statistics</Text>
      <View style={s.statsGrid}>
        <View style={[s.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.statVal, { color: colors.primary }]}>{activeMembers}</Text>
          <Text style={[s.statLbl, { color: colors.mutedForeground }]}>Active Members</Text>
        </View>
        <View style={[s.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.statVal, { color: colors.accent }]}>{formatAmt(totalCollected)}</Text>
          <Text style={[s.statLbl, { color: colors.mutedForeground }]}>Total Collected</Text>
        </View>
        <View style={[s.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.statVal, { color: colors.info }]}>{formatAmt(activeCycle.contributionAmount * activeMembers)}</Text>
          <Text style={[s.statLbl, { color: colors.mutedForeground }]}>Daily Target</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', paddingHorizontal: 20, marginBottom: 16 },
  activeBanner: { marginHorizontal: 20, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  activeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  groupCard: { marginHorizontal: 20, borderRadius: 18, padding: 18, borderWidth: 1, marginBottom: 24 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  groupName: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  statusPillTxt: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', paddingHorizontal: 20, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'center' },
  statVal: { fontSize: 15, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 4 },
  statLbl: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
