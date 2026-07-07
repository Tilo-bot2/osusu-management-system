import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { Ionicons } from '@expo/vector-icons';

export default function MemberDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentMember, logout, isLoggedIn } = useAuth();
  const { contributions, cycles, announcements } = useData();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/');
  }, [isLoggedIn]);

  if (!currentMember) return null;

  const myContributions = contributions.filter(c => c.memberId === currentMember.memberId);
  const totalPaid = myContributions.reduce((s, c) => s + c.amount, 0);
  const activeCycle = cycles.find(c => c.status === 'active');
  const lastPayment = myContributions.sort((a, b) => b.date.localeCompare(a.date))[0];
  const recentPayments = myContributions.slice(0, 5);
  const recentAnn = announcements.slice(0, 2);

  const today = new Date().toISOString().split('T')[0]!;
  const paidToday = myContributions.filter(c => c.date === today).length > 0;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatAmt = (n: number) => `SLE ${n.toLocaleString()}`;

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  return (
    <ScrollView
      style={[s.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={[s.greeting, { color: colors.mutedForeground }]}>Welcome back,</Text>
          <Text style={[s.name, { color: colors.foreground }]}>{currentMember.fullName.split(' ')[0]}</Text>
        </View>
        <View style={s.headerRight}>
          <View style={[s.statusBadge, { backgroundColor: paidToday ? '#D1FAE5' : '#FEF3C7' }]}>
            <Ionicons name={paidToday ? 'checkmark-circle' : 'time-outline'} size={14} color={paidToday ? '#059669' : '#D97706'} />
            <Text style={[s.statusTxt, { color: paidToday ? '#059669' : '#D97706' }]}>
              {paidToday ? 'Paid Today' : 'Due Today'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { logout(); router.replace('/'); }} style={s.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Member ID */}
      <View style={[s.idCard, { backgroundColor: colors.primary }]}>
        <View>
          <Text style={s.idLabel}>Member ID</Text>
          <Text style={s.idValue}>{currentMember.memberId}</Text>
        </View>
        <View>
          <Text style={[s.idLabel, { textAlign: 'right' }]}>Status</Text>
          <Text style={s.idStatus}>Active</Text>
        </View>
        <View style={s.idIconBg}>
          <Ionicons name="wallet" size={60} color="rgba(255,255,255,0.12)" />
        </View>
      </View>

      {/* Stats */}
      <Text style={[s.sectionTitle, { color: colors.foreground }]}>Overview</Text>
      <View style={s.statsRow}>
        <StatCard
          title="Total Paid"
          value={formatAmt(totalPaid)}
          icon="cash-outline"
          iconBg="#D1FAE5"
          iconColor="#059669"
        />
        <StatCard
          title="Last Payment"
          value={lastPayment ? formatAmt(lastPayment.amount) : 'None'}
          icon="time-outline"
          iconBg="#EDE9FE"
          iconColor="#7C3AED"
          subtitle={lastPayment ? formatDate(lastPayment.date) : undefined}
        />
      </View>

      <View style={s.statsRow}>
        <StatCard
          title="Active Cycle"
          value={activeCycle?.groupName ?? 'No Active Cycle'}
          icon="refresh-circle-outline"
          iconBg="#FEF3C7"
          iconColor="#D97706"
        />
        <StatCard
          title="Contribution"
          value={activeCycle ? formatAmt(activeCycle.contributionAmount) : '—'}
          icon="trending-up-outline"
          iconBg="#DBF0FF"
          iconColor="#0284C7"
          subtitle={activeCycle?.frequency}
        />
      </View>

      {/* Announcements */}
      {recentAnn.length > 0 && (
        <>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Latest Notices</Text>
          {recentAnn.map(ann => (
            <View key={ann.id} style={[s.annCard, { backgroundColor: colors.card, borderColor: ann.type === 'emergency' ? colors.destructive : ann.type === 'payment_deadline' ? colors.warning : colors.border }]}>
              <View style={[s.annDot, { backgroundColor: ann.type === 'emergency' ? colors.destructive : ann.type === 'payment_deadline' ? colors.warning : colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.annTitle, { color: colors.foreground }]}>{ann.title}</Text>
                <Text style={[s.annMsg, { color: colors.mutedForeground }]} numberOfLines={2}>{ann.message}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Recent Payments */}
      <Text style={[s.sectionTitle, { color: colors.foreground }]}>Recent Payments</Text>
      {recentPayments.length === 0
        ? <EmptyState icon="cash-outline" title="No payments yet" subtitle="Your contribution history will appear here" />
        : recentPayments.map(p => (
            <View key={p.id} style={[s.payRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.payIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.payAmt, { color: colors.foreground }]}>{formatAmt(p.amount)}</Text>
                <Text style={[s.payDate, { color: colors.mutedForeground }]}>{formatDate(p.date)} · {p.paymentMethod.replace('_', ' ')}</Text>
              </View>
              <View style={[s.paidBadge, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[s.paidTxt, { color: '#059669' }]}>Paid</Text>
              </View>
            </View>
          ))}
    </ScrollView>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  name: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusTxt: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  logoutBtn: { padding: 4 },
  idCard: { marginHorizontal: 20, borderRadius: 18, padding: 20, marginBottom: 24, overflow: 'hidden' },
  idLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  idValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  idStatus: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#F59E0B', textAlign: 'right' },
  idIconBg: { position: 'absolute', right: -10, bottom: -10 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', paddingHorizontal: 20, marginBottom: 12 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 12 },
  annCard: { marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderLeftWidth: 4, backgroundColor: 'transparent', borderWidth: 1 },
  annDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  annTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  annMsg: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  payRow: { marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  payIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  payAmt: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  payDate: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, textTransform: 'capitalize' },
  paidBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  paidTxt: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
