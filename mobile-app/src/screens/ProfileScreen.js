import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, Modal, TextInput,
  KeyboardAvoidingView, Platform, Animated, Alert, SafeAreaView, Switch, Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [showResult, setShowResult] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [personalityModalVisible, setPersonalityModalVisible] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);

  // Avatar fotoğrafını AsyncStorage'dan yükleme
  useEffect(() => {
    AsyncStorage.getItem('user_avatar').then((uri) => {
      if (uri) setAvatarUri(uri);
    });
  }, []);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişim izni verilmedi.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await AsyncStorage.setItem('user_avatar', uri);
    }
  };

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── HERO HEADER ── */}
        <View style={[styles.heroCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#EEF3FB' }]}>
          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickAvatar} activeOpacity={0.85}>
            <View style={[styles.avatarRing, { borderColor: isDarkMode ? '#4A90E2' : '#C8DEFF' }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>{(fullName || user?.email || 'U')[0].toUpperCase()}</Text>
                </View>
              )}
            </View>
            {/* Kamera ikonu */}
            <View style={[styles.cameraIcon, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9', borderColor: isDarkMode ? '#475569' : '#E2E8F0' }]}>
              <Ionicons name="camera-outline" size={12} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </View>
          </TouchableOpacity>

          {/* İsim & Email */}
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {fullName || 'Kullanıcı'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {authData?.email || user?.email || ''}
          </Text>

          {/* Badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EEF4FF' }]}>
              <Text style={styles.badgeText}>✦ OwnWay Üyesi</Text>
            </View>
            {authData?.personality_type ? (
              <View style={[styles.badge, { backgroundColor: isDarkMode ? '#1E3B2F' : '#F0FFF8', marginLeft: 8 }]}>
                <Text style={[styles.badgeText, { color: isDarkMode ? '#6EE7B7' : '#059669' }]}>
                  {authData.personality_type}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Bilgi Satırları */}
          <View style={[styles.infoStrip, { borderTopColor: isDarkMode ? '#334155' : '#F0F4FB' }]}>
            <View style={styles.infoStripItem}>
              <Text style={styles.infoStripLabel}>KONUM</Text>
              <Text style={[styles.infoStripValue, { color: colors.text }]} numberOfLines={1}>
                {user?.current_location || '—'}
              </Text>
            </View>
            <View style={[styles.infoStripDivider, { backgroundColor: isDarkMode ? '#334155' : '#E8EFF8' }]} />
            <View style={styles.infoStripItem}>
              <Text style={styles.infoStripLabel}>OKUL</Text>
              <Text style={[styles.infoStripValue, { color: colors.text }]} numberOfLines={1}>
                {user?.high_school || '—'}
              </Text>
            </View>
            <View style={[styles.infoStripDivider, { backgroundColor: isDarkMode ? '#334155' : '#E8EFF8' }]} />
            <View style={styles.infoStripItem}>
              <Text style={styles.infoStripLabel}>BÖLÜM</Text>
              <Text style={[styles.infoStripValue, { color: colors.text }]} numberOfLines={1}>
                {user?.dept_type || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── KİŞİLİK TİPİ KARTI ── */}
        {(() => {
          const RIASEC_MAP = {
            R: { label: 'Gerçekçi', desc: 'El becerisi yüksek, pratik ve sistemli' },
            I: { label: 'Araştırmacı', desc: 'Analitik, meraklı ve problem çözücü' },
            A: { label: 'Sanatsal', desc: 'Yaratıcı, sezgisel ve özgün' },
            S: { label: 'Sosyal', desc: 'Empatik, yardımsever ve iletişimçi' },
            E: { label: 'Girişimci', desc: 'Lider ruhlu, ikna edici ve enerjik' },
            C: { label: 'Geleneksel', desc: 'Detaylı, organize ve güvenilir' },
          };
          const pType = authData?.personality_type;
          const info = pType ? RIASEC_MAP[pType] : null;
          return (
            <View style={[styles.personalityCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#EEF3FB' }]}>
              <View style={styles.personalityLeft}>
                <Ionicons name="person-outline" size={16} color={isDarkMode ? '#94A3B8' : '#334155'} style={{ marginRight: 12 }} />
                <View>
                  <Text style={[styles.personalityLabel, { color: isDarkMode ? '#64748B' : '#94A3B8' }]}>KİŞİLİK TİPİ</Text>
                  <Text style={[styles.personalityValue, { color: colors.text }]}>{info?.label || '—'}</Text>
                  {info?.desc && (
                    <Text style={[styles.personalityDesc, { color: isDarkMode ? '#475569' : '#94A3B8' }]}>{info.desc}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })()}

        {/* ── MESLEK ANALİZ TESTİ ── */}
        <TouchableOpacity
          style={[styles.testSolveBtn, {
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            borderColor: isDarkMode ? '#334155' : '#EEF3FB',
          }]}
          activeOpacity={0.7}
          onPress={() => setPersonalityModalVisible(true)}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="compass-outline" size={18} color={isDarkMode ? '#94A3B8' : '#334155'} style={styles.menuIcon} />
            <Text style={[styles.testSolveTitle, { color: colors.text }]}>Meslek Analiz Testi</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* ── AYARLAR KARTI ── */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#64748B' : '#BDBDBD' }]}>TERCİHLER</Text>
        <View style={[styles.menuList, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#EEF3FB' }]}>

          {/* Test Sonucum */}
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowResult(!showResult)}>
            <View style={styles.menuLeft}>
              <Ionicons name="bar-chart-outline" size={18} color={isDarkMode ? '#94A3B8' : '#334155'} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Test Sonucum</Text>
            </View>
            <Text style={[styles.arrowIcon, { transform: [{ rotate: showResult ? '90deg' : '0deg' }] }]}>›</Text>
          </TouchableOpacity>

          {showResult && (
            <View style={[styles.resultDetails, { backgroundColor: isDarkMode ? '#0F172A' : '#F4F8FF', borderColor: isDarkMode ? '#334155' : '#D0E5FF' }]}>
              {loading ? (
                <ActivityIndicator color="#4A90E2" style={{ marginVertical: 10 }} />
              ) : (() => {
                const cities = authData?.matched_cities;
                const careers = authData?.career_suggestions;
                const hasCities = cities && cities.length > 0;
                const hasCareers = careers && careers.length > 0;
                return (
                  <View>
                    {hasCities && (
                      <View>
                        <Text style={[styles.resultHeader, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Şehir Önerileri</Text>
                        {cities.slice(0, 3).map((item, index) => {
                          const cityName = item?.city?.city_name || item?.city_name || '?';
                          return (
                            <View key={index} style={[styles.resultRow, { borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                              <Text style={[styles.resultIndex, { color: isDarkMode ? '#475569' : '#CBD5E1' }]}>{index + 1}</Text>
                              <Text style={[styles.resultName, { color: colors.text }]}>{cityName}</Text>
                            </View>
                          );
                        })}
                        <TouchableOpacity style={[styles.reSolveBtn, { borderColor: isDarkMode ? '#334155' : '#E2E8F0' }]} onPress={onResetTest}>
                          <View style={styles.menuLeft}>
                            <Ionicons name="refresh-outline" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} style={{ marginRight: 6 }} />
                            <Text style={[styles.reSolveText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Şehir Testini Tekrar Çöz</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                    {hasCareers && (
                      <View style={{ marginTop: hasCities ? 20 : 0 }}>
                        <Text style={[styles.resultHeader, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Meslek Önerileri</Text>
                        {careers.slice(0, 3).map((item, index) => {
                          const meslekAdi = item?.occupation_name || '?';
                          return (
                            <View key={index} style={[styles.resultRow, { borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                              <Text style={[styles.resultIndex, { color: isDarkMode ? '#475569' : '#CBD5E1' }]}>{index + 1}</Text>
                              <Text style={[styles.resultName, { color: colors.text }]}>{meslekAdi}</Text>
                            </View>
                          );
                        })}
                        <TouchableOpacity style={[styles.reSolveBtn, { borderColor: isDarkMode ? '#334155' : '#E2E8F0' }]} onPress={() => setPersonalityModalVisible(true)}>
                          <View style={styles.menuLeft}>
                            <Ionicons name="refresh-outline" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} style={{ marginRight: 6 }} />
                            <Text style={[styles.reSolveText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Meslek Testini Tekrar Çöz</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                    {!hasCities && !hasCareers && (
                      <View style={{ gap: 10 }}>
                        <TouchableOpacity style={[styles.reSolveBtn, { borderColor: isDarkMode ? '#334155' : '#E2E8F0' }]} onPress={onResetTest}>
                          <View style={styles.menuLeft}>
                            <Ionicons name="map-outline" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} style={{ marginRight: 6 }} />
                            <Text style={[styles.reSolveText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Şehir Testini Başlat</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.reSolveBtn, { borderColor: isDarkMode ? '#334155' : '#E2E8F0' }]} onPress={() => setPersonalityModalVisible(true)}>
                          <View style={styles.menuLeft}>
                            <Ionicons name="compass-outline" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} style={{ marginRight: 6 }} />
                            <Text style={[styles.reSolveText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Meslek Testini Başlat</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })()}
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: isDarkMode ? '#1E293B' : '#F4F6FA', marginLeft: 0 }]} />
          <MenuRow label="Bilgilerimi Güncelle" onPress={openEditModal} colors={colors} isDarkMode={isDarkMode} />

          <View style={[styles.divider, { backgroundColor: isDarkMode ? '#1E293B' : '#F4F6FA', marginLeft: 0 }]} />
          <View style={[styles.menuRow, { paddingVertical: 12 }]}>
            <View style={styles.menuLeft}>
              <Ionicons name="moon-outline" size={18} color={isDarkMode ? '#94A3B8' : '#334155'} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Karanlık Mod</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E2E8F0', true: '#4A90E2' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Uygulama Versiyonu 1.0.1</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* KİŞİLİK TESTİ MODALİ */}
      <PersonalityTestModal
        visible={personalityModalVisible}
        onClose={() => setPersonalityModalVisible(false)}
        onComplete={() => setRefreshKey((k) => k + 1)}
        user={user}
      />

      {/* PROFİL DÜZENLEME MODALİ */}
      <Modal visible={editModalVisible} transparent animationType="none" onRequestClose={closeEditModal}>
        <View style={{ flex: 1 }}>
          {/* Arka plan overlay - tam ekran */}
          <TouchableOpacity
            style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
            activeOpacity={1}
            onPress={closeEditModal}
          />
          {/* Klavye ile birlikte yukarı kalkan alan */}
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalDrag} />
                <Text style={styles.modalTitle}>✏️ Profil Bilgilerini Düzenle</Text>
                <Text style={styles.modalSub}>Bilgilerini güncelleyerek profilini kişiselleştir</Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                <Text style={styles.inputLabel}>Ad</Text>
                <TextInput style={styles.inputField} value={editForm.first_name} onChangeText={(v) => setEditForm((f) => ({ ...f, first_name: v }))} placeholder="Adın" placeholderTextColor="#BDBDBD" returnKeyType="next" />
                <Text style={styles.inputLabel}>Soyad</Text>
                <TextInput style={styles.inputField} value={editForm.last_name} onChangeText={(v) => setEditForm((f) => ({ ...f, last_name: v }))} placeholder="Soyadın" placeholderTextColor="#BDBDBD" returnKeyType="next" />
                <Text style={styles.inputLabel}>Konum (Şehir)</Text>
                <TextInput style={styles.inputField} value={editForm.current_location} onChangeText={(v) => setEditForm((f) => ({ ...f, current_location: v }))} placeholder="Yaşadığın şehir" placeholderTextColor="#BDBDBD" returnKeyType="next" />
                <Text style={styles.inputLabel}>Okul</Text>
                <TextInput style={styles.inputField} value={editForm.high_school} onChangeText={(v) => setEditForm((f) => ({ ...f, high_school: v }))} placeholder="Okul adın" placeholderTextColor="#BDBDBD" returnKeyType="next" />
                <Text style={styles.inputLabel}>Bölüm</Text>
                <TextInput style={styles.inputField} value={editForm.dept_type} onChangeText={(v) => setEditForm((f) => ({ ...f, dept_type: v }))} placeholder="Ör: Sayısal, Sözel, Eşit Ağırlık" placeholderTextColor="#BDBDBD" returnKeyType="done" />
              </ScrollView>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeEditModal}>
                  <Text style={styles.cancelBtnText}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSaveProfile} disabled={saving}>
                  {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const MenuRow = ({ label, onPress, colors, isDarkMode }) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuLeft}>
      <Ionicons name="pencil-outline" size={18} color={isDarkMode ? '#94A3B8' : '#334155'} style={styles.menuIcon} />
      <Text style={[styles.menuLabel, { color: colors?.text || '#1E293B' }]}>{label}</Text>
    </View>
    <Text style={styles.arrowIcon}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // ── Genel ──
  container: { flex: 1, backgroundColor: '#F8FBFF' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },

  // ── Hero Kart ──
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#EEF3FB',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 0,
    marginBottom: 18,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
    overflow: 'hidden',
  },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatarRing: {
    width: 86, height: 86, borderRadius: 43,
    borderWidth: 2.5, borderColor: '#C8DEFF',
    justifyContent: 'center', alignItems: 'center',
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#4A90E2',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarImage: {
    width: 76, height: 76, borderRadius: 38,
  },
  avatarLetter: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#1E293B', letterSpacing: -0.4, marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 14 },
  badgeRow: { flexDirection: 'row', marginBottom: 20 },
  badge: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, color: '#4A90E2', fontWeight: '700', letterSpacing: 0.3 },

  // Bilgi Şeridi
  infoStrip: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: '#F0F4FB',
    width: '100%',
  },
  infoStripItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 6 },
  infoStripValue: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginTop: 4, textAlign: 'center' },
  infoStripLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  infoStripDivider: { width: 1, backgroundColor: '#E8EFF8', marginVertical: 14 },

  // ── Kişilik Tipi Kartı ──
  personalityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEF3FB',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  personalityLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  personalityLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  personalityValue: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  personalityDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },

  // ── Meslek Testi Butonu ──
  testSolveBtn: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEF3FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  testSolveTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },

  // ── Ayarlar Listesi ──
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#BDBDBD', marginBottom: 12, letterSpacing: 1.2, marginLeft: 4 },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    borderWidth: 1, borderColor: '#EEF3FB',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
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
  modalOverlay: { backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingBottom: 34, paddingTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20 },
  modalDrag: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', marginBottom: 18 },
  modalHeader: { marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  modalSub: { fontSize: 12, color: '#BDBDBD', textAlign: 'center', marginTop: 4 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#9E9E9E', marginBottom: 6, marginTop: 12, letterSpacing: 0.5 },
  inputField: { backgroundColor: '#F8FBFF', borderWidth: 1.5, borderColor: '#E8EFF8', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#333' },
  modalBtnRow: { flexDirection: 'row', marginTop: 24, gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelBtnText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
  saveBtn: { flex: 2, paddingVertical: 16, borderRadius: 18, backgroundColor: '#4A90E2', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
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