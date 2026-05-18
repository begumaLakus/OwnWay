import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CityUniversitiesScreen = ({ cityName, universities, onClose }) => {
  const [expandedUni, setExpandedUni] = useState(null);

  const toggleUni = (uniIndex) => {
    setExpandedUni((prev) => (prev === uniIndex ? null : uniIndex));
  };

  const toInt = (v) => {
    const n = Number.parseInt(String(v ?? 0), 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const toFloat = (v) => {
    const n = Number.parseFloat(v ?? 0);
    return Number.isNaN(n) ? 0 : n;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Ionicons name="arrow-back" size={22} color="#444" />
        </TouchableOpacity>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerCity}>{cityName}</Text>
          <Text style={styles.headerSub}>Üniversiteler & Bölümler</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {(!universities || universities.length === 0) ? (
          <View style={styles.emptyBox}>
            <Ionicons name="school-outline" size={48} color="#DDD" />
            <Text style={styles.emptyText}>Bu şehirde üniversite bulunamadı.</Text>
          </View>
        ) : (
          universities.map((uni, uniIdx) => {
            const isOpen = expandedUni === uniIdx;
            const programs = uni.programs || [];
            return (
              <View key={`uni-${uniIdx}`} style={styles.uniCard}>
                {/* Üniversite Satırı */}
                <TouchableOpacity
                  style={styles.uniRow}
                  onPress={() => toggleUni(uniIdx)}
                  activeOpacity={0.75}
                >
                  <View style={styles.uniIconWrap}>
                    <Ionicons
                      name={uni.features?.includes('Devlet') ? 'school' : 'business'}
                      size={20}
                      color="#AEC6CF"
                    />
                  </View>
                  <View style={styles.uniTextBlock}>
                    <Text style={styles.uniName}>{uni.name}</Text>
                    <Text style={styles.uniMeta}>{uni.features ?? '-'}</Text>
                  </View>
                  <View style={styles.uniRight}>
                    <Text style={styles.deptCount}>{programs.length} bölüm</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#AEC6CF"
                    />
                  </View>
                </TouchableOpacity>

                {/* Bölümler Accordion */}
                {isOpen && (
                  <View style={styles.deptsContainer}>
                    {programs.length === 0 ? (
                      <Text style={styles.noDeptText}>Bölüm bilgisi bulunamadı.</Text>
                    ) : (
                      programs.map((prog, progIdx) => (
                        <View key={`prog-${progIdx}`} style={[styles.deptRow, progIdx === programs.length - 1 && { borderBottomWidth: 0 }]}>
                          {/* Bölüm Adı */}
                          <Text style={styles.deptName}>{prog.name}</Text>
                          {/* Bölüm Detayları */}
                          <View style={styles.deptDetails}>
                            <DeptBadge icon="ribbon-outline" label={`Puan: ${toFloat(prog.details?.score).toFixed(2)}`} />
                            <DeptBadge icon="bar-chart-outline" label={`Sıra: ${prog.details?.rank ?? '-'}`} />
                            <DeptBadge icon="language-outline" label={prog.details?.lang ?? 'Türkçe'} />
                            <DeptBadge icon="people-outline" label={`Kontenjan: ${toInt(prog.details?.quota)}`} />
                            <DeptBadge icon="male-female-outline" label={prog.details?.gender_info ?? '-'} />
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const DeptBadge = ({ icon, label }) => (
  <View style={styles.badge}>
    <Ionicons name={icon} size={12} color="#AEC6CF" style={{ marginRight: 4 }} />
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBlock: { flex: 1, alignItems: 'center' },
  headerCity: { fontSize: 18, fontWeight: '700', color: '#222' },
  headerSub: { fontSize: 12, color: '#999', marginTop: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Boş durum
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { marginTop: 16, fontSize: 15, color: '#CCC' },

  // Üniversite Kartı
  uniCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECEC',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  uniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  uniIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF7F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uniTextBlock: { flex: 1 },
  uniName: { fontSize: 14, fontWeight: '700', color: '#2D2D2D', marginBottom: 2 },
  uniMeta: { fontSize: 12, color: '#AAA' },
  uniRight: { alignItems: 'center', marginLeft: 8 },
  deptCount: { fontSize: 11, color: '#AEC6CF', fontWeight: '600', marginBottom: 2 },

  // Bölümler
  deptsContainer: {
    backgroundColor: '#FAFCFE',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 4,
  },
  noDeptText: { fontSize: 13, color: '#CCC', paddingVertical: 12, textAlign: 'center' },
  deptRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  deptName: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  deptDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF7F9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, color: '#555', fontWeight: '500' },
});

export default CityUniversitiesScreen;
