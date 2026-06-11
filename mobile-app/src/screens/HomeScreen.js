import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  TouchableOpacity, Image, Modal
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// ─── ANA EKRAN ────────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);

  const bannerData = [
    { id: 1, title: "Geleceğini Keşfet", desc: "OwnWay ile karakterine en uygun mesleği ve üniversite şehrini anında öğren.", tag: "OWNWAY'İ TANI", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" },
    { id: 2, title: "Meslekleri Tanı", desc: "Geleceğin popüler mesleklerini, çalışma alanlarını ve gereksinimlerini detaylıca incele.", tag: "MESLEK REHBERİ", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" },
    { id: 3, title: "Şehrini Bul", desc: "Yaşam tarzına ve beklentilerine en uygun öğrenci şehirlerini haritada keşfet.", tag: "ŞEHİR ANALİZİ", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80" },
    { id: 4, title: "Potansiyelini Ortaya Çıkar", desc: "Kişiliğine en uygun mesleği bulmak için testimizi çöz, sana özel kariyer rotanı çizelim.", tag: "MESLEK ANALİZ TESTİ", img: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=800&q=80" },
  ];

  const rehberData = [
    { id: 1, title: "Motivasyon ve Başarı", summary: "Geleceğini şekillendirmek için ihtiyacın olan o ilk adım...", content: "Başarı yolculuğunda motivasyonunu yüksek tutmak çok önemlidir. Kendi yeteneklerine inanmak, zorluklar karşısında pes etmemek kariyer basamaklarını tırmanırken en büyük gücün olacaktır. Kendi hedeflerini belirle ve her gün o hedefe bir adım daha yaklaşmak için çalış.", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800", color: "#FDF2F2" },
    { id: 2, title: "Hangi Bölümü Seçmeli?", summary: "Karakter analizine göre sana en uygun rehberlik...", content: "Üniversite bölümü seçimi hayatındaki en kritik kararlardan biridir. Sadece bölümün popülerliği değil, senin o alana olan tutkun önemlidir. Mühendislik, Tıp, Sosyal Bilimler veya Sanat... Hangi bölüm seni heyecanlandırıyor? OwnWay Kariyer testini çözerek kendi karakterine (RIASEC) uygun meslek gruplarını kolayca bulabilirsin.", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800", color: "#F2FDF5" },
    { id: 3, title: "Doğru Öğrenci Şehri", summary: "Üniversiteyi hangi şehirde okumalı? Beklentilerini belirle...", content: "Üniversite hayatı sadece derslerden ibaret değildir. Okuduğun şehir, sosyal hayatını, kültürel birikimini ve vizyonunu doğrudan etkiler. İstanbul'un dinamiği, Ankara'nın disiplini, İzmir'in rahatlığı veya Eskişehir'in tam bir öğrenci şehri olması... OwnWay Şehir Analizi ile sana en çok hitap eden şehri bulabilirsin.", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800", color: "#F0F8FF" },
    { id: 4, title: "Yapay Zeka ve Kariyer", summary: "Geleceğin mesleklerine teknolojinin etkisi nasıl olacak?", content: "Yapay zeka hızla gelişiyor ve iş dünyasını dönüştürüyor. Bazı meslekler yok olurken bazıları şekil değiştiriyor ve yepyeni iş alanları ortaya çıkıyor. Hangi alanı seçersen seç, teknoloji okuryazarlığı artık zorunlu bir yetenek. Kendini yeniliğe açık tutarak geleceğin aranan isimlerinden biri olabilirsin.", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800", color: "#FDF5E6" },
    { id: 5, title: "Kariyer Planlaması", summary: "Kariyer rotanı şimdiden çizerek rakiplerinin önüne geç.", content: "Kariyer planlaması mezun olunca değil, üniversiteye hazırlanırken başlar. Hangi alanda yeteneklisin? Nasıl bir çalışma ortamı seni mutlu eder? Stajlar, seminerler ve öğrenci kulüpleri ile kendini şimdiden geliştir. OwnWay'in meslekler kütüphanesi sana bu yolda en büyük rehber olacak.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800", color: "#F5F0FF" },
    { id: 6, title: "Sınav Stresi Yönetimi", summary: "Stresi yöneterek gerçek potansiyelini sınava yansıt.", content: "Sınav stresi her öğrencinin yaşadığı doğal bir süreçtir. Önemli olan bu stresi yönetebilmektir. Düzenli uyku, nefes egzersizleri ve gerçekçi hedefler stresi azaltır. Unutma, sınav sadece bir araçtır, hayatının tek belirleyicisi değildir. Elinden gelenin en iyisini yap ve sonuca değil sürece odaklan.", image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800", color: "#FEF4F4" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % bannerData.length;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleCardPress = (item) => {
    setSelectedContent(item);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.headerArea}>
        <Text>
          <Text style={[styles.brandOwn, isDarkMode && { color: colors.text }]}>Own</Text>
          <Text style={styles.brandWay}>Way</Text>
          <Text style={styles.brandDot}>.</Text>
        </Text>
      </View>

      {/* BANNER */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerContainer}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          if (currentIndex !== index) setCurrentIndex(index);
        }}
      >
        {bannerData.map((item) => (
          <View key={item.id} style={styles.bannerCardWrapper}>
            <View style={styles.bannerCard}>
              <Image source={{ uri: item.img }} style={styles.bannerImageBg} />
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerTextContent}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerDesc}>{item.desc}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* NOKTALAR */}
      <View style={styles.pagination}>
        {bannerData.map((_, i) => (
          <View key={i} style={[styles.dot, { opacity: currentIndex === i ? 1 : 0.2 }]} />
        ))}
      </View>

      {/* REHBER KARTLARI */}
      <Text style={[styles.sectionHeader, { color: colors.text }]}>Önerilenler</Text>
      <View style={styles.grid}>
        {rehberData.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => handleCardPress(item)}
          >
            <View style={[styles.imageContainer, { backgroundColor: isDarkMode ? colors.cardBackground : item.color, borderColor: colors.border, borderWidth: isDarkMode ? 1 : 0 }]}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.cardSummary, { color: colors.textSecondary }]} numberOfLines={2}>{item.summary}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* NORMAL BİLGİLENDİRME MODALI */}
      <Modal visible={selectedContent !== null} animationType="slide" onRequestClose={() => setSelectedContent(null)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground }]}>
          <TouchableOpacity style={styles.modalBackButton} onPress={() => setSelectedContent(null)}>
            <Text style={styles.modalBackIcon}>←</Text>
          </TouchableOpacity>
          <ScrollView style={styles.modalScroll} bounces={false} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedContent?.image }} style={styles.modalHeaderImage} />
            <View style={[styles.modalBody, { backgroundColor: colors.modalBackground }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedContent?.title}</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalLongText, { color: colors.textSecondary }]}>{selectedContent?.content}</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBFF' },
  headerArea: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 15 },
  brandOwn: { fontSize: 32, fontWeight: '700', color: '#334155', letterSpacing: -0.5 },
  brandWay: { fontSize: 32, fontWeight: '700', color: '#4A90E2', letterSpacing: -0.5 },
  brandDot: { fontSize: 32, fontWeight: '700', color: '#FFB74D' },
  bannerContainer: {},
  bannerCardWrapper: { width, paddingHorizontal: 20 },
  bannerCard: { width: '100%', height: 220, borderRadius: 28, overflow: 'hidden', position: 'relative', justifyContent: 'flex-end', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15 },
  bannerImageBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  bannerTextContent: { paddingHorizontal: 24, paddingBottom: 24, width: '100%' },
  tagBadge: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  tagText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6, letterSpacing: 0.5 },
  bannerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.95)', lineHeight: 18, fontWeight: '500' },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4A90E2', marginHorizontal: 3 },
  sectionHeader: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 25, marginTop: 35, marginBottom: 15 },
  grid: { paddingHorizontal: 25, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width / 2) - 35, marginBottom: 25 },
  imageContainer: { height: 160, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  cardImage: { width: '100%', height: '100%', opacity: 0.9 },
  cardInfo: { marginTop: 10 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  cardSummary: { fontSize: 12, color: '#8E8E93', marginTop: 5, lineHeight: 16 },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalBackButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  modalBackIcon: { color: '#FFF', fontSize: 24, fontWeight: '600', lineHeight: 26, marginLeft: -2 },
  modalScroll: { flex: 1 },
  modalHeaderImage: { width: '100%', height: 320 },
  modalBody: { padding: 25, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  modalLongText: { fontSize: 16, color: '#475569', lineHeight: 28 },
});

export default HomeScreen;