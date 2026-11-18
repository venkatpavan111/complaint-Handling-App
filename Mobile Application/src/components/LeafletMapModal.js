import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Check, LocateFixed } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function LeafletMapModal({ visible, onClose, onSelectLocation }) {
  const webViewRef = useRef(null);
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [loadingGps, setLoadingGps] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchPresentLocation();
    }
  }, [visible]);

  const fetchPresentLocation = async () => {
    try {
      setLoadingGps(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = loc.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (typeof map !== 'undefined' && typeof marker !== 'undefined') {
              map.setView([${latitude}, ${longitude}], 16);
              marker.setLatLng([${latitude}, ${longitude}]);
            }
            true;
          `);
        }
      }
    } catch (e) {
      console.warn('GPS location fetch fallback used for map:', e);
    } finally {
      setLoadingGps(false);
    }
  };

  // HTML content rendering Leaflet JS and OpenStreetMap tiles with attribution
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; background: #0f172a; }
        #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${coords.lat}, ${coords.lng}], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Leaflet'
        }).addTo(map);

        var marker = L.marker([${coords.lat}, ${coords.lng}], { draggable: true }).addTo(map);

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          marker.setLatLng([lat, lng]);
          window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
        });

        marker.on('dragend', function(e) {
          var lat = marker.getLatLng().lat;
          var lng = marker.getLatLng().lng;
          window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
        });
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.lat && data.lng) {
        setCoords({ lat: data.lat, lng: data.lng });
      }
    } catch (e) {
      console.error('Error parsing webview message:', e);
    }
  };

  const handleConfirm = () => {
    const locationString = `OpenStreetMap Pin: Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}`;
    onSelectLocation(locationString);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🗺️ OpenStreetMap & Present Location</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <View style={styles.subRow}>
            <Text style={styles.modalSub}>
              {loadingGps ? 'Detecting present location...' : 'Showing your present location. Tap or drag pin to adjust:'}
            </Text>
            <TouchableOpacity style={styles.gpsResetBtn} onPress={fetchPresentLocation} title="Reset to GPS">
              <LocateFixed size={14} color="#818cf8" />
              <Text style={styles.gpsResetText}>Re-center GPS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: leafletHtml }}
              style={styles.map}
              onMessage={handleMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
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
    height: Dimensions.get('window').height * 0.78,
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
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalSub: {
    fontSize: 11,
    color: '#94a3b8',
    flex: 1,
  },
  gpsResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312e81',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  gpsResetText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '600',
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
    backgroundColor: '#0f172a',
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
