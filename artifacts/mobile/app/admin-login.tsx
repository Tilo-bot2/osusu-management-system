import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { adminLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      const ok = adminLogin(username.trim(), password);
      setIsLoading(false);
      if (ok) {
        router.replace('/(admin)/dashboard');
      } else {
        setError('Invalid administrator credentials.');
      }
    }, 400);
  };

  const s = styles(colors);

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.hero}>
          <View style={[s.shield, { backgroundColor: '#1A1A2E' }]}>
            <Ionicons name="shield-checkmark" size={48} color="#F59E0B" />
          </View>
          <Text style={[s.title, { color: colors.foreground }]}>Admin Access</Text>
          <Text style={[s.sub, { color: colors.mutedForeground }]}>Restricted to authorized personnel only</Text>
        </View>

        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {error ? (
            <View style={[s.errBox, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[s.errTxt, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <View style={s.field}>
            <Text style={[s.label, { color: colors.mutedForeground }]}>Username</Text>
            <View style={[s.inputRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Ionicons name="person-outline" size={20} color={colors.mutedForeground} style={s.icon} />
              <TextInput
                style={[s.input, { color: colors.foreground }]}
                placeholder="Administrator username"
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[s.inputRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} style={s.icon} />
              <TextInput
                style={[s.input, { color: colors.foreground }]}
                placeholder="Administrator password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[s.btn, { backgroundColor: '#1A1A2E', opacity: isLoading ? 0.75 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#F59E0B" />
              : <>
                  <Ionicons name="shield-checkmark" size={18} color="#F59E0B" />
                  <Text style={s.btnTxt}>Administrator Login</Text>
                </>}
          </TouchableOpacity>
        </View>

        <View style={[s.notice, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
          <Text style={[s.noticeTxt, { color: colors.mutedForeground }]}>
            All administrator actions are logged and audited.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16 },
  hero: { alignItems: 'center', marginBottom: 32 },
  shield: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 4 },
  card: {
    borderRadius: 20, padding: 24, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
    marginBottom: 16,
  },
  errBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, marginBottom: 16 },
  errTxt: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, height: 52 },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  eyeBtn: { padding: 4 },
  btn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, marginTop: 4 },
  btnTxt: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#F59E0B' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  noticeTxt: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
});
