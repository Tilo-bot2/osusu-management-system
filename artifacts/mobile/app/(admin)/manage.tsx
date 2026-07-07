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
import { Announcement, OsusuCycle } from '@/types';

const ANN_TYPES = ['general', 'payment_deadline', 'emergency'] as const;
const CYCLE_STATUS = ['active', 'pending', 'completed'] as const;
const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;

const TYPE_CONFIG = {
  payment_deadline: { label: 'Payment Deadline', color: '#D97706', bg: '#FEF3C7' },
  emergency: { label: 'Emergency', color: '#DC2626', bg: '#FEE2E2' },
  general: { label: 'General', color: '#1D4ED8', bg: '#DBEAFE' },
};

const STATUS_CONFIG = {
  active: { color: '#4ADE80', bg: '#064E3B' },
  pending: { color: '#F59E0B', bg: '#451A00' },
  completed: { color: '#9CA3AF', bg: '#374151' },
};

const EMPTY_ANN = { title: '', message: '', type: 'general' as (typeof ANN_TYPES)[number], date: new Date().toISOString().split('T')[0]! };
const EMPTY_CYCLE = { groupName: '', startDate: '', endDate: '', contributionAmount: '', frequency: 'daily' as (typeof FREQUENCIES)[number], numberOfMembers: '', status: 'active' as (typeof CYCLE_STATUS)[number] };

