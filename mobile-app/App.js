import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Sayfa Importları
import LoginScreen from './src/screens/LoginScreen'; 
import RegisterScreen from './src/screens/RegisterScreen'; 
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import JobScreen from './src/screens/JobScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null); 
  const [appState, setAppState] = useState('login'); 
  
  // Analiz için gerekli olan eksik state'ler:
  const [currentQ, setCurrentQ] = useState(0);
  const [userScores, setUserScores] = useState({ culture: 0, modern: 0, social: 0, nature: 0 });

  // 1. GİRİŞ EKRANI
  if (appState === 'login') {
    return (
      <LoginScreen 
        onLogin={(data) => { setUser(data); setAppState('main'); }} 
        onGoToRegister={() => setAppState('register')} 
      />
    );
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

// 3. ANALİZ FORMU EKRANI (Hata Giderilmiş & 8 Soru Tam Liste)
  if (appState === 'form') {
    const questions = [
      { q: "Hafta sonu sabahı ilk planın ne olur?", options: [{ text: "Tarihi bir bölgeyi veya müzeyi gezmek.", cat: "culture" }, { text: "Şehrin en popüler AVM'sini görmek.", cat: "modern" }, { text: "Kalabalık bir kafede arkadaşlarla buluşmak.", cat: "social" }, { text: "Ormanda sessiz bir yürüyüş yapmak.", cat: "nature" }] },
      { q: "Bir şehirde seni en çok ne etkiler?", options: [{ text: "Binaların hikayesi ve mimari dokusu.", cat: "culture" }, { text: "Gökdelenler ve teknolojik imkanlar.", cat: "modern" }, { text: "Sokak sanatçıları ve festivaller.", cat: "social" }, { text: "Deniz veya dağ manzarası.", cat: "nature" }] },
      { q: "Acıktığında tercihin hangisi olur?", options: [{ text: "O yörenin en meşhur, geleneksel yemeği.", cat: "culture" }, { text: "Gastronomi dünyasından modern bir deneyim.", cat: "modern" }, { text: "Canlı müzik olan bir mekan.", cat: "social" }, { text: "Manzaraya karşı sakin bir piknik.", cat: "nature" }] },
      { q: "Konaklayacağın yer nasıl olmalı?", options: [{ text: "Restore edilmiş tarihi bir butik otel.", cat: "culture" }, { text: "Akıllı ev sistemli lüks bir rezidans.", cat: "modern" }, { text: "Şehir merkezinde her yere yakın bir hostel.", cat: "social" }, { text: "Doğa içinde bir bungalov veya kamp alanı.", cat: "nature" }] },
      { q: "Fotoğraf galerinde en çok hangisi olsun istersin?", options: [{ text: "Antik kent kalıntıları veya sergi kareleri.", cat: "culture" }, { text: "Işıltılı şehir silüeti ve modern mimari.", cat: "modern" }, { text: "Konserlerden ve partilerden anlar.", cat: "social" }, { text: "Gün batımı ve doğal su kaynakları.", cat: "nature" }] },
      { q: "Bir akşam dışarı çıkacak olsan tercihin ne olurdu?", options: [{ text: "Opera, tiyatro veya klasik müzik.", cat: "culture" }, { text: "Işıltılı bir rooftop bar.", cat: "modern" }, { text: "Sokak lezzetleri ve yerel halkla sohbet.", cat: "social" }, { text: "Yıldızların altında sahil yürüyüşü.", cat: "nature" }] },
      { q: "Hangi ulaşım aracını kullanmak seni daha mutlu eder?", options: [{ text: "Nostaljik tramvay veya tarihi bir vapur.", cat: "culture" }, { text: "Hızlı tren veya elektrikli bir scooter.", cat: "modern" }, { text: "Paylaşımlı bir bisiklet turu.", cat: "social" }, { text: "Tekne turu veya orman içi bisiklet yolu.", cat: "nature" }] },
      { q: "Hayalindeki hediye hangisi olurdu?", options: [{ text: "Nadir bulunan eski bir kitap.", cat: "culture" }, { text: "En son çıkan teknolojik bir alet.", cat: "modern" }, { text: "Büyük bir festival veya konser bileti.", cat: "social" }, { text: "Botanik bahçesi turu veya çiçekler.", cat: "nature" }] }
    ];

    const handleAnswer = (cat) => {
  // Puanı güncelle
  setUserScores(prev => ({ ...prev, [cat]: (prev[cat] || 0) + 1 }));

  // Soru geçiş mantığı
  if (currentQ < 7) { // 8 soru olduğu için max index 7'dir
    setCurrentQ(prev => prev + 1);
  } else {
    // Son sorudaysa sonuç sayfasına git
    setAppState('result');
    // Buradaki setCurrentQ(0) işlemini result sayfasındaki butona da koyabilirsin
  }
};

    return (
      <View style={styles.formContainer}>
      {/* ÜST BAR: Geri Butonu ve Progress Bar */}
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
          <View style={{ width: 39 }} /> // Hizalamanın bozulmaması için boşluk
        )}

        {/* İlerleme Çubuğu (Flex: 1 ekledik ki boşluğu doldursun) */}
        <View style={[styles.progressContainer, { flex: 1, marginBottom: 0 }]}>
          <View style={[styles.progressBar, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
        </View>
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
    return (
      <View style={styles.resultContainer}>
        <View style={{ height: 60 }} />
        <View style={styles.resultHeader}>
          <View style={styles.resultCircle}>
            <Text style={{ fontSize: 50 }}>✨</Text>
          </View>
          <Text style={styles.resultMainTitle}>Analiz Tamamlandı!</Text>
          <Text style={styles.resultSubTitle}>
            Karakter puanların veritabanına işlendi. Şimdi sana en uygun şehirleri keşfedebilirsin.
          </Text>
        </View>

        <View style={styles.resultContent}>
          <View style={styles.emptyCardPlaceholder}>
            <Text style={styles.placeholderText}>Şehir önerileri yükleniyor...</Text>
          </View>
        </View>

        <View style={styles.resultFooter}>
          <TouchableOpacity style={styles.finishBtn} onPress={() => setAppState('main')}>
            <Text style={styles.finishBtnText}>Tamamlandı</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </View>
    );
  }

  // 5. ANA UYGULAMA (Giriş tamamlandıktan sonra)
  return (
    <Tab.Navigator screenOptions={{ headerShown: false 
      
    }}>
      
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
        setCurrentQ(0); // Çıkış yapınca soru sırasını sıfırla
      }} 
      onResetTest={() => {
        setCurrentQ(0);      // Soru sırasını 1. soruya çeker
        setAppState('form');   // Analiz formu sayfasına gönderir
      }}
    />
  )}
</Tab.Screen>
    </Tab.Navigator>
  );
}

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

  // Sonuç Sayfası Stilleri
  resultContainer: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 30 },
  resultHeader: { alignItems: 'center', marginTop: 30 },
  resultCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FADADD', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  resultMainTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  resultSubTitle: { fontSize: 14, color: '#AAA', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  
  resultContent: { flex: 1, justifyContent: 'center' },
  emptyCardPlaceholder: { 
    height: 180, 
    backgroundColor: '#F8FBFD', 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: '#E8F0FE', 
    borderStyle: 'dashed', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderText: { color: '#4A90E2', fontWeight: '500', fontSize: 14 },

  resultFooter: { alignItems: 'center', marginBottom: 20 },
  finishBtn: { 
    backgroundColor: '#AEC6CF', 
    paddingVertical: 16, 
    paddingHorizontal: 50, 
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  finishBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});