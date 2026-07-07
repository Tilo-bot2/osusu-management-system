import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg?: string;
  iconColor?: string;
  subtitle?: string;
  fullWidth?: boolean;
}

export default function StatCard({ title, value, icon, iconBg, iconColor, subtitle, fullWidth }: StatCardProps) {
  const colors = useColors();
  const styles = getStyles(colors);

  return (
    <View style={[styles.card, fullWidth && styles.fullWidth]}>
      <View style={[styles.iconBox, { backgroundColor: iconBg ?? colors.secondary }]}>
        <Ionicons name={icon} size={22} color={iconColor ?? colors.primary} />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
  );
}

function getStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      minWidth: 140,
    },
    fullWidth: { flex: 0, width: '100%' },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    value: {
      fontSize: 22,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      marginBottom: 2,
    },
    title: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    subtitle: {
      fontSize: 11,
      fontFamily: 'Inter_400Regular',
      color: colors.success,
      marginTop: 4,
    },
  });
}
