import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Clock, UserCheck, Wrench, CheckCircle, Archive } from 'lucide-react-native';

const STEPS = [
  { id: 'Submitted', label: 'Submitted', icon: Clock },
  { id: 'Analyzed', label: 'Analyzed (AI)', icon: Check },
  { id: 'Assigned', label: 'Assigned', icon: UserCheck },
  { id: 'In Progress', label: 'In Progress', icon: Wrench },
  { id: 'Resolved', label: 'Resolved', icon: CheckCircle },
  { id: 'Closed', label: 'Closed', icon: Archive },
];

export const StatusTimeline = ({ currentStatus = 'Submitted', statusHistory = [] }) => {
  const currentStepIndex = STEPS.findIndex(
    (step) => step.id.toLowerCase() === (currentStatus || 'submitted').toLowerCase()
  );

  const activeIdx = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index <= activeIdx;
        const isCurrent = index === activeIdx;
        const Icon = step.icon;

        // Find optional timestamp in statusHistory
        const historyMatch = statusHistory.find(
          (h) => h.status && h.status.toLowerCase() === step.id.toLowerCase()
        );

        return (
          <View key={step.id} style={styles.stepRow}>
            {/* Left Indicator Column */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.completedCircle,
                  isCurrent && styles.currentCircle,
                ]}
              >
                <Icon size={14} color={isCompleted ? '#ffffff' : '#64748b'} />
              </View>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    index < activeIdx && styles.completedLine,
                  ]}
                />
              )}
            </View>

            {/* Content Column */}
            <View style={styles.contentCol}>
              <Text
                style={[
                  styles.stepTitle,
                  isCompleted && styles.completedTitle,
                  isCurrent && styles.currentTitle,
                ]}
              >
                {step.label}
              </Text>
              {isCurrent && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>CURRENT STAGE</Text>
                </View>
              )}
              {historyMatch && (
                <Text style={styles.timestamp}>
                  {new Date(historyMatch.timestamp).toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  completedCircle: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8',
  },
  currentCircle: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155',
    marginVertical: 2,
  },
  completedLine: {
    backgroundColor: '#6366f1',
  },
  contentCol: {
    flex: 1,
    marginLeft: 14,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  completedTitle: {
    color: '#cbd5e1',
  },
  currentTitle: {
    color: '#34d399',
    fontWeight: '700',
  },
  activeTag: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  activeTagText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  timestamp: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
});

export default StatusTimeline;
