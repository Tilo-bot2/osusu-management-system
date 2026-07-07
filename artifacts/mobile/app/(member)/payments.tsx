import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import EmptyState from '@/components/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Contribution } from '@/types';

const METHODS = ['all', 'cash', 'mobile_money', 'bank_transfer'] as const;

export default function PaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentMember, isLoggedIn } = useAuth();
  const { contributions, cycles } = useData();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/');
  }, [isLoggedIn]);
  const [filter, setFilter] = useState<(typeof METHODS)[number]>('all');

  if (!currentMember) return null;

  const myContribs = contributions
    .filter(c => c.memberId === currentMember.memberId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filtered = filter === 'all' ? myContribs : myContribs.filter(c => c.paymentMethod === filter);
  const totalPaid = myContribs.reduce((s, c) => s + c.amount, 0);
  const activeCycle = cycles.find(c => c.status === 'active');

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatAmt = (n: number) => `GHS ${n.toLocaleString()}`;
  const methodLabel = (m: string) => m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const methodIcon = (m: string): React.ComponentProps<typeof Ionicons>['name'] => {
    if (m === 'mobile_money') return 'phone-portrait-outline';
    if (m === 'bank_transfer') return 'business-outline';
    return 'cash-outline';
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  const renderItem = ({ item }: { item: Contribution }) => (
    <View style={[s.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[s.rowIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name={methodIcon(item.paymentMethod)} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowAmt, { color: colors.foreground }]}>{formatAmt(item.amount)}</Text>
        <Text style={[s.rowDate, { color: colors.mutedForeground }]}>{formatDate(item.date)}</Text>
        {item.remarks ? <Text style={[s.rowRemarks, { color: colors.mutedForeground }]}>{item.remarks}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[s.rowMethod, { color: colors.primary }]}>{methodLabel(item.paymentMethod)}</Text>
        <View style={[s.paidBadge, { backgroundColor: '#D1FAE5' }]}>
          <Text style={s.paidTxt}>Paid</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <Text style={[s.pageTitle, { color: colors.foreground }]}>My Contributions</Text>

        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={s.summaryLabel}>Total Paid</Text>
            <Text style={s.summaryValue}>{formatAmt(totalPaid)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={[s.summaryLabel, { color: colors.mutedForeground }]}>Contribution</Text>
            <Text style={[s.summaryValue, { color: colors.foreground }]}>
              {activeCycle ? `${formatAmt(activeCycle.contributionAmount)}/${activeCycle.frequency}` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Filter chips */}
        <FlatList
          data={METHODS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={m => m}
          contentContainerStyle={s.chips}
          renderItem={({ item: m }) => (
            <TouchableOpacity
              onPress={() => setFilter(m)}
              style={[s.chip, { backgroundColor: filter === m ? colors.primary : colors.card, borderColor: filter === m ? colors.primary : colors.border }]}
            >
              <Text style={[s.chipTxt, { color: filter === m ? colors.primaryForeground : colors.foreground }]}>
                {m === 'all' ? 'All' : methodLabel(m)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState icon="cash-outline" title="No payments found" subtitle="Contributions will appear here once recorded" />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16 },
  summaryLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  summaryValue: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
  chips: { gap: 8, paddingRight: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipTxt: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  row: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  rowIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowAmt: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  rowDate: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  rowRemarks: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2, fontStyle: 'italic' },
  rowMethod: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  paidBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  paidTxt: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#059669' },
});
