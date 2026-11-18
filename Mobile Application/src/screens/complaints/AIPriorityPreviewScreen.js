import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ComplaintsContext } from '../../context/ComplaintsContext';
import { analyzeComplaintPriority } from '../../services/priorityEngine';
import PriorityBadge from '../../components/PriorityBadge';
import CustomButton from '../../components/CustomButton';
import { Sparkles, ArrowLeft, Send, AlertTriangle, ShieldCheck, Clock, Tag } from 'lucide-react-native';

export const AIPriorityPreviewScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const { addComplaint } = useContext(ComplaintsContext);
  const complaintData = route.params?.complaintData || {};

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Run AI dynamic priority computation
    const result = analyzeComplaintPriority({
      title: complaintData.title,
      description: complaintData.description,
      category: complaintData.category,
      location: complaintData.location,
    });
    setAiAnalysis(result);
  }, [complaintData]);

  const handleSubmitTicket = async () => {
    if (!aiAnalysis) return;

    setSubmitting(true);
    try {
      const payload = {
        title: complaintData.title,
        description: complaintData.description,
        category: complaintData.category,
        location: complaintData.location,
        priority: aiAnalysis.priority,
        priorityScore: aiAnalysis.priorityScore,
        priorityReason: aiAnalysis.priorityReason,
        detectedKeywords: aiAnalysis.detectedKeywords,
        attachments: complaintData.attachments || [],
      };

      const createdEntry = await addComplaint(payload);

      // Navigate to Confirmation Screen
      navigation.reset({
        index: 0,
        routes: [
          { name: 'MainTabs' },
          {
            name: 'TicketConfirmation',
            params: {
              ticketId: createdEntry.ticketId,
              estimatedSLA: aiAnalysis.estimatedSLA,
              priority: aiAnalysis.priority,
              priorityScore: aiAnalysis.priorityScore,
              title: complaintData.title,
            },
          },
        ],
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!aiAnalysis) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Step Indicator */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>STEP 3 OF 3 • AI ANALYSIS PREVIEW</Text>
        </View>

        <Text style={styles.headerTitle}>AI Priority Analysis 🤖</Text>
        <Text style={styles.headerSub}>
          Real-time dynamic priority score computed based on trigger keywords and urgency metrics.
        </Text>

        {/* Priority Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBadgeCircle}>
              <Text style={styles.scoreNumber}>{aiAnalysis.priorityScore}</Text>
              <Text style={styles.scoreLabel}>/100</Text>
            </View>
            <View style={styles.scoreMeta}>
              <Text style={styles.scoreMetaHeading}>Dynamic Priority Level</Text>
              <PriorityBadge priority={aiAnalysis.priority} score={aiAnalysis.priorityScore} />
              <View style={styles.slaRow}>
                <Clock size={14} color="#818cf8" />
                <Text style={styles.slaText}>Estimated SLA: {aiAnalysis.estimatedSLA}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Reason Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={18} color="#818cf8" />
            <Text style={styles.cardTitle}>AI Priority Rationale</Text>
          </View>
          <Text style={styles.reasonText}>{aiAnalysis.priorityReason}</Text>
        </View>

        {/* Trigger Keywords */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Tag size={18} color="#f59e0b" />
            <Text style={styles.cardTitle}>Identified Trigger Keywords</Text>
          </View>

          {aiAnalysis.detectedKeywords.length > 0 ? (
            <View style={styles.tagWrap}>
              {aiAnalysis.detectedKeywords.map((kw, idx) => (
                <View key={idx} style={styles.kwTag}>
                  <Sparkles size={12} color="#f59e0b" style={{ marginRight: 4 }} />
                  <Text style={styles.kwText}>{kw}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noKwText}>Standard routine complaint parameters detected.</Text>
          )}
        </View>

        {/* Summary Details Preview */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Ticket Summary</Text>
          <Text style={styles.summaryTitle}>{complaintData.title}</Text>
          <Text style={styles.summaryLoc}>📍 {complaintData.location}</Text>
          <Text style={styles.summaryDesc} numberOfLines={3}>
            {complaintData.description}
          </Text>
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Confirm & Submit Ticket"
          onPress={handleSubmitTicket}
          loading={submitting}
          icon={<Send size={18} color="#ffffff" />}
          style={{ marginTop: 24 }}
        />
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    backgroundColor: '#6366f120',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  stepText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
    lineHeight: 18,
  },
  scoreCard: {
    backgroundColor: '#1e1b4b',
    borderColor: '#6366f1',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreBadgeCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#4338ca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  scoreMeta: {
    flex: 1,
    gap: 6,
  },
  scoreMetaHeading: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  slaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  slaText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  reasonText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  kwTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9770620',
    borderColor: '#f59e0b',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kwText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },
  noKwText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryHeading: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLoc: {
    color: '#818cf8',
    fontSize: 12,
    marginBottom: 6,
  },
  summaryDesc: {
    color: '#cbd5e1',
    fontSize: 13,
  },
});

export default AIPriorityPreviewScreen;
