import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { CheckCircle2, Clock, MessageSquare, ArrowRight, Home } from 'lucide-react-native';
import PriorityBadge from '../../components/PriorityBadge';
import CustomButton from '../../components/CustomButton';

export const TicketConfirmationScreen = ({ route, navigation }) => {
  const { ticketId = 'TKT-9842', estimatedSLA = '1-4 Hours', priority = 'HIGH', priorityScore = 85, title = '' } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <CheckCircle2 size={56} color="#34d399" />
        </View>

        <Text style={styles.title}>Ticket Successfully Created! 🎉</Text>
        <Text style={styles.subTitle}>
          Your complaint has been processed by our AI Priority Engine and assigned to the relevant campus authority.
        </Text>

        {/* Ticket Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ASSIGNED TICKET ID</Text>
          <Text style={styles.ticketId}>{ticketId}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>AI Priority Rating:</Text>
            <PriorityBadge priority={priority} score={priorityScore} showScore />
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <Text style={styles.rowLabel}>Estimated SLA Response:</Text>
            <View style={styles.slaBadge}>
              <Clock size={12} color="#818cf8" />
              <Text style={styles.slaText}>{estimatedSLA}</Text>
            </View>
          </View>

          {title ? (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.rowLabel}>Subject:</Text>
              <Text style={styles.titleText}>{title}</Text>
            </View>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.btnGroup}>
          <CustomButton
            title="Track Live Timeline & Chat"
            onPress={() => navigation.navigate('TicketDetailTimeline', { ticketId })}
            icon={<MessageSquare size={18} color="#ffffff" />}
          />

          <CustomButton
            title="Back to Home Dashboard"
            variant="outline"
            onPress={() => navigation.navigate('MainTabs')}
            icon={<Home size={18} color="#cbd5e1" />}
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10b98120',
    borderWidth: 2,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#1e293b',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 28,
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ticketId: {
    color: '#818cf8',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f120',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  slaText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
  },
  titleText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  btnGroup: {
    width: '100%',
  },
});

export default TicketConfirmationScreen;
