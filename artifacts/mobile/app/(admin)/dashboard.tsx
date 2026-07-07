import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout, isLoggedIn, isAdmin } = useAuth();
  const { members, contributions, cycles, auditLogs } = useData();

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace('/');
  }, [isLoggedIn, isAdmin]);

  const today = new Date().toISOString().split('T')[0]!;
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const activeCycle = cycles.find(c => c.status === 'active');
  const totalContributions = contributions.reduce((s, c) => s + c.amount, 0);
  const todayContributions = contributions.filter(c => c.date === today).reduce((s, c) => s + c.amount, 0);
  const recentPayments = [...contributions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const recentLogs = auditLogs.slice(0, 5);

  const formatAmt = (n: number) => `GHS ${n.toLocaleString()}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  return (
    <ScrollView
      style={[s.root, { backgroundColor: '#0D1F16' }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Admin Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Administrator</Text>
          <Text style={s.title}>Control Panel</Text>
        </View>
        <TouchableOpacity onPress={() => { logout(); router.replace('/'); }} style={[s.logoutBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Ionicons name="log-out-outline" size={20} color="#F59E0B" />
        </TouchableOpacity>
      </View>

      {/* Cycle Banner */}
      {activeCycle ? (
        <View style={[s.cycleBanner, { backgroundColor: '#F59E0B' }]}>
          <View>
            <Text style={s.cycleLabel}>Active Cycle</Text>
            <Text style={s.cycleName}>{activeCycle.groupName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.cycleLabel}>Daily Contribution</Text>
            <Text style={s.cycleAmt}>{formatAmt(activeCycle.contributionAmount)}</Text>
          </View>
        </View>
      ) : (
        <View style={[s.cycleBanner, { backgroundColor: '#374151' }]}>
          <Text style={[s.cycleLabel, { color: '#9CA3AF' }]}>No active cycle running</Text>
        </View>
      )}

      {/* Stats Row 1 */}
      <View style={s.statsRow}>
        <StatCard
          title="Total Members"
          value={totalMembers.toString()}
          icon="people-outline"
          iconBg="rgba(74,222,128,0.15)"
          iconColor="#4ADE80"
          subtitle={`${activeMembers} active`}
        />
        <StatCard
          title="Today's Collection"
          value={formatAmt(todayContributions)}
          icon="today-outline"
          iconBg="rgba(245,158,11,0.15)"
          iconColor="#F59E0B"
        />
      </View>

      {/* Stats Row 2 */}
      <View style={s.statsRow}>
        <StatCard
          title="Total Contributions"
          value={formatAmt(totalContributions)}
          icon="cash-outline"
          iconBg="rgba(59,130,246,0.15)"
          iconColor="#3B82F6"
        />
        <StatCard
          title="Total Payments"
          value={contributions.length.toString()}
          icon="receipt-outline"
          iconBg="rgba(167,139,250,0.15)"
          iconColor="#A78BFA"
          subtitle="all time"
        />
      </View>

      {/* Recent Payments */}
      <Text style={s.sectionTitle}>Recent Payments</Text>
      {recentPayments.length === 0
        ? <EmptyState icon="cash-outline" title="No payments recorded" subtitle="Contributions will appear here" />
        : recentPayments.map(p => (
            <View key={p.id} style={s.payRow}>
              <View style={[s.payAvatar, { backgroundColor: '#1D3327' }]}>
                <Text style={s.payAvatarTxt}>{p.memberName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.payName}>{p.memberName}</Text>
                <Text style={s.payMeta}>{p.memberId} · {formatDate(p.date)}</Text>
              </View>
              <Text style={s.payAmt}>{formatAmt(p.amount)}</Text>
            </View>
          ))}

      {/* Audit Log */}
      {recentLogs.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Audit Log</Text>
          {recentLogs.map(log => (
            <View key={log.id} style={s.logRow}>
              <View style={[s.logDot, { backgroundColor: '#4ADE80' }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.logAction}>{log.action}</Text>
                <Text style={s.logDetail} numberOfLines={1}>{log.details}</Text>
              </View>
              <Text style={s.logTime}>{new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.5)' },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', color: '#fff' },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cycleBanner: { marginHorizontal: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  cycleLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: 'rgba(0,0,0,0.6)', marginBottom: 2 },
  cycleName: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#000' },
  cycleAmt: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#000' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff', paddingHorizontal: 20, marginTop: 8, marginBottom: 12 },
  payRow: { marginHorizontal: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A3327', borderRadius: 14, padding: 14 },
  payAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  payAvatarTxt: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#4ADE80' },
  payName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  payMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  payAmt: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#F59E0B' },
  logRow: { marginHorizontal: 20, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 },
  logDot: { width: 7, height: 7, borderRadius: 4 },
  logAction: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  logDetail: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  logTime: { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.4)' },
});
