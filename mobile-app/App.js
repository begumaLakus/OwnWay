import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView as RNScrollView, Alert } from 'react-native';
import api from './src/screens/api';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Sayfa Importları
import LoginScreen from './src/screens/LoginScreen'; 
import RegisterScreen from './src/screens/RegisterScreen'; 
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import JobScreen from './src/screens/JobScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';
import PersonalityTestScreen from './src/screens/PersonalityTestScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [appState, setAppState] = useState('login');

  // Form (analiz) state
  const [currentQ, setCurrentQ] = useState(0);
  const [userScores, setUserScores] = useState({ culture: 0, modern: 0, social: 0, nature: 0 });



  // 1. GİRİŞ EKRANI
  if (appState === 'login') {
    return (
      <LoginScreen 
        onLogin={(data) => {
          setUser(data);
          if (data?.role === 'ADMIN' || data?.email === 'admin@gmail.com') {
            setAppState('admin');
          } else {
            setAppState('main');
          }
        }}
        onGoToRegister={() => setAppState('register')} 
      />
    );
  }

  // ADMİN EKRANI
  if (appState === 'admin') {
    return <AdminScreen user={user} navigation={null} onLogout={() => { setUser(null); setAppState('login'); }} />;
  }



  // 2. KAYIT EKRANI
  if (appState === 'register') {
    return (
      // RegisterScreen bloğu
<RegisterScreen 
  onRegister={(data) => { 
    setUser(data); 
    setCurrentQ(0); // Kayıt olunca testi 1. sorudan başlatır
    setAppState('form'); 
  }} 
  onBackToLogin={() => setAppState('login')} 
/>
    );
  }

