import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import SimpleBarChart from '@/components/SimpleBarChart';
import { Ionicons } from '@expo/vector-icons';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'annual';

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const { contributions, members, cycles } = useData();
  const [reportType, setReportType] = useState<ReportType>('daily');

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace('/');
  }, [isLoggedIn, isAdmin]);

  const now = new Date();
  const today = now.toISOString().split('T')[0]!;

  // Build chart data — last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const dStr = d.toISOString().split('T')[0]!;
    const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3);
    const total = contributions.filter(c => c.date === dStr).reduce((s, c) => s + c.amount, 0);
    return { label: dayLabel, value: total };
  });

  // Compute report period
  const getRange = (): [string, string] => {
    if (reportType === 'daily') return [today, today];
    if (reportType === 'weekly') {
      const ws = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]!;
      return [ws, today];
    }
    if (reportType === 'monthly') {
      const ms = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!;
      return [ms, today];
    }
    const ys = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]!;
    return [ys, today];
  };

  const [start, end] = getRange();
  const periodContribs = contributions.filter(c => c.date >= start && c.date <= end);
  const totalCollected = periodContribs.reduce((s, c) => s + c.amount, 0);
  const totalPayments = periodContribs.length;
  const uniqueMembers = new Set(periodContribs.map(c => c.memberId)).size;
  const activeCycle = cycles.find(c => c.status === 'active');
  const activeMembers = members.filter(m => m.status === 'active').length;

  // Member breakdown
  const memberBreakdown = members
    .filter(m => m.status === 'active')
    .map(m => {
      const paid = periodContribs.filter(c => c.memberId === m.memberId).reduce((s, c) => s + c.amount, 0);
      return { ...m, paid };
    })
    .sort((a, b) => b.paid - a.paid);

  const formatAmt = (n: number) => `SLE ${n.toLocaleString()}`;

  const handleShare = async () => {
    const reportTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report — ${new Date().toLocaleDateString('en-GB')}`;
    const lines = [
      `=== ${reportTitle} ===`,
      `Period: ${start} to ${end}`,
      '',
      `Total Contributions: ${formatAmt(totalCollected)}`,
      `Total Payments: ${totalPayments}`,
      `Members Contributed: ${uniqueMembers}`,
      `Active Members: ${activeMembers}`,
      '',
      '--- Member Breakdown ---',
      ...memberBreakdown.map(m => `${m.fullName} (${m.memberId}): ${formatAmt(m.paid)}`),
      '',
      activeCycle ? `Active Cycle: ${activeCycle.groupName}` : 'No active cycle.',
      `Generated: ${new Date().toLocaleString('en-GB')}`,
    ];
    try {
      await Share.share({ message: lines.join('\n'), title: reportTitle });
    } catch {
      Alert.alert('Share', 'Unable to share at this time.');
    }
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  const allTimeTotals = contributions.reduce((s, c) => s + c.amount, 0);

  return (
    <ScrollView
      style={[s.root, { backgroundColor: '#0D1F16' }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.pageTitle}>Reports</Text>
        <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color="#000" />
          <Text style={s.shareBtnTxt}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Report Type Selector */}
      <View style={s.reportTypeSel}>
        {(['daily', 'weekly', 'monthly', 'annual'] as ReportType[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[s.typeBtn, { backgroundColor: reportType === t ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]}
            onPress={() => setReportType(t)}
          >
            <Text style={[s.typeBtnTxt, { color: reportType === t ? '#000' : '#9CA3AF' }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Period */}
      <Text style={s.periodTxt}>
        {start === end ? start : `${start} — ${end}`}
      </Text>

      {/* Summary Cards */}
      <View style={s.grid}>
        <View style={s.statCard}>
          <Ionicons name="cash-outline" size={22} color="#4ADE80" />
          <Text style={s.statVal}>{formatAmt(totalCollected)}</Text>
          <Text style={s.statLbl}>Total Collected</Text>
        </View>
        <View style={s.statCard}>
          <Ionicons name="receipt-outline" size={22} color="#F59E0B" />
          <Text style={s.statVal}>{totalPayments}</Text>
          <Text style={s.statLbl}>Payments</Text>
        </View>
        <View style={s.statCard}>
          <Ionicons name="people-outline" size={22} color="#60A5FA" />
          <Text style={s.statVal}>{uniqueMembers}</Text>
          <Text style={s.statLbl}>Contributed</Text>
        </View>
        <View style={s.statCard}>
          <Ionicons name="trending-up-outline" size={22} color="#A78BFA" />
          <Text style={s.statVal}>{formatAmt(allTimeTotals)}</Text>
          <Text style={s.statLbl}>All-Time Total</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View style={s.chartCard}>
        <Text style={s.chartTitle}>Daily Collections (Last 7 Days)</Text>
        <SimpleBarChart data={chartData} height={120} barColor="#4ADE80" currency />
      </View>

      {/* Financial Summary */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Financial Summary</Text>
        {activeCycle && (
          <View style={s.summRow}>
            <Text style={s.summKey}>Active Cycle</Text>
            <Text style={s.summVal}>{activeCycle.groupName}</Text>
          </View>
        )}
        <View style={s.summRow}>
          <Text style={s.summKey}>Active Members</Text>
          <Text style={s.summVal}>{activeMembers}</Text>
        </View>
        {activeCycle && (
          <View style={s.summRow}>
            <Text style={s.summKey}>Daily Target</Text>
            <Text style={s.summVal}>{formatAmt(activeCycle.contributionAmount * activeMembers)}</Text>
          </View>
        )}
        <View style={s.summRow}>
          <Text style={s.summKey}>Period Collections</Text>
          <Text style={[s.summVal, { color: '#4ADE80' }]}>{formatAmt(totalCollected)}</Text>
        </View>
      </View>

      {/* Member Breakdown */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Member Payment History</Text>
        {memberBreakdown.length === 0
          ? <Text style={s.noDataTxt}>No member data available</Text>
          : memberBreakdown.map((m, i) => (
              <View key={m.id} style={s.memberRow}>
                <Text style={s.memberRank}>{i + 1}</Text>
                <View style={[s.memberAvatar, { backgroundColor: m.paid > 0 ? '#0F5132' : '#374151' }]}>
                  <Text style={s.memberAvatarTxt}>{m.fullName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{m.fullName}</Text>
                  <Text style={s.memberId}>{m.memberId}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.memberPaid, { color: m.paid > 0 ? '#4ADE80' : '#9CA3AF' }]}>{formatAmt(m.paid)}</Text>
                  {m.paid === 0 && <Text style={s.memberOutstanding}>Outstanding</Text>}
                </View>
              </View>
            ))}
      </View>
    </ScrollView>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', color: '#fff' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F59E0B', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  shareBtnTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#000' },
  reportTypeSel: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  typeBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  typeBtnTxt: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  periodTxt: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF', paddingHorizontal: 20, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  statCard: { width: '46%', backgroundColor: '#1A3327', borderRadius: 14, padding: 14, gap: 6, borderWidth: 1, borderColor: '#2D4A38' },
  statVal: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
  statLbl: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
  chartCard: { marginHorizontal: 20, backgroundColor: '#1A3327', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D4A38' },
  chartTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff', marginBottom: 16 },
  section: { marginHorizontal: 20, backgroundColor: '#1A3327', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D4A38' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff', marginBottom: 12 },
  summRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2D4A38' },
  summKey: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
  summVal: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  noDataTxt: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2D4A38' },
  memberRank: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#F59E0B', width: 20 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  memberAvatarTxt: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
  memberName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  memberId: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#9CA3AF', marginTop: 1 },
  memberPaid: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  memberOutstanding: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#EF4444' },
});
