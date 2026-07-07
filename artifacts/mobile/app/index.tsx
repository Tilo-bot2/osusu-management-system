import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const { members, loading } = useData();

  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogin = () => {
    if (!memberId.trim() || !password.trim()) {
      setError('Please enter your Member ID and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login(memberId.trim().toUpperCase(), password, members);
      setIsLoading(false);
      if (ok) {
        router.replace('/(member)/dashboard');
      } else {
        setError('Invalid Member ID or password. Account may be inactive.');
      }
    }, 400);
  };

  const handleVersionTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (next >= 20) {
      setTapCount(0);
      router.push('/admin-login');
      return;
    }
    tapTimer.current = setTimeout(() => setTapCount(0), 2000);
  };

  const s = styles(colors);

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: colors.primary }]}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.logoCircle}>
            <Ionicons name="wallet" size={48} color={colors.primary} />
          </View>
          <Text style={s.appName}>Osusu</Text>
          <Text style={s.appSub}>Management System</Text>
        </View>

        {/* Card */}
        <View style={[s.card, { backgroundColor: colors.card }]}>
          <Text style={[s.cardTitle, { color: colors.foreground }]}>Member Login</Text>
          <Text style={[s.cardSub, { color: colors.mutedForeground }]}>Sign in with your Member ID</Text>

          {error ? (
            <View style={[s.errBox, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[s.errTxt, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <View style={s.field}>
            <Text style={[s.label, { color: colors.mutedForeground }]}>Member ID</Text>
            <View style={[s.inputRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Ionicons name="card-outline" size={20} color={colors.mutedForeground} style={s.icon} />
              <TextInput
                style={[s.input, { color: colors.foreground }]}
                placeholder="e.g. OSU001"
                placeholderTextColor={colors.mutedForeground}
                value={memberId}
                onChangeText={setMemberId}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[s.inputRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} style={s.icon} />
              <TextInput
                style={[s.input, { color: colors.foreground }]}
                placeholder="Enter password"
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
            style={[s.btn, { backgroundColor: colors.primary, opacity: isLoading ? 0.75 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color={colors.primaryForeground} />
              : <Text style={[s.btnTxt, { color: colors.primaryForeground }]}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.forgot}
            onPress={() => Alert.alert('Forgot Password', 'Please contact your Osusu group administrator to reset your password.')}
          >
            <Text style={[s.forgotTxt, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Version — 20-tap admin trigger */}
        <TouchableOpacity onPress={handleVersionTap} activeOpacity={1} style={s.version}>
          <Text style={[s.verTxt, { color: 'rgba(255,255,255,0.45)' }]}>v2.255</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24 },
  hero: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  appName: { fontSize: 34, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 0.5 },
  appSub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  card: {
    width: '100%', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14, shadowRadius: 24, elevation: 10,
  },
  cardTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 4 },
  cardSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 20 },
  errBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, marginBottom: 16 },
  errTxt: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, height: 52 },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  eyeBtn: { padding: 4 },
  btn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 12 },
  btnTxt: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  forgot: { alignItems: 'center', paddingVertical: 8 },
  forgotTxt: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  version: { marginTop: 36, paddingVertical: 8, paddingHorizontal: 16 },
  verTxt: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
