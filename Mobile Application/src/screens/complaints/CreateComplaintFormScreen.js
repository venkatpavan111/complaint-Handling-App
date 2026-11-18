import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import InputField from '../../components/InputField';
import AttachmentPicker from '../../components/AttachmentPicker';
import CustomButton from '../../components/CustomButton';
import LeafletMapModal from '../../components/LeafletMapModal';
import { ArrowLeft, Sparkles, MapPin, AlignLeft, Tag, Map } from 'lucide-react-native';

export const CreateComplaintFormScreen = ({ route, navigation }) => {
  const selectedCategory = route.params?.category || 'Maintenance';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [showMapModal, setShowMapModal] = useState(false);

  const handleProceedToAIPreview = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Please enter complaint subject/title';
    if (!description.trim()) errs.description = 'Please describe the issue in detail';
    if (!location.trim()) errs.location = 'Please specify exact campus location';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    navigation.navigate('AIPriorityPreview', {
      complaintData: {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category: selectedCategory,
        attachments,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Step Header */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>STEP 2 OF 3 • DETAILS</Text>
        </View>

        <Text style={styles.headerTitle}>Complaint Details 📝</Text>
        <Text style={styles.headerSub}>
          Category: <Text style={{ color: '#818cf8', fontWeight: '700' }}>{selectedCategory}</Text>
        </Text>

        <View style={styles.form}>
          <InputField
            label="Subject / Short Title *"
            placeholder="e.g. Broken Projector Power Plug or Sewage Leak"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            icon={<Tag size={18} color="#818cf8" />}
          />

          <View>
            <InputField
              label="Specific Location on Campus *"
              placeholder="e.g. Academic Block A, 3rd Floor, Room 302"
              value={location}
              onChangeText={setLocation}
              error={errors.location}
              icon={<MapPin size={18} color="#818cf8" />}
            />

            <TouchableOpacity
              style={styles.googleMapButton}
              onPress={() => setShowMapModal(true)}
              activeOpacity={0.8}
            >
              <Map size={18} color="#ffffff" />
              <Text style={styles.googleMapButtonText}>Open OpenStreetMap & Pin Location</Text>
            </TouchableOpacity>
          </View>

          <InputField
            label="Detailed Description *"
            placeholder="Describe what happened, urgency level, safety risks, or affected students..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            error={errors.description}
            icon={<AlignLeft size={18} color="#818cf8" />}
          />

          {/* Media / Attachment Picker */}
          <AttachmentPicker attachments={attachments} onAttachmentsChange={setAttachments} />

          <CustomButton
            title="Analyze Priority with AI ✨"
            onPress={handleProceedToAIPreview}
            icon={<Sparkles size={18} color="#ffffff" />}
            style={{ marginTop: 20 }}
          />
        </View>

        {/* Leaflet / OpenStreetMap Interactive Picker Modal */}
        <LeafletMapModal
          visible={showMapModal}
          onClose={() => setShowMapModal(false)}
          onSelectLocation={(selectedLoc) => setLocation(selectedLoc)}
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
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  googleMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: -6,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  googleMapButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CreateComplaintFormScreen;
