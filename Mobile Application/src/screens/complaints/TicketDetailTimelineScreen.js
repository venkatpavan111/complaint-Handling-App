import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { ComplaintsContext } from '../../context/ComplaintsContext';
import StatusTimeline from '../../components/StatusTimeline';
import PriorityBadge from '../../components/PriorityBadge';
import CustomButton from '../../components/CustomButton';
import API from '../../services/api';
import {
  ArrowLeft,
  MessageSquare,
  Star,
  UserCheck,
  Sparkles,
  Paperclip
} from 'lucide-react-native';

export const TicketDetailTimelineScreen = ({ route, navigation }) => {
  const { getComplaintByTicketId } = useContext(ComplaintsContext);
  const { ticketId, complaint: passedComplaint } = route.params || {};

  const contextComplaint = getComplaintByTicketId(ticketId);
  const [complaint, setComplaint] = useState(passedComplaint || contextComplaint || null);

  const fallbackComplaint = {
    ticketId: ticketId || 'TKT-9842',
    title: 'Lab 3 Projector power failure during exam prep',
    description: 'During our afternoon lab revision session, the main overhead projector sparked and suffered a complete power cut. Exam is in 2 days and student presentations are blocked.',
    category: 'Academic',
    location: 'Academic Block B - Room 304',
    priority: 'HIGH',
    priorityScore: 88,
    priorityReason: 'Urgent exam keywords and electrical hazard detected.',
    status: 'In Progress',
    assignedAdmin: { name: 'Prof. David Vance (IT & Labs)' },
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
      { status: 'Analyzed', timestamp: new Date(Date.now() - 3600000 * 5.8).toISOString() },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    ],
    attachments: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80',
    ],
  };

  useEffect(() => {
    if (contextComplaint) {
      setComplaint(contextComplaint);
    } else if (!complaint && ticketId) {
      fetchTicket();
    }
  }, [ticketId, contextComplaint]);

  const fetchTicket = async () => {
    try {
      const res = await API.get(`/complaints/ticket/${ticketId}`);
      if (res.data) {
        setComplaint(res.data);
      } else {
        setComplaint(fallbackComplaint);
      }
    } catch (e) {
      setComplaint(fallbackComplaint);
    }
  };

  const data = complaint || fallbackComplaint;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Navigation */}
        <View style={styles.navHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{data.ticketId}</Text>
          <TouchableOpacity
            style={styles.chatHeaderBtn}
            onPress={() => navigation.navigate('RealtimeChat', { ticketId: data.ticketId, complaint: data })}
          >
            <MessageSquare size={18} color="#818cf8" />
          </TouchableOpacity>
        </View>

        {/* Priority & Category Bar */}
        <View style={styles.topInfoCard}>
          <View style={styles.topInfoRow}>
            <PriorityBadge priority={data.priority} score={data.priorityScore} showScore />
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{data.category}</Text>
            </View>
          </View>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.locationText}>📍 {data.location}</Text>
          <Text style={styles.dateText}>
            📅 Submitted on: {new Date(data.createdAt || Date.now()).toLocaleString()}
          </Text>
        </View>

        {/* Status Timeline Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Resolution Timeline</Text>
          <StatusTimeline currentStatus={data.status} statusHistory={data.statusHistory || []} />
        </View>

        {/* Assigned Admin Card */}
        <View style={styles.card}>
          <View style={styles.adminRow}>
            <View style={styles.adminIconCircle}>
              <UserCheck size={20} color="#818cf8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminLabel}>ASSIGNED OFFICER / ADMIN</Text>
              <Text style={styles.adminName}>
                {data.assignedAdmin?.name || 'Central Lab Maintenance Officer'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description & Evidence Attachments */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Complaint Description</Text>
          <Text style={styles.descText}>{data.description}</Text>

          {data.attachments && data.attachments.length > 0 && (
            <View style={styles.attachmentsSection}>
              <View style={styles.attachHeader}>
                <Paperclip size={14} color="#818cf8" />
                <Text style={styles.attachTitle}>Attachments & Evidence</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {data.attachments.map((img, idx) => (
                  <Image key={idx} source={{ uri: img }} style={styles.attachImage} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* AI Analysis Summary */}
        {data.priorityReason ? (
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Sparkles size={16} color="#818cf8" />
              <Text style={styles.aiTitle}>AI Urgency Insights</Text>
            </View>
            <Text style={styles.aiReason}>{data.priorityReason}</Text>
          </View>
        ) : null}

        {/* Bottom Actions: Chat or Resolution Feedback */}
        <View style={styles.bottomActions}>
          <CustomButton
            title="Open Live Chat with Admin"
            onPress={() => navigation.navigate('RealtimeChat', { ticketId: data.ticketId, complaint: data })}
            icon={<MessageSquare size={18} color="#ffffff" />}
          />

          {(data.status === 'Resolved' || data.status === 'Closed') && (
            <CustomButton
              title="Rate Resolution & Leave Feedback"
              variant="outline"
              onPress={() => navigation.navigate('ResolutionFeedback', { ticketId: data.ticketId, complaint: data })}
              icon={<Star size={18} color="#f59e0b" />}
              style={{ marginTop: 12 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  chatHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topInfoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  locationText: {
    color: '#818cf8',
    fontSize: 13,
    marginBottom: 4,
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6366f120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
  },
  adminName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  descText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  attachmentsSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  attachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachTitle: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
  },
  attachImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  aiCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4338ca',
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiTitle: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700',
  },
  aiReason: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomActions: {
    marginTop: 10,
  },
});

export default TicketDetailTimelineScreen;