// 3. ANALİZ FORMU EKRANI (12 Soru — 3 soru/kategori)
  if (appState === 'form') {
    const questions = [
      { q: "Hafta sonu sabahı ilk planın ne olur?", options: [{ text: "Tarihi bir bölgeyi veya müzeyi gezmek.", cat: "culture" }, { text: "Şehrin en popüler AVM'sini görmek.", cat: "modern" }, { text: "Kalabalık bir kafede arkadaşlarla buluşmak.", cat: "social" }, { text: "Ormanda sessiz bir yürüyüş yapmak.", cat: "nature" }] },
      { q: "Bir şehirde seni en çok ne etkiler?", options: [{ text: "Binaların hikayesi ve mimari dokusu.", cat: "culture" }, { text: "Gökdelenler ve teknolojik imkanlar.", cat: "modern" }, { text: "Sokak sanatçıları ve festivaller.", cat: "social" }, { text: "Deniz veya dağ manzarası.", cat: "nature" }] },
      { q: "Acıktığında tercihin hangisi olur?", options: [{ text: "O yörenin en meşhur, geleneksel yemeği.", cat: "culture" }, { text: "Gastronomi dünyasından modern bir deneyim.", cat: "modern" }, { text: "Canlı müzik olan bir mekan.", cat: "social" }, { text: "Manzaraya karşı sakin bir piknik.", cat: "nature" }] },
      { q: "Konaklayacağın yer nasıl olmalı?", options: [{ text: "Restore edilmiş tarihi bir butik otel.", cat: "culture" }, { text: "Akıllı ev sistemli lüks bir rezidans.", cat: "modern" }, { text: "Şehir merkezinde her yere yakın bir hostel.", cat: "social" }, { text: "Doğa içinde bir bungalov veya kamp alanı.", cat: "nature" }] },
      { q: "Fotoğraf galerinde en çok hangisi olsun istersin?", options: [{ text: "Antik kent kalıntıları veya sergi kareleri.", cat: "culture" }, { text: "Işıltılı şehir silüeti ve modern mimari.", cat: "modern" }, { text: "Konserlerden ve partilerden anlar.", cat: "social" }, { text: "Gün batımı ve doğal su kaynakları.", cat: "nature" }] },
      { q: "Bir akşam dışarı çıkacak olsan tercihin ne olurdu?", options: [{ text: "Opera, tiyatro veya klasik müzik.", cat: "culture" }, { text: "Işıltılı bir rooftop bar.", cat: "modern" }, { text: "Sokak lezzetleri ve yerel halkla sohbet.", cat: "social" }, { text: "Yıldızların altında sahil yürüyüşü.", cat: "nature" }] },
      { q: "Hangi ulaşım aracını kullanmak seni daha mutlu eder?", options: [{ text: "Nostaljik tramvay veya tarihi bir vapur.", cat: "culture" }, { text: "Hızlı tren veya elektrikli bir scooter.", cat: "modern" }, { text: "Paylaşımlı bir bisiklet turu.", cat: "social" }, { text: "Tekne turu veya orman içi bisiklet yolu.", cat: "nature" }] },
      { q: "Hayalindeki hediye hangisi olurdu?", options: [{ text: "Nadir bulunan eski bir kitap.", cat: "culture" }, { text: "En son çıkan teknolojik bir alet.", cat: "modern" }, { text: "Büyük bir festival veya konser bileti.", cat: "social" }, { text: "Botanik bahçesi turu veya çiçekler.", cat: "nature" }] },
      { q: "Tatilde tercih edeceğin aktivite hangisi?", options: [{ text: "Müze, galeri veya tarihi mekân turu.", cat: "culture" }, { text: "Teknoloji fuarı veya yenilikçi bir etkinlik.", cat: "modern" }, { text: "Yerel halkla festival veya geleneksel şenlik.", cat: "social" }, { text: "Kamp, trekking veya mağara keşfi.", cat: "nature" }] },
      { q: "Üniversite kampüsü nasıl olsun istersin?", options: [{ text: "Tarihi ve mimari açıdan görkemli binalar.", cat: "culture" }, { text: "Akıllı teknoloji donanımlı, çağdaş bir kampüs.", cat: "modern" }, { text: "Kulüp ve etkinliklerle dolu canlı bir ortam.", cat: "social" }, { text: "Ormanlık alan veya deniz kenarında doğayla iç içe.", cat: "nature" }] },
      { q: "Serbest zamanında hangi içerikle vakit geçirirsin?", options: [{ text: "Tarihi belgeseller veya klasik edebiyat.", cat: "culture" }, { text: "Teknoloji haberleri veya startup podcast'leri.", cat: "modern" }, { text: "Arkadaşlarla sosyal medya veya canlı yayınlar.", cat: "social" }, { text: "Vahşi yaşam belgeselleri veya açık hava vlogu.", cat: "nature" }] },
      { q: "Gelecekte yaşamak istediğin ortam nasıl olsun?", options: [{ text: "Sanat galerileri ve müzelerle dolu tarihi bir semt.", cat: "culture" }, { text: "Gökdelenlerin hâkim olduğu modern bir iş bölgesi.", cat: "modern" }, { text: "Her gece bir etkinlik olan dinamik, canlı bir mahalle.", cat: "social" }, { text: "Şehir gürültüsünden uzak, yeşil ve sakin bir alan.", cat: "nature" }] }
    ];

    const handleAnswer = async (cat) => {
  // 1. Lokal puanı güncelle
  const newScores = { ...userScores, [cat]: (userScores[cat] || 0) + 1 };
  setUserScores(newScores);

  if (currentQ < questions.length - 1) {
    // Sonraki soruya geç
    setCurrentQ(prev => prev + 1);
  } else {
    // Son soru: Puanları backend'e gönder ve sonuç sayfasına git
    // 8 soru, her kategoride 2 soru var → max puan = 2, 0-100 arasına normalize et
    const total = questions.length; // 8 soru → her kategori max total puan alabilir
    const payload = {
      culture_w: Math.round(((newScores.culture || 0) / total) * 100),
      modern_w:  Math.round(((newScores.modern  || 0) / total) * 100),
      social_w:  Math.round(((newScores.social  || 0) / total) * 100),
      nature_w:  Math.round(((newScores.nature  || 0) / total) * 100),
    };

    try {
      // POST /api/user/test-scores
      await api.post('/user/test-scores', payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
    } catch (e) {
      // Göndermede hata olsa bile kullanıcıyı result'a yönlendir,
      // hata recommendation sayfasında zaten yakalanacak.
      console.warn('Test skorları gönderilemedi:', e?.response?.data || e.message);
    }

    setCurrentQ(0);
    setUserScores({ culture: 0, modern: 0, social: 0, nature: 0 });
    setAppState('result');
  }
};

    const handleExitTest = () => {
      Alert.alert(
        'Testi Durdur',
        'Testi yarıda bırakmak istediğine emin misin? İlerleme kaydedilmeyecek.',
        [
          { text: 'Devam Et', style: 'cancel' },
          {
            text: 'Çık',
            style: 'destructive',
            onPress: () => {
              setCurrentQ(0);
              setUserScores({ culture: 0, modern: 0, social: 0, nature: 0 });
              // Kullanıcı zaten giriş yapmış, ana sayfaya dön
              setAppState(user ? 'main' : 'login');
            },
          },
        ]
      );
    };

    return (
      <View style={styles.formContainer}>
      {/* ÜST BAR: Geri Butonu, Progress Bar ve Çıkış Butonu */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: 20 }}>
        
        {/* İlk soruda değilsek Geri butonu görünsün */}
        {currentQ > 0 ? (
          <TouchableOpacity 
            onPress={() => setCurrentQ(prev => prev - 1)} 
            style={{ marginRight: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#AEC6CF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 39 }} />
        )}

        {/* İlerleme Çubuğu */}
        <View style={[styles.progressContainer, { flex: 1, marginBottom: 0 }]}>
          <View style={[styles.progressBar, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
        </View>

        {/* Testi Durdur (✕) Butonu */}
        <TouchableOpacity
          onPress={handleExitTest}
          style={{ marginLeft: 15, width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="close" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.formQuestion}>{questions[currentQ].q}</Text>
      
      {questions[currentQ].options.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.newOptionBtn} 
          onPress={() => handleAnswer(item.cat)}
        >
          <Text style={styles.newOptionText}>{item.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

  // 4. ANALİZ SONUÇ SAYFASI
  if (appState === 'result') {
    return <ResultScreen
      user={user}
      onFinish={() => setAppState('main')}
      onRetry={() => { setCurrentQ(0); setUserScores({ culture: 0, modern: 0, social: 0, nature: 0 }); setAppState('form'); }}
    />;
  }

  // 5. ANA UYGULAMA (Giriş tamamlandıktan sonra)
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Meslekler" component={JobScreen} />
      <Tab.Screen name="Harita" component={MapScreen} />
      <Tab.Screen name="Profil">
  {() => (
    <ProfileScreen 
      user={user} 
      scores={userScores} 
      onLogout={() => {
        setAppState('login');
        setCurrentQ(0);
      }} 
      onResetTest={() => {
        setCurrentQ(0);
        setAppState('form');
      }}
      onUserUpdate={(updatedFields) => {
        setUser((prev) => ({ ...prev, ...updatedFields }));
      }}
    />
  )}
</Tab.Screen>
      <Tab.Screen
        name="PersonalityTest"
        component={PersonalityTestScreen}
        options={{
          tabBarButton: () => null,
          headerShown: true,
          title: 'Meslek Analiz Testi',
        }}
      />
    </Tab.Navigator>
  );
}

// ─── RESULT SCREEN BİLEŞENİ ─────────────────────────────────────────────────
function ResultScreen({ user, onFinish, onRetry }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/recommendation/me', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        // API { success, count, data: [...] } döndürüyor
        // Bölüm listesini şehir bazında tekilleştir, en yüksek skoru al
        const rawList = response?.data?.data || [];
        const cityMap = new Map();
        rawList.forEach((item) => {
          if (!cityMap.has(item.city_name) || item.match_score > cityMap.get(item.city_name).match_score) {
            cityMap.set(item.city_name, item);
          }
        });
        // İlk 3 benzersiz şehri al (en yüksek skordan itibaren)
        const uniqueCities = Array.from(cityMap.values())
          .sort((a, b) => b.match_score - a.match_score)
          .slice(0, 3);
        setCities(uniqueCities);
      } catch (e) {
        const msg = e?.response?.data?.message || 'Öneriler yüklenemedi. Lütfen tekrar deneyin.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  return (
    <RNScrollView style={resultStyles.container} contentContainerStyle={resultStyles.content}>
      {/* Başlık */}
      <View style={resultStyles.header}>
        <View style={resultStyles.circle}>
          <Text style={{ fontSize: 48 }}>✨</Text>
        </View>
        <Text style={resultStyles.mainTitle}>Analiz Tamamlandı!</Text>
        <Text style={resultStyles.subTitle}>
          Karakterine göre sana en uygun 3 şehir aşağıda sıralanıyor.
        </Text>
      </View>

      {/* İçerik */}
      {loading ? (
        <View style={resultStyles.centerBox}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={resultStyles.loadingText}>Şehirler hesaplanıyor...</Text>
        </View>
      ) : error ? (
        <View style={resultStyles.centerBox}>
          <Text style={resultStyles.errorText}>{error}</Text>
          <TouchableOpacity style={resultStyles.retryBtn} onPress={onRetry}>
            <Text style={resultStyles.retryBtnText}>Testi Tekrar Çöz</Text>
          </TouchableOpacity>
        </View>
      ) : cities.length === 0 ? (
        <View style={resultStyles.centerBox}>
          <Text style={resultStyles.errorText}>Henüz bir öneri bulunamadı.</Text>
          <TouchableOpacity style={resultStyles.retryBtn} onPress={onRetry}>
            <Text style={resultStyles.retryBtnText}>Testi Tekrar Çöz</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {cities.map((item, index) => (
            <View key={item.city_name + index} style={resultStyles.cityCard}>
              {/* Sıra rozeti */}
              <View style={resultStyles.rankBadge}>
                <Text style={resultStyles.rankText}>#{index + 1}</Text>
              </View>
              <View style={resultStyles.cardBody}>
                <Text style={resultStyles.cityName}>{item.city_name}</Text>
                {/* Uyum çubuğu */}
                <View style={resultStyles.scoreRow}>
                  <View style={resultStyles.scoreBarBg}>
                    <View style={[resultStyles.scoreBarFill, { width: `${Math.min(Math.max(item.match_score, 0), 100)}%` }]} />
                  </View>
                  <Text style={resultStyles.scoreLabel}>%{Math.round(Math.min(item.match_score, 100))} uyum</Text>
                </View>
                {/* Açıklamalar */}
                {item.explanations?.length > 0 && (
                  <Text style={resultStyles.explanation}>{item.explanations[0]}</Text>
                )}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Alt butonlar */}
      <View style={resultStyles.footer}>
        <TouchableOpacity style={resultStyles.retryBtn} onPress={onRetry}>
          <Text style={resultStyles.retryBtnText}>Testi Tekrar Çöz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={resultStyles.finishBtn} onPress={onFinish}>
          <Text style={resultStyles.finishBtnText}>Ana Sayfaya Git</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </RNScrollView>
  );
}

const resultStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBFF' },
  content: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 30 },
  header: { alignItems: 'center', marginBottom: 30 },
  circle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F0FE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 8 },
  subTitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  centerBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 16, color: '#8E8E93', fontSize: 14 },
  errorText: { color: '#FF3B30', fontSize: 15, textAlign: 'center', marginBottom: 20 },
  cityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#4A90E2',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF4FF',
  },
  rankBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', marginRight: 14, marginTop: 2 },
  rankText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardBody: { flex: 1 },
  cityName: { fontSize: 17, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 2 },
  uniName: { fontSize: 13, color: '#4A90E2', fontWeight: '600', marginBottom: 2 },
  deptName: { fontSize: 12, color: '#8E8E93', marginBottom: 10 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scoreBarBg: { flex: 1, height: 6, backgroundColor: '#EEF4FF', borderRadius: 3, marginRight: 8 },
  scoreBarFill: { height: 6, backgroundColor: '#4A90E2', borderRadius: 3 },
  scoreLabel: { fontSize: 12, color: '#4A90E2', fontWeight: 'bold', minWidth: 60, textAlign: 'right' },
  explanation: { fontSize: 12, color: '#8E8E93', fontStyle: 'italic', lineHeight: 16 },
  footer: { marginTop: 10, gap: 12 },
  retryBtn: { backgroundColor: '#F0F4FF', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#4A90E2' },
  retryBtnText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 15 },
  finishBtn: { backgroundColor: '#4A90E2', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  finishBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

const styles = StyleSheet.create({

  // Analiz Formu Stilleri
  formContainer: { flex: 1, backgroundColor: '#FFF', justifyContent: 'center', padding: 30 },
  progressContainer: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, marginBottom: 40 },
  progressBar: { height: 4, backgroundColor: '#AEC6CF', borderRadius: 2 },
  formQuestion: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 30, lineHeight: 30 },
  newOptionBtn: { 
    backgroundColor: '#FAFAFA', 
    padding: 18, 
    borderRadius: 15, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#F0F0F0' 
  },
  newOptionText: { color: '#555', fontSize: 15, fontWeight: '500' },


});

// ─── CUSTOM TAB BAR ───────────────────────────────────────────────────────────
const TAB_CONFIG = [
  { name: 'Ana Sayfa', icon: 'home', iconActive: 'home', label: 'Ana Sayfa' },
  { name: 'Meslekler', icon: 'briefcase-outline', iconActive: 'briefcase', label: 'Meslekler' },
  { name: 'Harita', icon: 'map-outline', iconActive: 'map', label: 'Harita' },
  { name: 'Profil', icon: 'person-outline', iconActive: 'person', label: 'Profil' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const VISIBLE_TABS = ['Ana Sayfa', 'Meslekler', 'Harita', 'Profil'];
  const visibleRoutes = state.routes.filter((route) => VISIBLE_TABS.includes(route.name));

  return (
    <View style={tabBarStyles.wrapper}>
      <View style={tabBarStyles.container}>
        {visibleRoutes.map((route) => {
          const isFocused = state.index === state.routes.indexOf(route);
          const cfg = TAB_CONFIG.find((t) => t.name === route.name) || TAB_CONFIG[0];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={tabBarStyles.tab}
            >
              {isFocused && <View style={tabBarStyles.activePill} />}
              <Ionicons
                name={isFocused ? cfg.iconActive : cfg.icon}
                size={22}
                color={isFocused ? '#4A90E2' : '#BDBDBD'}
                style={{ zIndex: 1 }}
              />
              <Text style={[tabBarStyles.label, isFocused && tabBarStyles.labelActive]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#F0F4FF',
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 24,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0, left: 6, right: 6, bottom: 0,
    backgroundColor: '#EEF4FF',
    borderRadius: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#BDBDBD',
    marginTop: 3,
    zIndex: 1,
  },
  labelActive: {
    color: '#4A90E2',
    fontWeight: '700',
  },
});