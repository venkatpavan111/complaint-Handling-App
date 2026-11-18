import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react-native';

export const PriorityBadge = ({ priority = 'LOW', score = null, showScore = false }) => {
  const normalized = (priority || 'LOW').toUpperCase();

  let bg = '#05966920';
  let border = '#10b981';
  let textColor = '#34d399';
  let Icon = CheckCircle2;

  if (normalized === 'HIGH' || normalized === 'URGENT') {
    bg = '#dc262620';
    border = '#ef4444';
    textColor = '#f87171';
    Icon = AlertTriangle;
  } else if (normalized === 'MEDIUM') {
    bg = '#d9770620';
    border = '#f59e0b';
    textColor = '#fbbf24';
    Icon = AlertCircle;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Icon size={12} color={border} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeText, { color: textColor }]}>
        {normalized} {showScore && score !== null ? `(${score} pts)` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PriorityBadge;
