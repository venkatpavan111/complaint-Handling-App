import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { GraduationCap, Wrench, Building2, ShieldAlert, Home, ArrowLeft, ChevronRight } from 'lucide-react-native';

const CATEGORIES = [
  {
    id: 'Academic',
    title: 'Academic & Course Issues',
    subtitle: 'Exams, hall tickets, lab equipment, course timetable, projector',
    icon: GraduationCap,
    color: '#818cf8',
    bgColor: '#6366f115',
  },
  {
    id: 'Maintenance',
    title: 'Maintenance & Cleanliness',
    subtitle: 'Electrical, plumbing, water dispenser, air conditioning, sanitation',
    icon: Wrench,
    color: '#f59e0b',
    bgColor: '#f59e0b15',
  },
  {
    id: 'Facilities',
    title: 'College Facilities & Library',
    subtitle: 'Auditorium, library seating, Wi-Fi connectivity, cafeteria',
    icon: Building2,
    color: '#38bdf8',
    bgColor: '#38bdf815',
  },
  {
    id: 'Hostel',
    title: 'Hostel & Mess Issues',
    subtitle: 'Room repair, food quality, laundry, hot water supply',
    icon: Home,
    color: '#34d399',
    bgColor: '#34d39915',
  },
  {
    id: 'Emergency',
    title: 'Security & Urgent Hazards',
    subtitle: 'Fire risk, short circuit, medical emergency, harassment',
    icon: ShieldAlert,
    color: '#f87171',
    bgColor: '#ef444415',
  },
];

export const CategorySelectionScreen = ({ navigation }) => {
  const handleSelectCategory = (category) => {
    navigation.navigate('CreateComplaintForm', { category: category.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Select Complaint Category 📋</Text>
        <Text style={styles.headerSub}>
          Choose the department category for proper AI routing and admin dispatch.
        </Text>

        <View style={styles.categoryList}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => handleSelectCategory(cat)}
              >
                <View style={[styles.iconBox, { backgroundColor: cat.bgColor }]}>
                  <Icon size={26} color={cat.color} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{cat.title}</Text>
                  <Text style={styles.cardSub}>{cat.subtitle}</Text>
                </View>

                <ChevronRight size={20} color="#64748b" />
              </TouchableOpacity>
            );
          })}
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
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    lineHeight: 20,
  },
  categoryList: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default CategorySelectionScreen;
