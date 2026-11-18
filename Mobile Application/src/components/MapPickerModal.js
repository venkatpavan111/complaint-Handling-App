import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, TextInput, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { X, Check, Search, LocateFixed } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function MapPickerModal({ visible, onClose, onSelectLocation }) {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [markerCoords, setMarkerCoords] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
  });

  useEffect(() => {
    if (visible) {
      fetchPresentLocation();
    }
  }, [visible]);

  const fetchPresentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = currentLocation.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        setMarkerCoords({ latitude, longitude });
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    } catch (error) {
      console.warn('Could not fetch present location for map, using default.', error);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      let results = await Location.geocodeAsync(searchQuery.trim());
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        setMarkerCoords({ latitude, longitude });
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      } else {
        Alert.alert('Location Not Found', 'Could not find coordinates for the entered address/building.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Search Error', 'Failed to search location.');
    }
  };

  const handleMapPress = (e) => {
    const coords = e.nativeEvent.coordinate;
    setMarkerCoords(coords);
  };

  const handleConfirm = async () => {
    try {
      let addressArray = await Location.reverseGeocodeAsync({
        latitude: markerCoords.latitude,
        longitude: markerCoords.longitude,
      });

      let locationString = '';
      if (addressArray && addressArray.length > 0) {
        const addr = addressArray[0];
        locationString = `${addr.name || addr.street || searchQuery || 'Custom Location'}, ${addr.city || 'Campus'} (Lat: ${markerCoords.latitude.toFixed(4)}, Lng: ${markerCoords.longitude.toFixed(4)})`;
      } else {
        locationString = `Custom Pin (Lat: ${markerCoords.latitude.toFixed(4)}, Lng: ${markerCoords.longitude.toFixed(4)})`;
      }

      onSelectLocation(locationString);
      onClose();
    } catch (error) {
      const fallbackString = `Pin Location (Lat: ${markerCoords.latitude.toFixed(4)}, Lng: ${markerCoords.longitude.toFixed(4)})`;
      onSelectLocation(fallbackString);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🗺️ Campus Map & Present Location</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSub}>Auto-detected your present location. Tap or search to choose a custom spot:</Text>

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search custom building or address..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchLocation}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchLocation}>
              <Search size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.gpsBtn} onPress={fetchPresentLocation} title="Reset to GPS">
              <LocateFixed size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
            >
              <Marker
                coordinate={markerCoords}
                title="Selected Location"
                description="Drag pin or tap anywhere to update"
                draggable
                onDragEnd={(e) => setMarkerCoords(e.nativeEvent.coordinate)}
              />
            </MapView>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Check size={16} color="#ffffff" />
              <Text style={styles.confirmText}>Confirm Pin Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    height: Dimensions.get('window').height * 0.8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    height: 42,
    fontSize: 13,
  },
  searchBtn: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  gpsBtn: {
    backgroundColor: '#312e81',
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#475569',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
