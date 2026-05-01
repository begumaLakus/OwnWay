import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import api from './api';

const { width } = Dimensions.get('window');

// scores ve onResetTest prop'larını ekledik
const ProfileScreen = ({ user, onLogout, scores, onResetTest }) => {
  const [showResult, setShowResult] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) {
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAuthData(response?.data?.data || null);
      } catch (error) {
        setAuthData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const fullName = useMemo(() => {
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    return `${firstName} ${lastName}`.trim();
  }, [user]);

  const mappedScores = {
    culture_w: scores?.culture ?? null,
    modern_w: scores?.modern ?? null,
    social_w: scores?.social ?? null,
    nature_w: scores?.nature ?? null,
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* 1. ÜST ALAN (Avatar ve İsim) */}
        <View style={styles.headerArea}>
          <View style={styles.avatar}>
             <Text style={styles.avatarLetter}>{(fullName || user?.email || 'U')[0].toUpperCase()}</Text>
             <View style={styles.onlineDot} />
          </View>
          <View style={styles.userTextInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{fullName || user?.email || 'Kullanici'}</Text>
            </View>
            <Text style={styles.userSub}>OwnWay Üyesi</Text>
          </View>
        </View>

        {/* 2. ANA TEST BUTONU */}
        <TouchableOpacity style={styles.testSolveBtn} >
          <View style={styles.testIconBox}>
            <Text style={{fontSize: 20}}>📝</Text>
          </View>
          <View style={{marginLeft: 15}}>
            <Text style={styles.testSolveTitle}>Meslek Analiz Testi</Text>
            <Text style={styles.testSolveSub}>Karakterine en uygun mesleği bul</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* 3. KİŞİSEL BİLGİLER */}
        <Text style={styles.sectionTitle}>KİŞİSEL BİLGİLER</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <InfoTile label="Konum" value={user?.current_location || '-'} />
            <InfoTile label="E-Posta" value={authData?.email || user?.email || '-'} isLast />
          </View>
          <View style={styles.infoRow}>
            <InfoTile label="Okul" value={user?.high_school || '-'} />
            <InfoTile label="Bölüm" value={user?.dept_type || '-'} isLast />
          </View>
          <View style={styles.infoRow}>
            <InfoTile label="Kişilik tipi" value={user?.personality_type || '-'} isFull />
          </View>
        </View>

        {/* 4. TERCİHLER VE TEST SONUCU */}
        <Text style={styles.sectionTitle}>TERCİHLER</Text>
        <View style={styles.menuList}>
          
          {/* TEST SONUCUM SATIRI */}
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowResult(!showResult)}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconSquare, { backgroundColor: '#E8F0FE' }]}>
                <Text style={{fontSize: 16}}>📊</Text>
              </View>
              <Text style={styles.menuLabel}>Test Sonucum</Text>
            </View>
            <Text style={[styles.arrowIcon, { transform: [{ rotate: showResult ? '90deg' : '0deg' }] }]}>›</Text>
          </TouchableOpacity>

          {/* AÇILIR SONUÇ PANELİ */}
{showResult && (
  <View style={styles.resultDetails}>
    <Text style={styles.resultCityTitle}>
      Önerilen Şehir: 
      <Text style={{ color: '#4A90E2', fontWeight: 'bold' }}>
        {/* Veritabanından gelen şehir ismini buraya bağladık */}
        {user?.matched_cities?.[0]?.city?.city_name || ''}
      </Text>
    </Text>
              {loading ? (
  <ActivityIndicator color="#4A90E2" style={{ marginVertical: 10 }} />
) : (
  // Puanları sildik, yerine kullanıcıya yönelik şık bir mesaj ekledik
  <Text style={{ 
    textAlign: 'center', 
    color: '#8E8E93', 
    fontSize: 14, 
    marginVertical: 8,
    fontStyle: 'italic' 
  }}>
    Karakter analizine göre senin için en ideal şehir belirlendi! ✨
  </Text>
)}
            
              <TouchableOpacity style={styles.reSolveBtn} onPress={onResetTest}>
                <Text style={styles.reSolveText}>Testi Tekrar Çöz</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.divider} />
          <MenuRow icon="🎧" label="Destek" color="#FFF5E6" />
          <View style={styles.divider} />
          <MenuRow icon="📝" label="Bilgilerimi Güncelle" color="#E2FBE7" />
        </View>

        {/* 5. ÇIKIŞ YAP */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Uygulama Versiyonu 1.0.1</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} /> 
      </ScrollView>
    </View>
  );
};

// Alt Bileşenler (Değişmedi)
const InfoTile = ({ label, value, isLast, isFull }) => (
  <View style={[styles.infoTile, { marginRight: isLast ? 0 : 10, flex: isFull ? 1 : 1 }]}>
    <Text style={styles.tileLabel}>{label}</Text>
    <Text style={styles.tileValue} numberOfLines={1}>{value}</Text>
  </View>
);

const MenuRow = ({ icon, label, color }) => (
  <TouchableOpacity style={styles.menuRow}>
    <View style={styles.menuLeft}>
      <View style={[styles.iconSquare, { backgroundColor: color }]}>
        <Text style={{fontSize: 16}}>{icon}</Text>
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Text style={styles.arrowIcon}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBFF' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 60 },
  
  headerArea: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  avatarLetter: { fontSize: 28, fontWeight: 'bold', color: '#777' },
  onlineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#4CD964', position: 'absolute', bottom: 2, right: 2, borderWidth: 2, borderColor: '#F8FBFF' },
  userTextInfo: { marginLeft: 15 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  proBadge: { backgroundColor: '#E2FBE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  proText: { fontSize: 10, fontWeight: 'bold', color: '#4CD964' },
  userSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },

  testSolveBtn: { backgroundColor: '#4A90E2', padding: 20, borderRadius: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  testIconBox: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  testSolveTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  testSolveSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#BDBDBD', marginBottom: 15, letterSpacing: 1 },
  infoGrid: { marginBottom: 20 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  infoTile: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  tileLabel: { fontSize: 9, color: '#BDBDBD', fontWeight: 'bold', marginBottom: 5 },
  tileValue: { fontSize: 13, fontWeight: '600', color: '#444' },

  menuList: { backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconSquare: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16, color: '#333', fontWeight: '500' },
  arrowIcon: { fontSize: 22, color: '#D1D1D6', fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#F8F8F8', marginLeft: 55 },

  // --- YENİ EKLENEN SONUÇ STİLLERİ ---
  resultDetails: { 
    padding: 20, 
    backgroundColor: '#F0F7FF', 
    borderRadius: 20, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D0E5FF'
  },
  resultCityTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  resultDesc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 15 },
  reSolveBtn: { 
    backgroundColor: '#FFF', 
    paddingVertical: 10, 
    borderRadius: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2'
  },
  reSolveText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 14 },

  footer: { marginTop: 40, alignItems: 'center' },
  versionText: { fontSize: 12, color: '#D1D1D6', marginBottom: 15 },
  logoutBtn: { backgroundColor: '#FFF5F5', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20 },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 15 }
});

export default ProfileScreen;