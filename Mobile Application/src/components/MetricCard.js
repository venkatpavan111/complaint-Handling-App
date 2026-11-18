import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MetricCard = ({ title, count, icon: IconComponent, color, bgGradient }) => {
  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBg, { backgroundColor: `${color}20` }]}>
          <IconComponent size={22} color={color} />
        </View>
        <Text style={[styles.count, { color }]}>{count}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MetricCard;