export default function ManageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, cycles, addCycle, updateCycle, deleteCycle, addAuditLog } = useData();

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace('/');
  }, [isLoggedIn, isAdmin]);

  const [tab, setTab] = useState<'announcements' | 'cycles'>('announcements');

  // Announcement state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editAnnId, setEditAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState({ ...EMPTY_ANN });

  // Cycle state
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [editCycleId, setEditCycleId] = useState<string | null>(null);
  const [cycleForm, setCycleForm] = useState({ ...EMPTY_CYCLE });

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  // Announcement handlers
  const openAddAnn = () => { setAnnForm({ ...EMPTY_ANN }); setEditAnnId(null); setShowAnnModal(true); };
  const openEditAnn = (a: Announcement) => { setAnnForm({ title: a.title, message: a.message, type: a.type, date: a.date }); setEditAnnId(a.id); setShowAnnModal(true); };
  const saveAnn = () => {
    if (!annForm.title.trim() || !annForm.message.trim()) { Alert.alert('Error', 'Title and message are required.'); return; }
    if (editAnnId) { updateAnnouncement(editAnnId, annForm); addAuditLog('Announcement Updated', annForm.title); }
    else { addAnnouncement(annForm); addAuditLog('Announcement Created', annForm.title); }
    setShowAnnModal(false);
  };
  const deleteAnn = (a: Announcement) => {
    Alert.alert('Delete', `Delete announcement "${a.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteAnnouncement(a.id); addAuditLog('Announcement Deleted', a.title); } },
    ]);
  };

  // Cycle handlers
  const openAddCycle = () => { setCycleForm({ ...EMPTY_CYCLE }); setEditCycleId(null); setShowCycleModal(true); };
  const openEditCycle = (c: OsusuCycle) => {
    setCycleForm({ groupName: c.groupName, startDate: c.startDate, endDate: c.endDate, contributionAmount: c.contributionAmount.toString(), frequency: c.frequency, numberOfMembers: c.numberOfMembers.toString(), status: c.status });
    setEditCycleId(c.id); setShowCycleModal(true);
  };
  const saveCycle = () => {
    if (!cycleForm.groupName.trim() || !cycleForm.contributionAmount) { Alert.alert('Error', 'Group name and contribution amount are required.'); return; }
    const data = { ...cycleForm, contributionAmount: parseFloat(cycleForm.contributionAmount) || 0, numberOfMembers: parseInt(cycleForm.numberOfMembers) || 0 };
    if (editCycleId) { updateCycle(editCycleId, data); addAuditLog('Cycle Updated', cycleForm.groupName); }
    else { addCycle(data); addAuditLog('Cycle Created', cycleForm.groupName); }
    setShowCycleModal(false);
  };
  const deleteCycleItem = (c: OsusuCycle) => {
    Alert.alert('Delete', `Delete cycle "${c.groupName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteCycle(c.id); addAuditLog('Cycle Deleted', c.groupName); } },
    ]);
  };

  const sortedAnn = [...announcements].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={[s.root, { backgroundColor: '#0D1F16' }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <View style={s.headerTop}>
          <Text style={s.pageTitle}>Manage</Text>
          <TouchableOpacity style={s.addBtn} onPress={tab === 'announcements' ? openAddAnn : openAddCycle}>
            <Ionicons name="add" size={22} color="#000" />
          </TouchableOpacity>
        </View>
        {/* Tab toggle */}
        <View style={s.tabRow}>
          <TouchableOpacity style={[s.tabBtn, { backgroundColor: tab === 'announcements' ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setTab('announcements')}>
            <Ionicons name="notifications-outline" size={16} color={tab === 'announcements' ? '#000' : '#9CA3AF'} />
            <Text style={[s.tabBtnTxt, { color: tab === 'announcements' ? '#000' : '#9CA3AF' }]}>Announcements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tabBtn, { backgroundColor: tab === 'cycles' ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setTab('cycles')}>
            <Ionicons name="refresh-circle-outline" size={16} color={tab === 'cycles' ? '#000' : '#9CA3AF'} />
            <Text style={[s.tabBtnTxt, { color: tab === 'cycles' ? '#000' : '#9CA3AF' }]}>Cycles</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Announcements List */}
      {tab === 'announcements' && (
        <FlatList
          data={sortedAnn}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={<EmptyState icon="notifications-outline" title="No announcements" subtitle="Tap + to create an announcement" />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: a }) => {
            const cfg = TYPE_CONFIG[a.type];
            return (
              <View style={s.annCard}>
                <View style={s.annTop}>
                  <View style={[s.annTypeBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.annTypeTxt, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  <Text style={s.annDate}>{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                  <View style={s.annActions}>
                    <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#1E3A5F' }]} onPress={() => openEditAnn(a)}>
                      <Ionicons name="pencil-outline" size={14} color="#60A5FA" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#3B0D0D' }]} onPress={() => deleteAnn(a)}>
                      <Ionicons name="trash-outline" size={14} color="#F87171" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={s.annTitle}>{a.title}</Text>
                <Text style={s.annMsg} numberOfLines={3}>{a.message}</Text>
              </View>
            );
          }}
        />
      )}

      {/* Cycles List */}
      {tab === 'cycles' && (
        <FlatList
          data={cycles}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={<EmptyState icon="refresh-circle-outline" title="No cycles" subtitle="Tap + to create an Osusu cycle" />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: c }) => {
            const sc = STATUS_CONFIG[c.status];
            return (
              <View style={s.cycleCard}>
                <View style={s.cycleTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cycleName}>{c.groupName}</Text>
                    <Text style={s.cycleMeta}>SLE {c.contributionAmount.toLocaleString()} · {c.frequency} · {c.numberOfMembers} members</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[s.statusTxt, { color: sc.color }]}>{c.status}</Text>
                  </View>
                </View>
                <View style={s.cycleDates}>
                  <View style={s.cycleDate}>
                    <Ionicons name="play-outline" size={12} color="#9CA3AF" />
                    <Text style={s.cycleDateTxt}>{c.startDate}</Text>
                  </View>
                  <Ionicons name="arrow-forward-outline" size={12} color="#9CA3AF" />
                  <View style={s.cycleDate}>
                    <Ionicons name="stop-outline" size={12} color="#9CA3AF" />
                    <Text style={s.cycleDateTxt}>{c.endDate}</Text>
                  </View>
                </View>
                <View style={s.cycleActions}>
                  <TouchableOpacity style={[s.cycleBtn, { backgroundColor: '#064E3B' }]} onPress={() => updateCycle(c.id, { status: 'active' })}>
                    <Text style={[s.cycleBtnTxt, { color: '#4ADE80' }]}>Activate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.cycleBtn, { backgroundColor: '#374151' }]} onPress={() => updateCycle(c.id, { status: 'completed' })}>
                    <Text style={[s.cycleBtnTxt, { color: '#9CA3AF' }]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#1E3A5F' }]} onPress={() => openEditCycle(c)}>
                    <Ionicons name="pencil-outline" size={14} color="#60A5FA" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#3B0D0D' }]} onPress={() => deleteCycleItem(c)}>
                    <Ionicons name="trash-outline" size={14} color="#F87171" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Announcement Modal */}
      <Modal visible={showAnnModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAnnModal(false)}>
        <ScrollView style={[s.modal, { backgroundColor: '#0D1F16' }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
          <View style={[s.modalHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={s.modalTitle}>{editAnnId ? 'Edit Announcement' : 'New Announcement'}</Text>
            <TouchableOpacity onPress={() => setShowAnnModal(false)}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Title *</Text>
            <TextInput style={s.mInput} placeholder="Announcement title" placeholderTextColor="#6B7280" value={annForm.title} onChangeText={v => setAnnForm(f => ({ ...f, title: v }))} />
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Message *</Text>
            <TextInput style={[s.mInput, { height: 100 }]} placeholder="Announcement message..." placeholderTextColor="#6B7280" value={annForm.message} onChangeText={v => setAnnForm(f => ({ ...f, message: v }))} multiline />
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Type</Text>
            <View style={s.optRow}>
              {ANN_TYPES.map(t => (
                <TouchableOpacity key={t} style={[s.optBtn, { backgroundColor: annForm.type === t ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setAnnForm(f => ({ ...f, type: t }))}>
                  <Text style={[s.optBtnTxt, { color: annForm.type === t ? '#000' : '#9CA3AF' }]}>{TYPE_CONFIG[t].label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={saveAnn}><Text style={s.saveBtnTxt}>{editAnnId ? 'Save Changes' : 'Create Announcement'}</Text></TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Cycle Modal */}
      <Modal visible={showCycleModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCycleModal(false)}>
        <ScrollView style={[s.modal, { backgroundColor: '#0D1F16' }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
          <View style={[s.modalHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={s.modalTitle}>{editCycleId ? 'Edit Cycle' : 'New Cycle'}</Text>
            <TouchableOpacity onPress={() => setShowCycleModal(false)}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          {[
            { label: 'Group Name *', key: 'groupName', placeholder: 'e.g. Unity Group', caps: 'words' as const },
            { label: 'Start Date', key: 'startDate', placeholder: 'YYYY-MM-DD', caps: 'none' as const },
            { label: 'End Date', key: 'endDate', placeholder: 'YYYY-MM-DD', caps: 'none' as const },
            { label: 'Contribution Amount (SLE) *', key: 'contributionAmount', placeholder: 'e.g. 500', caps: 'none' as const },
            { label: 'Number of Members', key: 'numberOfMembers', placeholder: 'e.g. 10', caps: 'none' as const },
          ].map(({ label, key, placeholder, caps }) => (
            <View key={key} style={s.mField}>
              <Text style={s.mLabel}>{label}</Text>
              <TextInput
                style={s.mInput}
                placeholder={placeholder}
                placeholderTextColor="#6B7280"
                value={(cycleForm as any)[key]}
                onChangeText={v => setCycleForm(f => ({ ...f, [key]: v }))}
                autoCapitalize={caps}
                keyboardType={key === 'contributionAmount' || key === 'numberOfMembers' ? 'numeric' : 'default'}
              />
            </View>
          ))}
          <View style={s.mField}>
            <Text style={s.mLabel}>Frequency</Text>
            <View style={s.optRow}>
              {FREQUENCIES.map(f => (
                <TouchableOpacity key={f} style={[s.optBtn, { backgroundColor: cycleForm.frequency === f ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setCycleForm(c => ({ ...c, frequency: f }))}>
                  <Text style={[s.optBtnTxt, { color: cycleForm.frequency === f ? '#000' : '#9CA3AF' }]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.mField}>
            <Text style={s.mLabel}>Status</Text>
            <View style={s.optRow}>
              {CYCLE_STATUS.map(st => (
                <TouchableOpacity key={st} style={[s.optBtn, { backgroundColor: cycleForm.status === st ? '#F59E0B' : 'rgba(255,255,255,0.08)' }]} onPress={() => setCycleForm(c => ({ ...c, status: st }))}>
                  <Text style={[s.optBtnTxt, { color: cycleForm.status === st ? '#000' : '#9CA3AF' }]}>{st.charAt(0).toUpperCase() + st.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={saveCycle}><Text style={s.saveBtnTxt}>{editCycleId ? 'Save Changes' : 'Create Cycle'}</Text></TouchableOpacity>
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
  tabRow: { flexDirection: 'row', gap: 10 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20 },
  tabBtnTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  annCard: { backgroundColor: '#1A3327', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2D4A38' },
  annTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  annTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  annTypeTxt: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  annDate: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
  annActions: { marginLeft: 'auto', flexDirection: 'row', gap: 6 },
  annTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff', marginBottom: 4 },
  annMsg: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF', lineHeight: 18 },
  cycleCard: { backgroundColor: '#1A3327', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2D4A38' },
  cycleTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  cycleName: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  cycleMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF', marginTop: 2, textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusTxt: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
  cycleDates: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cycleDate: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cycleDateTxt: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
  cycleActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cycleBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  cycleBtnTxt: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, paddingHorizontal: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  mField: { marginBottom: 16 },
  mLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF', marginBottom: 6 },
  mInput: { borderWidth: 1.5, borderColor: '#2D4A38', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#fff', backgroundColor: '#1A3327' },
  optRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  optBtnTxt: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  saveBtn: { backgroundColor: '#F59E0B', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnTxt: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#000' },
});
