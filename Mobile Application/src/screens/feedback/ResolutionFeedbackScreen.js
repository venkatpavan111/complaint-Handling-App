import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import StarRating from '../../components/StarRating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import API from '../../services/api';
import { ArrowLeft, Star, Send, CheckCircle2 } from 'lucide-react-native';

export const ResolutionFeedbackScreen = ({ route, navigation }) => {
  const { ticketId = 'TKT-9842', complaint } = route.params || {};

  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = async () => {
    setSubmitting(true);
    try {
      if (complaint?._id) {
        await API.post('/feedback', {
          complaintId: complaint._id,
          rating,
          comment: comments,
        });
      }
      setSubmitted(true);
    } catch (e) {
      console.warn('Feedback API offline fallback success.');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Resolution Feedback ⭐</Text>
        <Text style={styles.headerSub}>
          Rate your resolution experience for ticket <Text style={{ color: '#818cf8', fontWeight: '700' }}>{ticketId}</Text>
        </Text>

        {submitted ? (
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={48} color="#34d399" />
            </View>
            <Text style={styles.successTitle}>Thank You for Your Feedback!</Text>
            <Text style={styles.successSub}>
              Your rating and review help us continuously improve campus facilities and support response speed.
            </Text>
            <CustomButton
              title="Back to Dashboard"
              onPress={() => navigation.navigate('MainTabs')}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardQuestion}>How satisfied are you with the resolution?</Text>
            
            <StarRating rating={rating} onRatingChange={setRating} size={38} />

            <Text style={styles.ratingLabel}>
              {rating === 5 ? '🌟 Excellent & Fast Resolution' :
               rating === 4 ? '👍 Satisfactory Response' :
               rating === 3 ? '😐 Average Service' :
               rating === 2 ? '👎 Needs Improvement' : '⚠️ Unsatisfactory'}
            </Text>

            <InputField
              label="Written Comments & Suggestions (Optional)"
              placeholder="Share details about the technician speed, communication, or issue outcome..."
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={4}
            />

            <CustomButton
              title="Submit Feedback"
              onPress={handleSubmitFeedback}
              loading={submitting}
              icon={<Send size={18} color="#ffffff" />}
              style={{ marginTop: 14 }}
            />
          </View>
        )}
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
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardQuestion: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  successCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ResolutionFeedbackScreen;
