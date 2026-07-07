import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Ionicons } from '@expo/vector-icons';

function ProfileRow({ icon, label, value, colors }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; colors: any }) {
  return (
    <View style={[rowStyle.row, { borderBottomColor: colors.border }]}>
      <View style={[rowStyle.iconBox, { backgroundColor: colors.secondary }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[rowStyle.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[rowStyle.value, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const rowStyle = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  value: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentMember, logout, updateCurrentMember, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/');
  }, [isLoggedIn]);
  const { updateMemberPassword, updateMember, members } = useData();

  const [showPwModal, setShowPwModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [newPhone, setNewPhone] = useState('');

  if (!currentMember) return null;

  const handleChangePassword = () => {
    if (currentPw !== currentMember.password) { Alert.alert('Error', 'Current password is incorrect.'); return; }
    if (newPw.length < 6) { Alert.alert('Error', 'New password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { Alert.alert('Error', 'New passwords do not match.'); return; }
    const member = members.find(m => m.memberId === currentMember.memberId);
    if (member) {
      updateMemberPassword(currentMember.memberId, newPw);
      updateCurrentMember({ password: newPw });
    }
    setShowPwModal(false);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    Alert.alert('Success', 'Password changed successfully.');
  };

  const handleChangePhone = () => {
    if (!newPhone.trim()) { Alert.alert('Error', 'Please enter a valid phone number.'); return; }
    const member = members.find(m => m.memberId === currentMember.memberId);
    if (member) {
      updateMember(member.id, { phone: newPhone.trim() });
      updateCurrentMember({ phone: newPhone.trim() });
    }
    setShowPhoneModal(false);
    setNewPhone('');
    Alert.alert('Success', 'Phone number updated.');
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? insets.bottom + 34 + 84 : insets.bottom + 64;

  return (
    <ScrollView
      style={[s.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.pageTitle, { color: colors.foreground }]}>Profile</Text>

      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={[s.avatar, { backgroundColor: colors.primary }]}>
          <Text style={s.avatarTxt}>{currentMember.fullName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[s.memberName, { color: colors.foreground }]}>{currentMember.fullName}</Text>
        <View style={[s.idPill, { backgroundColor: colors.secondary }]}>
          <Text style={[s.idPillTxt, { color: colors.primary }]}>{currentMember.memberId}</Text>
        </View>
      </View>

      {/* Info card */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[s.cardTitle, { color: colors.foreground }]}>Personal Information</Text>
        <ProfileRow icon="person-outline" label="Full Name" value={currentMember.fullName} colors={colors} />
        <ProfileRow icon="call-outline" label="Phone Number" value={currentMember.phone} colors={colors} />
        <ProfileRow icon="card-outline" label="Member ID" value={currentMember.memberId} colors={colors} />
        <ProfileRow icon="location-outline" label="Address" value={currentMember.address} colors={colors} />
        <ProfileRow icon="calendar-outline" label="Date Joined" value={new Date(currentMember.dateJoined).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} colors={colors} />
      </View>

      {/* Actions */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[s.cardTitle, { color: colors.foreground }]}>Account Settings</Text>
        <TouchableOpacity style={[s.actionRow, { borderBottomColor: colors.border }]} onPress={() => setShowPwModal(true)}>
          <View style={[s.actionIcon, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="key-outline" size={18} color="#7C3AED" />
          </View>
          <Text style={[s.actionLabel, { color: colors.foreground }]}>Change Password</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionRow, { borderBottomColor: 'transparent' }]} onPress={() => { setNewPhone(currentMember.phone); setShowPhoneModal(true); }}>
          <View style={[s.actionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="call-outline" size={18} color="#1D4ED8" />
          </View>
          <Text style={[s.actionLabel, { color: colors.foreground }]}>Update Phone Number</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={[s.logoutBtn, { borderColor: colors.destructive }]} onPress={() => { logout(); router.replace('/'); }}>
        <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
        <Text style={[s.logoutTxt, { color: colors.destructive }]}>Logout</Text>
      </TouchableOpacity>

      {/* Change Password Modal */}
      <Modal visible={showPwModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPwModal(false)}>
        <View style={[s.modal, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { color: colors.foreground }]}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowPwModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          {[
            { label: 'Current Password', val: currentPw, set: setCurrentPw },
            { label: 'New Password', val: newPw, set: setNewPw },
            { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw },
          ].map(({ label, val, set }) => (
            <View key={label} style={s.mField}>
              <Text style={[s.mLabel, { color: colors.mutedForeground }]}>{label}</Text>
              <TextInput
                style={[s.mInput, { borderColor: colors.border, backgroundColor: colors.muted, color: colors.foreground }]}
                secureTextEntry
                value={val}
                onChangeText={set}
                placeholder={label}
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          ))}
          <TouchableOpacity style={[s.mBtn, { backgroundColor: colors.primary }]} onPress={handleChangePassword}>
            <Text style={[s.mBtnTxt, { color: colors.primaryForeground }]}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Change Phone Modal */}
      <Modal visible={showPhoneModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPhoneModal(false)}>
        <View style={[s.modal, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { color: colors.foreground }]}>Update Phone Number</Text>
            <TouchableOpacity onPress={() => setShowPhoneModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={s.mField}>
            <Text style={[s.mLabel, { color: colors.mutedForeground }]}>New Phone Number</Text>
            <TextInput
              style={[s.mInput, { borderColor: colors.border, backgroundColor: colors.muted, color: colors.foreground }]}
              value={newPhone}
              onChangeText={setNewPhone}
              placeholder="+233 XX XXX XXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
            />
          </View>
          <TouchableOpacity style={[s.mBtn, { backgroundColor: colors.primary }]} onPress={handleChangePhone}>
            <Text style={[s.mBtnTxt, { color: colors.primaryForeground }]}>Update Phone</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', paddingHorizontal: 20, marginBottom: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTxt: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
  memberName: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  idPill: { paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20 },
  idPillTxt: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  card: { marginHorizontal: 20, borderRadius: 18, padding: 18, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  actionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  logoutBtn: { marginHorizontal: 20, borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5 },
  logoutTxt: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  modal: { flex: 1, paddingHorizontal: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  mField: { marginBottom: 16 },
  mLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  mInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 50, fontSize: 15, fontFamily: 'Inter_400Regular' },
  mBtn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  mBtnTxt: { fontSize: 16, fontFamily: 'Inter_700Bold' },
});
