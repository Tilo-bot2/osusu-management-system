import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
  currency?: boolean;
}

export default function SimpleBarChart({ data, height = 140, barColor, currency = false }: BarChartProps) {
  const colors = useColors();
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const fillColor = barColor ?? colors.primary;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.chartArea, { height }]}>
        {data.map((item, i) => {
          const barH = Math.max((item.value / maxVal) * height, item.value > 0 ? 4 : 0);
          return (
            <View key={i} style={styles.barCol}>
              <Text style={[styles.valLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
                {currency ? `₵${item.value}` : item.value > 0 ? item.value.toString() : ''}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: barH, backgroundColor: fillColor, borderRadius: 4 }]} />
              </View>
              <Text style={[styles.axisLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 28 },
  barCol: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  barTrack: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  bar: { width: '70%', minHeight: 0 },
  valLabel: { fontSize: 9, fontFamily: 'Inter_500Medium', marginBottom: 2, textAlign: 'center' },
  axisLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', position: 'absolute', bottom: 0, textAlign: 'center' },
});
