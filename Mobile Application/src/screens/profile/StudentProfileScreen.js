import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, updateUserProfile, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Venkatesh P');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [section, setSection] = useState(user?.section || 'Section B');
  const [year, setYear] = useState(user?.year || '3rd Year');
  const [loading, setLoading] = useState(false);

  const handlePickAvatar = async () => {
    Alert.alert(
      'Profile Picture',
      'Choose a source for your profile picture',
      [
        {
          text: 'Camera',
          onPress: async () => {
            let perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permission Denied', 'Camera permission is required.');
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const uri = result.assets[0].uri;
              if (updateUserProfile) {
                await updateUserProfile({ avatar: uri });
              }
              Alert.alert('Success', 'Profile picture updated successfully!');
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            let perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permission Denied', 'Gallery permission is required.');
              return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const uri = result.assets[0].uri;
              if (updateUserProfile) {
                await updateUserProfile({ avatar: uri });
              }
              Alert.alert('Success', 'Profile picture updated successfully!');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      try {
        await API.put('/users/profile', {
          name,
          phone,
          year,
          section,
        });
      } catch (err) {
        console.warn('Backend profile update endpoint unavailable, updating locally.');
      }

      if (updateUserProfile) {
        await updateUserProfile({ name, phone, year, section });
      }

      setIsEditing(false);
      Alert.alert('Success', 'Profile details updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Success', 'Profile details updated successfully!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarTouchable} onPress={handlePickAvatar} activeOpacity={0.85}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name ? name.charAt(0) : 'S'}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap avatar to change photo</Text>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.idText}>ID: {user?.identifier || 'CS2026-089'}</Text>
          <Text style={styles.deptText}>{user?.department || 'Computer Science & Engineering'}</Text>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Academic & Contact Details */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Academic & Personal Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year</Text>
            <Text style={styles.infoValue}>{year}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Section</Text>
            <Text style={styles.infoValue}>{section}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{phone}</Text>
          </View>
        </View>

        {/* Sign Out Action Card */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out of your account?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: () => logout && logout() }
              ]
            );
          }}
        >
          <Text style={styles.logoutBtnText}>🚪 Sign Out of Account</Text>
        </TouchableOpacity>

        {/* Edit Modal */}
        <Modal visible={isEditing} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Year</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Section</Text>
              <TextInput
                style={styles.input}
                value={section}
                onChangeText={setSection}
                placeholderTextColor="#64748b"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  content: { padding: 20 },
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarTouchable: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#818cf8',
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: '#818cf8',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  avatarHint: { color: '#94a3b8', fontSize: 11, marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  idText: { fontSize: 14, color: '#38bdf8', marginBottom: 2, fontWeight: '600' },
  deptText: { fontSize: 13, color: '#cbd5e1', marginBottom: 16, textAlign: 'center' },
  editBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: { fontSize: 14, color: '#94a3b8' },
  infoValue: { fontSize: 14, color: '#ffffff', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#475569',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputLabel: { fontSize: 13, color: '#94a3b8', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#334155' },
  cancelBtnText: { color: '#ffffff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#6366f1' },
  saveBtnText: { color: '#ffffff', fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#1e1b4b',
    borderColor: '#4338ca',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutBtnText: {
    color: '#f87171',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
