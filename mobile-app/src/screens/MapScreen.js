import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

const MapScreen = () => {
  const colors = {
    softPink: '#FADADD',
    softBlue: '#D1E8E2',
    softMint: '#E1F8DC',
    softLavender: '#E6E6FA',
    softPeach: '#FFEBCC',
    pinBlue: '#AEC6CF',
  };

  const [cityDataMap, setCityDataMap] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityMarkers] = useState([
    { id: 1, city_name: 'Istanbul', coordinate: { latitude: 41.0082, longitude: 28.9784 } },
    { id: 2, city_name: 'Ankara', coordinate: { latitude: 39.9334, longitude: 32.8597 } },
    { id: 3, city_name: 'Konya', coordinate: { latitude: 37.8714, longitude: 32.4846 } },
    { id: 4, city_name: 'Izmir', coordinate: { latitude: 38.4237, longitude: 27.1428 } },
    { id: 5, city_name: 'Antalya', coordinate: { latitude: 36.8841, longitude: 30.7056 } },
    { id: 6, city_name: 'Erzurum', coordinate: { latitude: 39.9043, longitude: 41.2679 } },
    { id: 7, city_name: 'Zonguldak', coordinate: { latitude: 41.4506, longitude: 31.7908 } },
  ]);

  const normalizeCityKey = (cityName) => String(cityName || '').replaceAll('İ', 'I').replaceAll('ı', 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const toFloat = (value) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const toInt = (value) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const fetchDiscoveryData = async (cityName) => {
    const key = normalizeCityKey(cityName);
    if (cityDataMap[key]) {
      return cityDataMap[key];
    }

    try {
      const response = await api.get(`/university/discover/${encodeURIComponent(cityName)}`);
      const discovery = response?.data?.data || null;
      setCityDataMap((prev) => ({ ...prev, [key]: discovery }));
      return discovery;
    } catch (err) {
      return null;
    }
  };

  const openCityDetail = async (item) => {
    setError('');
    setDetailLoading(true);
    const discovery = await fetchDiscoveryData(item.city_name);
    if (!discovery) {
      setError(`${item.city_name} icin veri bulunamadi.`);
      setSelectedCity(null);
      setDetailLoading(false);
      return;
    }
    setSelectedCity({ city_name: item.city_name, discovery });
    setDetailLoading(false);
  };

  const RenderStars = ({ label, score }) => (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        <Ionicons name="star" size={10} color="#FFD700" />
        <Text style={styles.scoreText}>{toFloat(score).toFixed(1)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 38.9637,
          longitude: 35.2433,
          latitudeDelta: 7,
          longitudeDelta: 7,
        }}
        customMapStyle={mapStyle}
      >
        {cityMarkers.map((item, index) => {
          const key = normalizeCityKey(item.city_name);
          const discovery = cityDataMap[key];
          const cityInfo = discovery?.city_info;
          return (
            <Marker key={item.id} coordinate={item.coordinate}>
              <View style={styles.markerDot} />
              <Callout tooltip>
                <View style={styles.bubble}>
                  <View style={[styles.imagePlaceholder, { backgroundColor: Object.values(colors)[index % 5] }]}>
                    <Text style={styles.imgText}>{item.city_name}</Text>
                  </View>
                  <View style={styles.infoArea}>
                    <Text style={styles.title}>{item.city_name}</Text>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Nüfus</Text>
                      <Text style={styles.dbValueText}>{cityInfo?.population !== undefined ? toInt(cityInfo.population) : '-'}</Text>
                    </View>
                    <RenderStars label="Ekonomi" score={cityInfo?.scores?.economy?.score} />
                    <RenderStars label="Kulturel" score={cityInfo?.scores?.cultural?.score} />
                    <RenderStars label="Doga" score={cityInfo?.scores?.nature?.score} />
                    <RenderStars label="Sosyal" score={cityInfo?.scores?.social?.score} />
                    <RenderStars label="Modern" score={cityInfo?.scores?.modern?.score} />
                    <TouchableOpacity onPress={() => openCityDetail(item)}>
                      <Text style={styles.detailLink}>Detaylar ›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <Modal visible={!!selectedCity || detailLoading} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {detailLoading ? (
              <ActivityIndicator color="#4A90E2" />
            ) : (
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedCity?.discovery?.city_info?.name || selectedCity?.city_name}</Text>
                <Text style={styles.modalSubtitle}>cities.city_name</Text>
                <Text style={styles.modalItem}>total_student_count: {selectedCity?.discovery?.city_info?.population !== undefined ? toInt(selectedCity.discovery.city_info.population) : '-'}</Text>
                <Text style={styles.modalItem}>culture_score: {toFloat(selectedCity?.discovery?.city_info?.scores?.cultural?.score).toFixed(1)}</Text>
                <Text style={styles.modalItem}>nature_score: {toFloat(selectedCity?.discovery?.city_info?.scores?.nature?.score).toFixed(1)}</Text>
                <Text style={styles.modalItem}>social_score: {toFloat(selectedCity?.discovery?.city_info?.scores?.social?.score).toFixed(1)}</Text>
                <Text style={styles.modalItem}>modern_score: {toFloat(selectedCity?.discovery?.city_info?.scores?.modern?.score).toFixed(1)}</Text>
                <Text style={styles.modalItem}>total_cost_index: {toFloat(selectedCity?.discovery?.city_info?.scores?.economy?.score).toFixed(1)}</Text>

                <Text style={styles.universityHeader}>universities.uni_name</Text>
                {(selectedCity?.discovery?.universities || []).map((uni, idx) => (
                  <View key={`${uni.name}-${idx}`} style={styles.universityCard}>
                    <Text style={styles.universityName}>{uni.name}</Text>
                    <Text style={styles.universityMeta}>features: {uni.features ?? '-'}</Text>
                    <Text style={styles.universityMeta}>programs_count: {toInt(uni.programs?.length ?? 0)}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedCity(null)}>
              <Text style={styles.closeBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "on" }, { "color": "#e0e0e0" }, { "weight": 1 }] },
  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#9e9e9e" }, { "weight": 1.5 }] },
  { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "color": "#cccccc" }, { "weight": 1 }] },
  { "featureType": "landscape", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#cae2f5" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  map: { width: '100%', height: '100%' },
  errorText: { position: 'absolute', top: 12, left: 12, right: 12, zIndex: 2, color: '#B00020' },
  
  markerDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#AEC6CF', borderWidth: 3, borderColor: '#FFF', elevation: 4 },

  bubble: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: 130,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  imagePlaceholder: { width: '100%', height: 40, justifyContent: 'center', alignItems: 'center' },
  imgText: { fontSize: 10, fontWeight: 'bold', color: '#555', opacity: 0.7 },
  infoArea: { padding: 8 },
  title: { fontWeight: 'bold', fontSize: 14, marginBottom: 5, color: '#444' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2, alignItems: 'center' },
  scoreLabel: { fontSize: 9, color: '#AAA' },
  starsContainer: { flexDirection: 'row', alignItems: 'center' },
  scoreText: { fontSize: 10, fontWeight: 'bold', color: '#555', marginLeft: 2 },
  dbValueText: { fontSize: 9, fontWeight: 'bold', color: '#555' },
  detailLink: { fontSize: 9, color: '#AEC6CF', textAlign: 'right', marginTop: 5, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  modalCard: { maxHeight: '75%', backgroundColor: '#FFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
  modalSubtitle: { fontSize: 12, color: '#999', marginBottom: 12 },
  modalItem: { fontSize: 14, color: '#444', marginBottom: 4 },
  universityHeader: { marginTop: 12, marginBottom: 8, fontSize: 14, fontWeight: '700', color: '#333' },
  universityCard: { borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 12, padding: 10, marginBottom: 8 },
  universityName: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 3 },
  universityMeta: { fontSize: 12, color: '#666' },
  closeBtn: { marginTop: 10, alignSelf: 'center', backgroundColor: '#4A90E2', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 28 },
  closeBtnText: { color: '#FFF', fontWeight: '700' },
});

export default MapScreen;