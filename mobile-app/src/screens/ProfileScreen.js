import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, Modal, TextInput,
  KeyboardAvoidingView, Platform, Animated, Alert, SafeAreaView
} from 'react-native';
import api from './api';
import { personalityQuestions } from '../data/questions';
import { submitCareerTest } from '../utils/careerTest';

const { width } = Dimensions.get('window');

// ─── KİŞİLİK TESTİ MODAL BİLEŞENİ ────────────────────────────────────────────
const PersonalityTestModal = ({ visible, onClose, onComplete, user }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [testDone, setTestDone] = useState(false);
  const [resultData, setResultData] = useState(null);

  const totalQuestions = personalityQuestions.length;
  const currentQuestion = personalityQuestions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / totalQuestions;

  const handleClose = () => {
    const wasCompleted = testDone;
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestDone(false);
    setResultData(null);
    onClose();
    if (wasCompleted && onComplete) onComplete();
  };

  const handleAnswer = (score) => {
    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitTest = async () => {
    if (!user?.token) {
      Alert.alert('Hata', 'Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setLoading(true);
    try {
      const result = await submitCareerTest(answers, user.token);
      setResultData(result.topCareers);
      setTestDone(true);
    } catch (error) {
      console.error('Test gönderme hatası:', error?.response?.data || error);
      const serverMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message;
      Alert.alert(
        'Hata',
        serverMsg || 'Test sonuçları gönderilirken bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const allAnswered = Object.keys(answers).length === totalQuestions;

  const SCORE_OPTIONS = [
    { label: '❌ Hiç Sevmem', score: 1 },
    { label: '📉 Az Severim', score: 2 },
    { label: '😐 Nötr', score: 3 },
    { label: '📈 Severim', score: 4 },
    { label: '🔥 Çok Severim', score: 5 },
  ];

  const CATEGORY_LABELS = {
    R: { label: 'Gerçekçi', emoji: '🔧', color: '#FF6B35' },
    I: { label: 'Araştırmacı', emoji: '🔬', color: '#4A90E2' },
    A: { label: 'Sanatsal', emoji: '🎨', color: '#9B59B6' },
    S: { label: 'Sosyal', emoji: '🤝', color: '#27AE60' },
    E: { label: 'Girişimci', emoji: '🚀', color: '#F39C12' },
    C: { label: 'Geleneksel', emoji: '📋', color: '#16A085' },
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={modalStyles.safeArea}>
        <View style={modalStyles.topBar}>
          <TouchableOpacity onPress={handleClose} style={modalStyles.closeBtn}>
            <Text style={modalStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={modalStyles.topTitle}>Meslek Analiz Testi</Text>
          <View style={{ width: 36 }} />
        </View>

        {loading ? (
          <View style={modalStyles.center}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={modalStyles.loadingText}>Kişilik analizi yapılıyor...</Text>
          </View>
        ) : testDone && resultData ? (
          <ScrollView contentContainerStyle={modalStyles.resultScroll}>
            <View style={modalStyles.resultHeader}>
              <Text style={modalStyles.resultEmoji}>🎉</Text>
              <Text style={modalStyles.resultTitle}>Analiz Tamamlandı!</Text>
              <Text style={modalStyles.resultSub}>Kişiliğine en uygun meslekler:</Text>
            </View>

            {resultData.slice(0, 3).map((meslek, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              const bgs = ['#FFF8E1', '#F5F5F5', '#FBE9E7'];
              const borders = ['#FFD54F', '#BDBDBD', '#FFAB91'];
              return (
                <View key={i} style={[modalStyles.resultCard, { backgroundColor: bgs[i], borderColor: borders[i] }]}>
                  <Text style={modalStyles.resultMedal}>{medals[i]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={modalStyles.resultRank}>{i + 1}. Öneri</Text>
                    <Text style={modalStyles.resultMeslek}>💼 {meslek}</Text>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={modalStyles.doneBtn} onPress={handleClose}>
              <Text style={modalStyles.doneBtnText}>Harika, Teşekkürler! 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.retryBtn}
              onPress={() => {
                setCurrentQuestionIndex(0);
                setAnswers({});
                setTestDone(false);
                setResultData(null);
              }}
            >
              <Text style={modalStyles.retryBtnText}>Testi Tekrar Çöz</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={modalStyles.testScroll}>
            <View style={modalStyles.progressRow}>
              <Text style={modalStyles.progressText}>Soru {currentQuestionIndex + 1} / {totalQuestions}</Text>
              <Text style={modalStyles.categoryBadge}>
                {CATEGORY_LABELS[currentQuestion.category]?.emoji}{' '}
                {CATEGORY_LABELS[currentQuestion.category]?.label}
              </Text>
            </View>
            <View style={modalStyles.progressBarBg}>
              <View style={[modalStyles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>

            <View style={modalStyles.questionCard}>
              <Text style={modalStyles.questionText}>{currentQuestion.text}</Text>
            </View>

            <Text style={modalStyles.hintText}>Bu aktiviteyi yapmaktan ne kadar keyif alırsınız?</Text>

            <View style={modalStyles.optionsContainer}>
              {SCORE_OPTIONS.map((item) => {
                const isSelected = answers[currentQuestion.id] === item.score;
                return (
                  <TouchableOpacity
                    key={item.score}
                    style={[modalStyles.optionBtn, isSelected && modalStyles.optionBtnSelected]}
                    onPress={() => handleAnswer(item.score)}
                  >
                    <Text style={[modalStyles.optionText, isSelected && modalStyles.optionTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={modalStyles.footerRow}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity
                  style={modalStyles.backBtn}
                  onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                >
                  <Text style={modalStyles.backBtnText}>⬅️ Önceki</Text>
                </TouchableOpacity>
              )}
              {allAnswered && (
                <TouchableOpacity style={modalStyles.submitBtn} onPress={submitTest}>
                  <Text style={modalStyles.submitBtnText}>Analiz Et 🚀</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

// ─── PROFİL EKRANI ────────────────────────────────────────────────────────────
const ProfileScreen = ({ user, onLogout, scores, onResetTest, onUserUpdate }) => {
  const [showResult, setShowResult] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [personalityModalVisible, setPersonalityModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    current_location: '',
    high_school: '',
    dept_type: '',
  });
  const slideAnim = useRef(new Animated.Value(600)).current;

  const openEditModal = () => {
    setEditForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      current_location: user?.current_location || '',
      high_school: user?.high_school || '',
      dept_type: user?.dept_type || '',
    });
    setEditModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeEditModal = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setEditModalVisible(false));
  };

  const handleSaveProfile = async () => {
    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      Alert.alert('Hata', 'Ad ve soyad alanları boş bırakılamaz.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/user/profile', editForm, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Alert.alert('Başarılı', 'Profilin güncellendi! ✅');
      if (onUserUpdate) onUserUpdate(editForm);
      closeEditModal();
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) return;
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
  }, [user, scores, refreshKey]);

  const fullName = useMemo(() => {
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    return `${firstName} ${lastName}`.trim();
  }, [user]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. ÜST ALAN */}
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

        {/* 2. MESLEK ANALİZ TESTİ BUTONU */}
        <TouchableOpacity style={styles.testSolveBtn} onPress={() => setPersonalityModalVisible(true)}>
          <View style={styles.testIconBox}>
            <Text style={{fontSize: 20}}>📝</Text>
          </View>
          <View style={{marginLeft: 15}}>
            <Text style={styles.testSolveTitle}>Meslek Analiz Testi</Text>
            <Text style={styles.testSolveSub}>Sana en uygun Mesleği bulalım</Text>
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
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowResult(!showResult)}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconSquare, { backgroundColor: '#E8F0FE' }]}>
                <Text style={{fontSize: 16}}>📊</Text>
              </View>
              <Text style={styles.menuLabel}>Test Sonucum</Text>
            </View>
            <Text style={[styles.arrowIcon, { transform: [{ rotate: showResult ? '90deg' : '0deg' }] }]}>›</Text>
          </TouchableOpacity>

          {showResult && (
            <View style={styles.resultDetails}>
              {loading ? (
                <ActivityIndicator color="#4A90E2" style={{ marginVertical: 10 }} />
              ) : (() => {
                const cities = authData?.matched_cities;
                const careers = authData?.career_suggestions;
                const RANK_CONFIG = [
                  { medal: '🥇', bg: '#FFF8E1', border: '#FFD54F', textColor: '#F57F17', label: '1. Öneri' },
                  { medal: '🥈', bg: '#F5F5F5', border: '#BDBDBD', textColor: '#424242', label: '2. Öneri' },
                  { medal: '🥉', bg: '#FBE9E7', border: '#FFAB91', textColor: '#BF360C', label: '3. Öneri' },
                ];
                const CAREER_CONFIG = [
                  { medal: '💼', bg: '#F0FFF4', border: '#6FCF97', textColor: '#27AE60', label: '1. Meslek' },
                  { medal: '🌟', bg: '#F0F4FF', border: '#A78BFA', textColor: '#7C3AED', label: '2. Meslek' },
                  { medal: '🚀', bg: '#FFF5F0', border: '#FDA29B', textColor: '#E04D2B', label: '3. Meslek' },
                ];
                const hasCities = cities && cities.length > 0;
                const hasCareers = careers && careers.length > 0;

                return (
                  <View>
                    {hasCities && (
                      <View>
                        <Text style={styles.resultHeader}>✨ Sana Özel Şehir Önerileri</Text>
                        {cities.slice(0, 3).map((item, index) => {
                          const cityName = item?.city?.city_name || item?.city_name || '?';
                          const cfg = RANK_CONFIG[index] || RANK_CONFIG[2];
                          return (
                            <View key={index} style={[styles.cityCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                              <Text style={styles.cityMedal}>{cfg.medal}</Text>
                              <View style={styles.cityCardText}>
                                <Text style={[styles.cityRankLabel, { color: cfg.textColor }]}>{cfg.label}</Text>
                                <Text style={styles.cityName}>{cityName}</Text>
                              </View>
                            </View>
                          );
                        })}
                        <TouchableOpacity style={styles.reSolveBtn} onPress={onResetTest}>
                          <Text style={styles.reSolveText}>🏙️ Şehir Testini Tekrar Çöz</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {hasCareers && (
                      <View style={{ marginTop: hasCities ? 16 : 0 }}>
                        <Text style={styles.resultHeader}>💼 Sana Özel Meslek Önerileri</Text>
                        {careers.slice(0, 3).map((item, index) => {
                          const meslekAdi = item?.occupation_name || '?';
                          const cfg = CAREER_CONFIG[index] || CAREER_CONFIG[2];
                          return (
                            <View key={index} style={[styles.cityCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                              <Text style={styles.cityMedal}>{cfg.medal}</Text>
                              <View style={styles.cityCardText}>
                                <Text style={[styles.cityRankLabel, { color: cfg.textColor }]}>{cfg.label}</Text>
                                <Text style={styles.cityName}>{meslekAdi}</Text>
                              </View>
                            </View>
                          );
                        })}
                        <TouchableOpacity
                          style={[styles.reSolveBtn, styles.reSolveBtnCareer]}
                          onPress={() => setPersonalityModalVisible(true)}
                        >
                          <Text style={[styles.reSolveText, styles.reSolveTextCareer]}>📝 Meslek Testini Tekrar Çöz</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {!hasCities && !hasCareers && (
                      <View style={{ gap: 8 }}>
                        <TouchableOpacity style={styles.reSolveBtn} onPress={onResetTest}>
                          <Text style={styles.reSolveText}>🏙️ Şehir Testini Başlat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.reSolveBtn, styles.reSolveBtnCareer]}
                          onPress={() => setPersonalityModalVisible(true)}
                        >
                          <Text style={[styles.reSolveText, styles.reSolveTextCareer]}>📝 Meslek Testini Başlat</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })()}
            </View>
          )}

          <View style={styles.divider} />
          <MenuRow icon="🎧" label="Destek" color="#FFF5E6" />
          <View style={styles.divider} />
          <MenuRow icon="✏️" label="Bilgilerimi Güncelle" color="#E2FBE7" onPress={openEditModal} />
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

      {/* 6. KİŞİLİK TESTİ MODALİ */}
      <PersonalityTestModal
        visible={personalityModalVisible}
        onClose={() => setPersonalityModalVisible(false)}
        onComplete={() => setRefreshKey((k) => k + 1)}
        user={user}
      />

      {/* 7. PROFİL DÜZENLEME MODALİ */}
      <Modal visible={editModalVisible} transparent animationType="none" onRequestClose={closeEditModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeEditModal} />
        <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalHeader}>
              <View style={styles.modalDrag} />
              <Text style={styles.modalTitle}>✏️ Profil Bilgilerini Düzenle</Text>
              <Text style={styles.modalSub}>Bilgilerini güncelleyerek profilini kişiselleştir</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <Text style={styles.inputLabel}>Ad</Text>
              <TextInput style={styles.inputField} value={editForm.first_name} onChangeText={(v) => setEditForm((f) => ({ ...f, first_name: v }))} placeholder="Adın" placeholderTextColor="#BDBDBD" />
              <Text style={styles.inputLabel}>Soyad</Text>
              <TextInput style={styles.inputField} value={editForm.last_name} onChangeText={(v) => setEditForm((f) => ({ ...f, last_name: v }))} placeholder="Soyadın" placeholderTextColor="#BDBDBD" />
              <Text style={styles.inputLabel}>Konum (Şehir)</Text>
              <TextInput style={styles.inputField} value={editForm.current_location} onChangeText={(v) => setEditForm((f) => ({ ...f, current_location: v }))} placeholder="Yaşadığın şehir" placeholderTextColor="#BDBDBD" />
              <Text style={styles.inputLabel}>Okul</Text>
              <TextInput style={styles.inputField} value={editForm.high_school} onChangeText={(v) => setEditForm((f) => ({ ...f, high_school: v }))} placeholder="Okul adın" placeholderTextColor="#BDBDBD" />
              <Text style={styles.inputLabel}>Bölüm</Text>
              <TextInput style={styles.inputField} value={editForm.dept_type} onChangeText={(v) => setEditForm((f) => ({ ...f, dept_type: v }))} placeholder="Ör: Sayısal, Sözel, Eşit Ağırlık" placeholderTextColor="#BDBDBD" />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeEditModal}>
                <Text style={styles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSaveProfile} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </View>
  );
};

const InfoTile = ({ label, value, isLast, isFull }) => (
  <View style={[styles.infoTile, { marginRight: isLast ? 0 : 10, flex: isFull ? 1 : 1 }]}>
    <Text style={styles.tileLabel}>{label}</Text>
    <Text style={styles.tileValue} numberOfLines={1}>{value}</Text>
  </View>
);

const MenuRow = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress}>
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
  resultDetails: { padding: 15, backgroundColor: '#F0F7FF', borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#D0E5FF' },
  resultHeader: { fontSize: 14, fontWeight: 'bold', color: '#4A90E2', textAlign: 'center', marginBottom: 12 },
  noResultText: { fontSize: 13, color: '#8E8E93', textAlign: 'center', fontStyle: 'italic', marginVertical: 10 },
  cityCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8 },
  cityMedal: { fontSize: 24, marginRight: 12 },
  cityCardText: { flex: 1 },
  cityRankLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 2 },
  cityName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  reSolveBtn: { backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4A90E2', marginTop: 10 },
  reSolveText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 14 },
  reSolveBtnCareer: { borderColor: '#27AE60' },
  reSolveTextCareer: { color: '#27AE60' },
  footer: { marginTop: 40, alignItems: 'center' },
  versionText: { fontSize: 12, color: '#D1D1D6', marginBottom: 15 },
  logoutBtn: { backgroundColor: '#FFF5F5', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20 },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingBottom: 34, paddingTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20 },
  modalDrag: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', marginBottom: 18 },
  modalHeader: { marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  modalSub: { fontSize: 12, color: '#BDBDBD', textAlign: 'center', marginTop: 4 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#9E9E9E', marginBottom: 6, marginTop: 12, letterSpacing: 0.5 },
  inputField: { backgroundColor: '#F8FBFF', borderWidth: 1.5, borderColor: '#E8EFF8', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#333' },
  modalBtnRow: { flexDirection: 'row', marginTop: 24, gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, backgroundColor: '#F5F5F5', alignItems: 'center' },
  cancelBtnText: { color: '#8E8E93', fontWeight: '600', fontSize: 15 },
  saveBtn: { flex: 2, paddingVertical: 15, borderRadius: 16, backgroundColor: '#4A90E2', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});

const modalStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FBFF' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 16, color: '#555', fontWeight: 'bold' },
  topTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 30 },
  testScroll: { padding: 20, paddingBottom: 60 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressText: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  categoryBadge: { fontSize: 12, color: '#4A90E2', fontWeight: '700', backgroundColor: '#EEF4FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  progressBarBg: { height: 5, backgroundColor: '#E8EFF8', borderRadius: 3, marginBottom: 24 },
  progressBarFill: { height: 5, backgroundColor: '#4A90E2', borderRadius: 3 },
  questionCard: { backgroundColor: '#FFF', padding: 22, borderRadius: 20, marginBottom: 20, shadowColor: '#4A90E2', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#EEF4FF' },
  questionText: { fontSize: 17, fontWeight: 'bold', color: '#1A1A2E', lineHeight: 25, textAlign: 'center' },
  hintText: { fontSize: 13, color: '#8E8E93', textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  optionsContainer: { gap: 10 },
  optionBtn: { backgroundColor: '#FFF', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E8EFF8' },
  optionBtnSelected: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  optionText: { color: '#495057', fontSize: 15, fontWeight: '600' },
  optionTextSelected: { color: '#FFF' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, alignItems: 'center', minHeight: 50 },
  backBtn: { padding: 10 },
  backBtnText: { color: '#8E8E93', fontSize: 14, fontWeight: '600' },
  submitBtn: { backgroundColor: '#28A745', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, marginLeft: 'auto' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  resultScroll: { padding: 25, paddingBottom: 60 },
  resultHeader: { alignItems: 'center', marginBottom: 28 },
  resultEmoji: { fontSize: 56, marginBottom: 12 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 6 },
  resultSub: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
  resultCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1.5, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12 },
  resultMedal: { fontSize: 28, marginRight: 14 },
  resultRank: { fontSize: 11, fontWeight: 'bold', color: '#8E8E93', letterSpacing: 0.5, marginBottom: 3 },
  resultMeslek: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E' },
  doneBtn: { backgroundColor: '#4A90E2', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  doneBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  retryBtn: { backgroundColor: '#F0F4FF', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#4A90E2' },
  retryBtnText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 15 },
});

export default ProfileScreen;