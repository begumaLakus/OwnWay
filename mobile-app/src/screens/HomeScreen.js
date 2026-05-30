import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, Modal } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);

  // 1. Banner Verileri (Aynı Kalan Kısım)
  const bannerData = [
    { id: 1, title: "OwnWay", desc: "Geleceğine giden yolu birlikte çizelim.", color: "#E8F0FE", img: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400" },
    { id: 2, title: "Şehirleri Tanı", desc: "Türkiye haritası üzerinden hayalindeki şehri keşfet.", color: "#FDF7F2", img: "https://images.unsplash.com/photo-1527838832702-585f23df82a7?w=400" },
    { id: 3, title: "Meslekleri Keşfet", desc: "Hangi meslek senin karakterini yansıtıyor?", color: "#F0F4F8", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { id: 4, title: "Kendini Tanı", desc: "Profil kısmındaki testi çöz, yeteneklerini gör.", color: "#F5F0FF", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400" }
  ];

  // 2. Yeni Rehber Kartları (Beije Tarzı)
  const rehberData = [
    {
      id: 1,
      
      title: "Motivasyon ve Başarı",
      summary: "Geleceğini şekillendirmek için ihtiyacın olan o ilk adım...",
      content: "Buraya çok uzun bir yazı gelecek... Başarı yolculuğunda motivasyonunu nasıl yüksek tutacağını detaylıca anlatabilirsin.",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400",
      color: "#FDF2F2"
    },
    {
      id: 2,
     
      title: "Hangi Bölümü Seçmeli?",
      summary: "Karakter analizine göre sana en uygun rehberlik...",
      content: "Burada rehberlik detayları olacak. Mühendislik mi, tıp mı? Kendi yeteneklerini keşfetmen için hazırladığımız bu rehberde...",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
      color: "#F2FDF5"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % bannerData.length;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * (width - 40), animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.headerArea}>
        <Text style={styles.greeting}>Hoş geldin ✨</Text>
        <Text style={styles.subTitle}>Keşfetmeye hazır mısın?</Text>
      </View>

      {/* BANNER (Geri Geldi!) */}
      <ScrollView 
        ref={scrollRef}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerContainer}
      >
        {bannerData.map((item) => (
          <View key={item.id} style={[styles.bannerCard, { backgroundColor: item.color }]}>
            <View style={styles.bannerTextContent}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerDesc}>{item.desc}</Text>
            </View>
            <Image source={{ uri: item.img }} style={styles.bannerImage} />
          </View>
        ))}
      </ScrollView>

      {/* NOKTALAR */}
      <View style={styles.pagination}>
        {bannerData.map((_, i) => (
          <View key={i} style={[styles.dot, { opacity: currentIndex === i ? 1 : 0.2 }]} />
        ))}
      </View>

      {/* REHBER KARTLARI (Beije Görünümü) */}
      <Text style={styles.sectionHeader}>Önerilenler</Text>
      <View style={styles.grid}>
        {rehberData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card} 
            onPress={() => setSelectedContent(item)}
          >
            <View style={[styles.imageContainer, { backgroundColor: item.color }]}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* BİLGİLENDİRME MODALI */}
      <Modal visible={selectedContent !== null} animationType="slide">
        <ScrollView style={styles.modalScroll}>
          <Image source={{ uri: selectedContent?.image }} style={styles.modalHeaderImage} />
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>{selectedContent?.title}</Text>
            <View style={styles.divider} />
            <Text style={styles.modalLongText}>{selectedContent?.content}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedContent(null)}>
              <Text style={styles.closeButtonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBFF' },
  headerArea: { paddingHorizontal: 25, paddingTop: 60, marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#333' },
  subTitle: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
  
  // Banner Stilleri
  bannerContainer: { paddingHorizontal: 20 },
  bannerCard: { width: width - 40, height: 160, borderRadius: 25, marginRight: 10, flexDirection: 'row', alignItems: 'center', padding: 25 },
  bannerTextContent: { flex: 1 },
  bannerTitle: { fontSize: 22, fontWeight: 'bold' },
  bannerDesc: { fontSize: 13, color: '#555', marginTop: 8 },
  bannerImage: { width: 80, height: 80, opacity: 0.6, borderRadius: 15 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4A90E2', marginHorizontal: 3 },

  // Grid Stilleri
  sectionHeader: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 25, marginTop: 35, marginBottom: 15 },
  grid: { paddingHorizontal: 25, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width / 2) - 35, marginBottom: 25 },
  imageContainer: { height: 160, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  cardImage: { width: '100%', height: '100%', opacity: 0.9 },

  cardInfo: { marginTop: 10 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  cardSummary: { fontSize: 12, color: '#8E8E93', marginTop: 5, lineHeight: 16 },

  // Modal Stilleri
  modalScroll: { flex: 1, backgroundColor: '#FFF' },
  modalHeaderImage: { width: '100%', height: 280 },
  modalBody: { padding: 25 },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  modalLongText: { fontSize: 16, color: '#555', lineHeight: 26 },
  closeButton: { backgroundColor: '#4A90E2', padding: 18, borderRadius: 15, marginTop: 40, alignItems: 'center' },
  closeButtonText: { color: '#FFF', fontWeight: 'bold' }
});

export default HomeScreen;