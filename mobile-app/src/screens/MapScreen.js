import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import api from './api';
import CityUniversitiesScreen from './CityUniversitiesScreen';

const CITY_COLORS = ['#FADADD', '#D1E8E2', '#E1F8DC', '#E6E6FA', '#FFEBCC', '#D4E8FF', '#FFE5CC'];

const MapScreen = () => {
  const [cityDataMap, setCityDataMap] = useState({});
  const [loadingKeys, setLoadingKeys] = useState({});
  const [uniScreen, setUniScreen] = useState(null); // { cityName, universities }
  const [uniLoading, setUniLoading] = useState(false);
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

  // Harita açılınca tüm şehirleri arka planda pre-fetch et
  // (şehir puanları + üniversiteler + bölümler hepsi aynı istekten geliyor)
  useEffect(() => {
    const prefetchAll = async () => {
      const names = ['Istanbul', 'Ankara', 'Konya', 'Izmir', 'Antalya', 'Erzurum', 'Zonguldak'];
      for (const name of names) {
        await fetchDiscoveryData(name);
        // Her istek arasında 300ms bekle — sunucuyu bunaltmamak için
        await new Promise((r) => setTimeout(r, 300));
      }
    };
    prefetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeCityKey = (cityName) =>
    String(cityName || '').replaceAll('İ', 'I').replaceAll('ı', 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const toFloat = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const fetchDiscoveryData = async (cityName) => {
    const key = normalizeCityKey(cityName);
    if (cityDataMap[key]) return cityDataMap[key];

    setLoadingKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await api.get(`/university/discover/${encodeURIComponent(cityName)}`);
      const discovery = response?.data?.data || null;
      setCityDataMap((prev) => ({ ...prev, [key]: discovery }));
      return discovery;
    } catch (err) {
      return null;
    } finally {
      setLoadingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Üniversiteler ekranını aç — veri henüz çekilmediyse önce çek
  const openUniversities = async (item) => {
    setError('');
    const key = normalizeCityKey(item.city_name);
    let discovery = cityDataMap[key];

    if (!discovery) {
      setUniLoading(true);
      discovery = await fetchDiscoveryData(item.city_name);
      setUniLoading(false);
    }

    if (!discovery) {
      setError(`${item.city_name} için veri bulunamadı.`);
      return;
    }

    setUniScreen({
      cityName: item.city_name,
      universities: discovery.universities || [],
    });
  };

  // DB'deki 4 skor
  const DB_SCORES = [
    { key: 'cultural', label: 'Kültürel', icon: 'color-palette-outline' },
    { key: 'nature',   label: 'Doğa',     icon: 'leaf-outline' },
    { key: 'social',   label: 'Sosyal',   icon: 'people-outline' },
    { key: 'modern',   label: 'Modern',   icon: 'business-outline' },
  ];

  const ScoreRow = ({ label, score }) => (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        <Ionicons name="star" size={11} color="#F5A623" />
        <Text style={styles.scoreText}>{toFloat(score).toFixed(1)}</Text>
      </View>
    </View>
  );

  // Üniversiteler ekranı açıkken onu göster
  if (uniScreen) {
    return (
      <CityUniversitiesScreen
        cityName={uniScreen.cityName}
        universities={uniScreen.universities}
        onClose={() => setUniScreen(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* Üniversite verisi yüklenirken tam ekran spinner */}
      {uniLoading && (
        <View style={styles.fullScreenLoading}>
          <ActivityIndicator size="large" color="#AEC6CF" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      )}

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
          const isLoading = loadingKeys[key];
          return (
            <Marker
              key={item.id}
              coordinate={item.coordinate}
              onPress={() => fetchDiscoveryData(item.city_name)}
              onCalloutPress={() => openUniversities(item)}
            >
              <View style={styles.markerDot} />
              <Callout tooltip>
                <View style={styles.bubble}>
                  {/* Başlık bandı */}
                  <View style={[styles.bubbleHeader, { backgroundColor: CITY_COLORS[index % CITY_COLORS.length] }]}>
                    <Text style={styles.bubbleCityName}>{item.city_name}</Text>
                  </View>

                  {/* İçerik */}
                  <View style={styles.infoArea}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#AEC6CF" style={{ marginVertical: 8 }} />
                    ) : !cityInfo ? (
                      <Text style={styles.noDataText}>Yükleniyor...</Text>
                    ) : (
                      DB_SCORES.map(({ key: scoreKey, label }) => (
                        <ScoreRow
                          key={scoreKey}
                          label={label}
                          score={cityInfo?.scores?.[scoreKey]?.score}
                        />
                      ))
                    )}

                    {/* Hint: callout'a tıklayınca üniversiteler açılır */}
                    <View style={styles.tapHint}>
                      <Ionicons name="school-outline" size={10} color="#AEC6CF" />
                      <Text style={styles.tapHintText}>Üniversiteleri Gör</Text>
                      <Ionicons name="chevron-forward" size={10} color="#AEC6CF" />
                    </View>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
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
  errorText: { position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10, color: '#B00020', backgroundColor: '#FFF', padding: 8, borderRadius: 8 },

  // Tam ekran yükleme
  fullScreenLoading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#AAA' },

  // --- Marker ---
  markerDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#AEC6CF', borderWidth: 3, borderColor: '#FFF',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3,
  },

  // --- Callout Bubble ---
  bubble: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    width: 155,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  bubbleHeader: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  bubbleCityName: { fontSize: 13, fontWeight: '700', color: '#444', letterSpacing: 0.3 },
  infoArea: { paddingHorizontal: 10, paddingVertical: 8 },
  noDataText: { fontSize: 10, color: '#BBBBBB', textAlign: 'center', marginVertical: 4 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' },
  scoreLabel: { fontSize: 10, color: '#888', flex: 1 },
  starsContainer: { flexDirection: 'row', alignItems: 'center' },
  scoreText: { fontSize: 11, fontWeight: '700', color: '#444', marginLeft: 3 },

  // Üniversiteleri Gör hint
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
    paddingTop: 7,
    gap: 3,
  },
  tapHintText: { fontSize: 10, color: '#AEC6CF', fontWeight: '700' },
});

export default MapScreen;