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
import { Member } from '@/types';

const EMPTY_FORM = { memberId: '', fullName: '', phone: '', address: '', password: '', status: 'active' as 'active' | 'inactive', dateJoined: new Date().toISOString().split('T')[0]! };

export default function MembersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const { members, addMember, updateMember, deleteMember, addAuditLog } = useData();

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace('/');
  }, [isLoggedIn, isAdmin]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showFilter, setShowFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = m.fullName.toLowerCase().includes(q) || m.memberId.toLowerCase().includes(q) || m.phone.includes(q);
    const matchFilter = showFilter === 'all' || m.status === showFilter;
    return matchSearch && matchFilter;
  });

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowModal(true); };
  const openEdit = (m: Member) => { setForm({ memberId: m.memberId, fullName: m.fullName, phone: m.phone, address: m.address, password: m.password, status: m.status, dateJoined: m.dateJoined }); setEditId(m.id); setShowModal(true); };

  const handleSave = () => {
    if (!form.memberId.trim() || !form.fullName.trim() || !form.phone.trim() || !form.password.trim()) {
      Alert.alert('Error', 'Member ID, Full Name, Phone, and Password are required.'); return;
    }
    if (!editId && members.find(m => m.memberId === form.memberId.toUpperCase())) {
      Alert.alert('Error', 'A member with this ID already exists.'); return;
    }
    if (editId) {
      updateMember(editId, { ...form, memberId: form.memberId.toUpperCase() });
      addAuditLog('Member Updated', `Updated member ${form.fullName} (${form.memberId})`);
    } else {
      addMember({ ...form, memberId: form.memberId.toUpperCase() });
      addAuditLog('Member Added', `Added new member ${form.fullName} (${form.memberId})`);
    }
    setShowModal(false);
  };

  const handleDelete = (m: Member) => {
    Alert.alert('Delete Member', `Remove ${m.fullName} from the system?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteMember(m.id); addAuditLog('Member Deleted', `Deleted member ${m.fullName} (${m.memberId})`); } },
    ]);
  };

  const toggleStatus = (m: Member) => {
    const ns = m.status === 'active' ? 'inactive' : 'active';
    updateMember(m.id, { status: ns });
    addAuditLog(`Member ${ns === 'active' ? 'Activated' : 'Deactivated'}`, `${m.fullName} (${m.memberId})`);
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  const renderItem = ({ item: m }: { item: Member }) => (
    <View style={[s.card, { backgroundColor: '#1A3327', borderColor: '#2D4A38' }]}>
      <View style={s.cardTop}>
        <View style={[s.avatar, { backgroundColor: m.status === 'active' ? '#0F5132' : '#374151' }]}>
          <Text style={s.avatarTxt}>{m.fullName.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.memberName}>{m.fullName}</Text>
          <Text style={s.memberId}>{m.memberId}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: m.status === 'active' ? '#064E3B' : '#1F2937' }]}>
          <Text style={[s.statusTxt, { color: m.status === 'active' ? '#4ADE80' : '#9CA3AF' }]}>{m.status}</Text>
        </View>
      </View>
      <View style={[s.cardMeta, { borderTopColor: '#2D4A38' }]}>
        <View style={s.metaItem}>
          <Ionicons name="call-outline" size={13} color="#9CA3AF" />
          <Text style={s.metaTxt}>{m.phone}</Text>
        </View>
        <View style={s.metaItem}>
          <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
          <Text style={s.metaTxt}>{new Date(m.dateJoined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        </View>
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#0F5132' }]} onPress={() => toggleStatus(m)}>
          <Ionicons name={m.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'} size={16} color="#4ADE80" />
          <Text style={[s.actionBtnTxt, { color: '#4ADE80' }]}>{m.status === 'active' ? 'Deactivate' : 'Activate'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#1E3A5F' }]} onPress={() => openEdit(m)}>
          <Ionicons name="pencil-outline" size={16} color="#60A5FA" />
          <Text style={[s.actionBtnTxt, { color: '#60A5FA' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#3B0D0D' }]} onPress={() => handleDelete(m)}>
          <Ionicons name="trash-outline" size={16} color="#F87171" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: '#0D1F16' }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <View style={s.headerTop}>
          <Text style={s.pageTitle}>Members</Text>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={22} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name or ID..."
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={setSearch}
          />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity> : null}
        </View>
        <View style={s.filterRow}>
          {(['all', 'active', 'inactive'] as const).map(f => (
            <TouchableOpacity key={f} style={[s.filterChip, { backgroundColor: showFilter === f ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setShowFilter(f)}>
              <Text style={[s.filterTxt, { color: showFilter === f ? '#000' : '#9CA3AF' }]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
          <Text style={s.countTxt}>{filtered.length} member{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No members found" subtitle="Tap the + button to add a new member" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <ScrollView style={[s.modal, { backgroundColor: '#0D1F16' }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
          <View style={[s.modalHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={s.modalTitle}>{editId ? 'Edit Member' : 'Add Member'}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {[
            { label: 'Member ID *', key: 'memberId', placeholder: 'e.g. OSU004', caps: 'characters' as const },
            { label: 'Full Name *', key: 'fullName', placeholder: 'Full name', caps: 'words' as const },
            { label: 'Phone Number *', key: 'phone', placeholder: '+233 XX XXX XXXX', caps: 'none' as const },
            { label: 'Address', key: 'address', placeholder: 'Home address', caps: 'sentences' as const },
            { label: 'Password *', key: 'password', placeholder: 'Login password', caps: 'none' as const },
            { label: 'Date Joined', key: 'dateJoined', placeholder: 'YYYY-MM-DD', caps: 'none' as const },
          ].map(({ label, key, placeholder, caps }) => (
            <View key={key} style={s.mField}>
              <Text style={s.mLabel}>{label}</Text>
              <TextInput
                style={s.mInput}
                placeholder={placeholder}
                placeholderTextColor="#6B7280"
                value={(form as any)[key]}
                onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                autoCapitalize={caps}
              />
            </View>
          ))}
          <View style={s.mField}>
            <Text style={s.mLabel}>Status</Text>
            <View style={s.statusToggle}>
              {(['active', 'inactive'] as const).map(st => (
                <TouchableOpacity key={st} style={[s.statusOption, { backgroundColor: form.status === st ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setForm(f => ({ ...f, status: st }))}>
                  <Text style={[s.statusOptionTxt, { color: form.status === st ? '#000' : '#9CA3AF' }]}>{st.charAt(0).toUpperCase() + st.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnTxt}>{editId ? 'Save Changes' : 'Add Member'}</Text>
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
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3327', borderRadius: 12, paddingHorizontal: 12, height: 46, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#fff' },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterTxt: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  countTxt: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF', marginLeft: 'auto' },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
  memberName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  memberId: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusTxt: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
  cardMeta: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: 1, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  actionBtnTxt: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  modal: { flex: 1, paddingHorizontal: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  mField: { marginBottom: 16 },
  mLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF', marginBottom: 6 },
  mInput: { borderWidth: 1.5, borderColor: '#2D4A38', borderRadius: 12, paddingHorizontal: 14, height: 50, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#fff', backgroundColor: '#1A3327' },
  statusToggle: { flexDirection: 'row', gap: 10 },
  statusOption: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  statusOptionTxt: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  saveBtn: { backgroundColor: '#F59E0B', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnTxt: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#000' },
});
