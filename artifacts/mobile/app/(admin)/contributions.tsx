import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import EmptyState from '@/components/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Contribution } from '@/types';

const METHODS = ['cash', 'mobile_money', 'bank_transfer'] as const;
const methodLabel = (m: string) => m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const EMPTY_FORM = {
  memberId: '', memberName: '', amount: '', date: new Date().toISOString().split('T')[0]!,
  paymentMethod: 'cash' as (typeof METHODS)[number], remarks: '',
};

export default function ContributionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const { contributions, members, addContribution, updateContribution, deleteContribution, addAuditLog } = useData();

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace('/');
  }, [isLoggedIn, isAdmin]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');

  const today = new Date().toISOString().split('T')[0]!;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]!;

  const filtered = contributions
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = c.memberName.toLowerCase().includes(q) || c.memberId.toLowerCase().includes(q);
      const matchDate = dateFilter === 'all' || (dateFilter === 'today' && c.date === today) || (dateFilter === 'week' && c.date >= weekAgo);
      return matchSearch && matchDate;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalFiltered = filtered.reduce((s, c) => s + c.amount, 0);
  const todayTotal = contributions.filter(c => c.date === today).reduce((s, c) => s + c.amount, 0);

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowModal(true); };
  const openEdit = (c: Contribution) => {
    setForm({ memberId: c.memberId, memberName: c.memberName, amount: c.amount.toString(), date: c.date, paymentMethod: c.paymentMethod, remarks: c.remarks });
    setEditId(c.id); setShowModal(true);
  };

  const handleMemberIdChange = (id: string) => {
    const m = members.find(m => m.memberId === id.toUpperCase());
    setForm(f => ({ ...f, memberId: id.toUpperCase(), memberName: m?.fullName ?? f.memberName }));
  };

  const handleSave = () => {
    if (!form.memberId.trim() || !form.memberName.trim() || !form.amount.trim()) {
      Alert.alert('Error', 'Member ID, Name, and Amount are required.'); return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { Alert.alert('Error', 'Please enter a valid amount.'); return; }
    const data = { memberId: form.memberId, memberName: form.memberName, amount: amt, date: form.date, paymentMethod: form.paymentMethod, remarks: form.remarks };
    if (editId) {
      updateContribution(editId, data);
      addAuditLog('Payment Updated', `Updated SLE ${amt} from ${form.memberName}`);
    } else {
      addContribution(data);
      addAuditLog('Payment Recorded', `Recorded SLE ${amt} from ${form.memberName} (${form.memberId})`);
    }
    setShowModal(false);
  };

  const handleDelete = (c: Contribution) => {
    Alert.alert('Delete Payment', `Remove SLE ${c.amount} payment from ${c.memberName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteContribution(c.id); addAuditLog('Payment Deleted', `Deleted SLE ${c.amount} from ${c.memberName}`); } },
    ]);
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  const methodIcon = (m: string): React.ComponentProps<typeof Ionicons>['name'] => {
    if (m === 'mobile_money') return 'phone-portrait-outline';
    if (m === 'bank_transfer') return 'business-outline';
    return 'cash-outline';
  };

  const renderItem = ({ item: c }: { item: Contribution }) => (
    <View style={s.row}>
      <View style={[s.rowIcon, { backgroundColor: '#0F5132' }]}>
        <Ionicons name={methodIcon(c.paymentMethod)} size={18} color="#4ADE80" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowName}>{c.memberName}</Text>
        <Text style={s.rowMeta}>{c.memberId} · {new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        <Text style={s.rowMethod}>{methodLabel(c.paymentMethod)}</Text>
        {c.remarks ? <Text style={s.rowRemarks}>{c.remarks}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text style={s.rowAmt}>SLE {c.amount.toLocaleString()}</Text>
        <View style={s.rowActions}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#1E3A5F' }]} onPress={() => openEdit(c)}>
            <Ionicons name="pencil-outline" size={14} color="#60A5FA" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#3B0D0D' }]} onPress={() => handleDelete(c)}>
            <Ionicons name="trash-outline" size={14} color="#F87171" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: '#0D1F16' }]}>
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <View style={s.headerTop}>
          <Text style={s.pageTitle}>Contributions</Text>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={22} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={s.summCard}>
            <Text style={s.summLabel}>Today</Text>
            <Text style={s.summVal}>SLE {todayTotal.toLocaleString()}</Text>
          </View>
          <View style={s.summCard}>
            <Text style={s.summLabel}>Filtered Total</Text>
            <Text style={s.summVal}>SLE {totalFiltered.toLocaleString()}</Text>
          </View>
        </View>

        <View style={[s.searchRow, { backgroundColor: '#1A3327' }]}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search member name or ID..."
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={s.filterRow}>
          {(['all', 'today', 'week'] as const).map(f => (
            <TouchableOpacity key={f} style={[s.chip, { backgroundColor: dateFilter === f ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setDateFilter(f)}>
              <Text style={[s.chipTxt, { color: dateFilter === f ? '#000' : '#9CA3AF' }]}>{f === 'all' ? 'All Time' : f === 'today' ? 'Today' : 'This Week'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState icon="cash-outline" title="No contributions found" subtitle="Tap + to record a new payment" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <ScrollView style={[s.modal, { backgroundColor: '#0D1F16' }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
          <View style={[s.modalHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={s.modalTitle}>{editId ? 'Edit Payment' : 'Record Payment'}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={s.mField}>
            <Text style={s.mLabel}>Member ID *</Text>
            <TextInput
              style={s.mInput}
              placeholder="e.g. OSU001"
              placeholderTextColor="#6B7280"
              value={form.memberId}
              onChangeText={handleMemberIdChange}
              autoCapitalize="characters"
            />
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Member Name *</Text>
            <TextInput
              style={s.mInput}
              placeholder="Full name"
              placeholderTextColor="#6B7280"
              value={form.memberName}
              onChangeText={v => setForm(f => ({ ...f, memberName: v }))}
              autoCapitalize="words"
            />
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Amount (SLE) *</Text>
            <TextInput
              style={s.mInput}
              placeholder="e.g. 500"
              placeholderTextColor="#6B7280"
              value={form.amount}
              onChangeText={v => setForm(f => ({ ...f, amount: v }))}
              keyboardType="numeric"
            />
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Date</Text>
            <TextInput
              style={s.mInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6B7280"
              value={form.date}
              onChangeText={v => setForm(f => ({ ...f, date: v }))}
            />
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Payment Method</Text>
            <View style={s.methodRow}>
              {METHODS.map(m => (
                <TouchableOpacity key={m} style={[s.methodBtn, { backgroundColor: form.paymentMethod === m ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setForm(f => ({ ...f, paymentMethod: m }))}>
                  <Text style={[s.methodBtnTxt, { color: form.paymentMethod === m ? '#000' : '#9CA3AF' }]}>{methodLabel(m)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Remarks</Text>
            <TextInput
              style={[s.mInput, { height: 70 }]}
              placeholder="Optional notes..."
              placeholderTextColor="#6B7280"
              value={form.remarks}
              onChangeText={v => setForm(f => ({ ...f, remarks: v }))}
              multiline
            />
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnTxt}>{editId ? 'Save Changes' : 'Record Payment'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', color: '#fff' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summCard: { flex: 1, backgroundColor: '#1A3327', borderRadius: 14, padding: 14 },
  summLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#9CA3AF', marginBottom: 4 },
  summVal: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#F59E0B' },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 46, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#fff' },
  filterRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  chipTxt: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  row: { backgroundColor: '#1A3327', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#2D4A38' },
  rowIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  rowName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  rowMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF', marginTop: 2 },
  rowMethod: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#4ADE80', marginTop: 2, textTransform: 'capitalize' },
  rowRemarks: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#6B7280', marginTop: 2, fontStyle: 'italic' },
  rowAmt: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#F59E0B' },
  rowActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, paddingHorizontal: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  mField: { marginBottom: 16 },
  mLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF', marginBottom: 6 },
  mInput: { borderWidth: 1.5, borderColor: '#2D4A38', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#fff', backgroundColor: '#1A3327' },
  methodRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  methodBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  methodBtnTxt: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  saveBtn: { backgroundColor: '#F59E0B', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnTxt: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#000' },
});
