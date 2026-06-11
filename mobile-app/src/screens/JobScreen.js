import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Dimensions, SafeAreaView, StatusBar, Image, Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const jobs = [
  {
    id: 1,
    emoji: '💻',
    title: 'Bilgisayar Mühendisliği',
    subtitle: 'Teknolojinin Mimarları',
    character: 'Analitik · Meraklı · Sistemci',
    color: '#E8F0FE',
    accentColor: '#4A90E2',
    difficulty: 4,
    salary: '₺35.000 – ₺120.000',
    duration: '4 Yıl',
    desc: 'Yazılım geliştirme, yapay zeka, siber güvenlik ve donanım sistemlerini kapsayan geniş bir mühendislik dalıdır. Günümüzün en hızlı büyüyen sektörlerindendir.',
    whatYouLearn: ['Algoritmalar ve Veri Yapıları', 'Yapay Zeka & Makine Öğrenmesi', 'Siber Güvenlik', 'Mobil ve Web Geliştirme', 'Veritabanı Yönetimi'],
    careers: ['Yazılım Geliştirici', 'Veri Bilimcisi', 'Yapay Zeka Mühendisi', 'Siber Güvenlik Uzmanı', 'CTO / Teknik Direktör'],
    traits: ['Sorun çözmeyi sever', 'Detaylara dikkat eder', 'Sürekli öğrenmeye açık', 'Sabırlı ve sistematik'],
  },
  {
    id: 2,
    emoji: '🩺',
    title: 'Tıp',
    subtitle: 'Hayat Kurtaranlar',
    character: 'Özverili · Dikkatli · Dayanıklı',
    color: '#FFF0F0',
    accentColor: '#E74C3C',
    difficulty: 5,
    salary: '₺40.000 – ₺200.000+',
    duration: '6 Yıl + İhtisas',
    desc: 'İnsan sağlığını korumayı ve hastalıkları tedavi etmeyi amaçlayan, bilimsel bilgi ile insani değerleri birleştiren en köklü mesleklerden biridir.',
    whatYouLearn: ['Anatomi & Fizyoloji', 'Patoloji & Farmakoloji', 'Cerrahi Teknikler', 'Dahiliye & Uzmanlık Alanları', 'Acil Tıp Müdahaleleri'],
    careers: ['Aile Hekimi', 'Cerrah', 'Kardiyolog', 'Psikiyatrist', 'Acil Tıp Uzmanı'],
    traits: ['Yüksek sorumluluk bilinci', 'Baskı altında sakin kalır', 'Empati kurar', 'Uzun süreli çalışmaya dayanıklı'],
  },
  {
    id: 3,
    emoji: '⚖️',
    title: 'Hukuk',
    subtitle: 'Adaletin Savunucuları',
    character: 'Adaletli · İkna Edici · Detaycı',
    color: '#FDF7F0',
    accentColor: '#E67E22',
    difficulty: 4,
    salary: '₺25.000 – ₺150.000',
    duration: '4 Yıl',
    desc: 'Toplumsal düzeni sağlayan yasaları yorumlama, uygulama ve geliştirme üzerine kurulu bir disiplindir. Her sektörde hukuki uzmanlığa ihtiyaç duyulur.',
    whatYouLearn: ['Anayasa & İdare Hukuku', 'Ceza Hukuku', 'Medeni Hukuk', 'Ticaret & Şirketler Hukuku', 'Uluslararası Hukuk'],
    careers: ['Avukat', 'Hâkim & Savcı', 'Hukuk Müşaviri', 'Noterlik', 'Arabulucu'],
    traits: ['Güçlü hafıza ve analiz', 'Haksızlığa duyarlı', 'Hitabeti güçlü', 'Okuma ve araştırma sever'],
  },
  {
    id: 4,
    emoji: '🧠',
    title: 'Psikoloji',
    subtitle: 'Zihnin Kaşifleri',
    character: 'Empatik · Sabırlı · İyi Dinleyici',
    color: '#F0F4FF',
    accentColor: '#7C3AED',
    difficulty: 3,
    salary: '₺20.000 – ₺80.000',
    duration: '4 Yıl',
    desc: 'İnsan zihnini, davranışlarını ve duygularını inceleyen bilim dalıdır. Terapi, araştırma, eğitim ve iş dünyasında geniş uygulama alanları sunar.',
    whatYouLearn: ['Gelişim Psikolojisi', 'Klinik & Terapötik Yaklaşımlar', 'Sosyal & Bilişsel Psikoloji', 'Nöropsikoloji', 'Araştırma Yöntemleri'],
    careers: ['Klinisyen Psikolog', 'Çocuk Psikoloğu', 'Endüstri Psikoloğu', 'Araştırmacı', 'İnsan Kaynakları Uzmanı'],
    traits: ['Yargılamadan dinler', 'Sezgileri güçlü', 'Sabırlı ve anlayışlı', 'Duygusal zekası yüksek'],
  },
  {
    id: 5,
    emoji: '🏗️',
    title: 'Mimarlık',
    subtitle: 'Mekânın Yaratıcıları',
    character: 'Yaratıcı · Detaycı · Vizyoner',
    color: '#F0FFF4',
    accentColor: '#27AE60',
    difficulty: 4,
    salary: '₺22.000 – ₺90.000',
    duration: '5 Yıl',
    desc: 'Estetik ile mühendisliği birleştiren, yaşam alanlarını tasarlayan ve insan deneyimini şekillendiren bir disiplindir. Hem sanatsal hem teknik yönü güçlüdür.',
    whatYouLearn: ['Mimari Tasarım & Proje', 'Yapı Statiği & Malzeme', 'Kent Planlama', 'İç Mimarlık & Peyzaj', 'BIM & Dijital Tasarım Araçları'],
    careers: ['Serbest Mimar', 'İç Mimar', 'Kent Plancısı', 'Proje Yöneticisi', 'Restorasyon Uzmanı'],
    traits: ['Uzaysal zekası güçlü', 'Estetik duyarlılığı var', 'Sabırla detay işler', 'Yaratıcı ve vizyon sahibi'],
  },
  {
    id: 6,
    emoji: '📊',
    title: 'İşletme',
    subtitle: 'Organizasyonun Motoru',
    character: 'Lider · Stratejik · İletişimci',
    color: '#FFFBEB',
    accentColor: '#F59E0B',
    difficulty: 3,
    salary: '₺20.000 – ₺150.000',
    duration: '4 Yıl',
    desc: 'Şirketlerin nasıl kurulup yönetileceğini, kâr sağlanacağını ve sürdürülebilir büyüme sağlanacağını öğreten çok yönlü bir alandır.',
    whatYouLearn: ['Pazarlama & Satış Stratejisi', 'Finansal Yönetim', 'İnsan Kaynakları', 'Girişimcilik & İnovasyon', 'Uluslararası Ticaret'],
    careers: ['Genel Müdür / CEO', 'Pazarlama Müdürü', 'Girişimci', 'Finans Analisti', 'Danışman'],
    traits: ['İnsan ilişkilerinde güçlü', 'Stratejik düşünür', 'Liderlik ve motivasyon', 'Risk almaktan çekinmez'],
  },
  {
    id: 7,
    emoji: '⚡',
    title: 'Elektrik-Elektronik Mühendisliği',
    subtitle: 'Enerjinin Ustası',
    character: 'Teknik · Analitik · Mühendis Ruhu',
    color: '#FFF9E6',
    accentColor: '#D97706',
    difficulty: 5,
    salary: '₺30.000 – ₺110.000',
    duration: '4 Yıl',
    desc: 'Elektrik üretiminden akıllı sistemlere, tıbbi cihazlardan uzay teknolojisine kadar her alanda kritik rol oynayan temel mühendislik dallarından biridir.',
    whatYouLearn: ['Devre Teorisi & Elektroniği', 'Güç Sistemleri', 'Sinyal İşleme', 'Gömülü Sistemler & IoT', 'Kontrol Sistemleri'],
    careers: ['Elektronik Mühendisi', 'Enerji Uzmanı', 'Biyomedikal Mühendisi', 'Ar-Ge Mühendisi', 'Proje Mühendisi'],
    traits: ['Matematik ve fizik sever', 'Sabırlı ve dikkatli', 'Deney yapmaktan keyif alır', 'Teknik problem çözer'],
  },
  {
    id: 8,
    emoji: '🎨',
    title: 'Güzel Sanatlar & Tasarım',
    subtitle: 'Duyguların Dili',
    character: 'Yaratıcı · Özgün · Duygusal Zekâlı',
    color: '#FDF0FF',
    accentColor: '#9B59B6',
    difficulty: 3,
    salary: '₺15.000 – ₺80.000',
    duration: '4 Yıl',
    desc: 'Görsel iletişim, ifade ve estetik algıyı merkeze alan; grafik tasarımdan illüstrasyona, animasyondan moda tasarımına uzanan geniş bir yaratıcı alandır.',
    whatYouLearn: ['Grafik & Tipografi', 'Dijital İllüstrasyon & Animasyon', 'Marka Kimliği Tasarımı', 'UX/UI Tasarımı', 'Fotoğrafçılık & Video Prodüksiyon'],
    careers: ['Grafik Tasarımcı', 'UX/UI Tasarımcısı', 'Animatör', 'Art Director', 'Marka Yöneticisi'],
    traits: ['Görsel zekası gelişmiş', 'Özgün ve bağımsız düşünür', 'Detaylarda anlam arar', 'Estetik tutku taşır'],
  },
  {
    id: 9,
    emoji: '🌍',
    title: 'Uluslararası İlişkiler',
    subtitle: 'Dünya Sahnesinde',
    character: 'Diplomatik · Meraklı · Çok Kültürlü',
    color: '#F0F9FF',
    accentColor: '#0EA5E9',
    difficulty: 3,
    salary: '₺22.000 – ₺100.000',
    duration: '4 Yıl',
    desc: 'Devletler arası ilişkileri, diplomasiyi, uluslararası ekonomiyi ve küresel güvenliği inceleyen; dünya sahnesinde etkin rol almak isteyenler için biçilmiş kaftandır.',
    whatYouLearn: ['Diplomasi & Dış Politika', 'Uluslararası Hukuk', 'Küresel Ekonomi', 'Siyaset Teorileri', 'Bölgesel Çalışmalar'],
    careers: ['Diplomat / Büyükelçi', 'Uluslararası Kuruluş Uzmanı (BM, AB)', 'Dış Ticaret Müzakereci', 'Siyasi Analist', 'NGO Yöneticisi'],
    traits: ['Empati ve iletişim gücü', 'Birden fazla dil bilir', 'Kültürel farklılıklara saygılı', 'Geniş bir dünya görüşü'],
  },
  {
    id: 10,
    emoji: '🔬',
    title: 'Biyoloji & Biyoteknoloji',
    subtitle: 'Yaşamın Sırrını Arayanlar',
    character: 'Meraklı · Sabırlı · Bilim İnsanı',
    color: '#F0FFF4',
    accentColor: '#059669',
    difficulty: 4,
    salary: '₺18.000 – ₺90.000',
    duration: '4 Yıl',
    desc: 'Canlıların yapısını, işleyişini ve birbirleriyle ilişkilerini inceleyen; genetikten ekolojiye, biyoteknolojiden tıbbi araştırmalara uzanan kapsamlı bir bilim alanıdır.',
    whatYouLearn: ['Genetik & Moleküler Biyoloji', 'Hücre Biyolojisi & Biyokimya', 'Ekoloji & Evrim', 'Biyoteknoloji Uygulamaları', 'Mikrobiyoloji'],
    careers: ['Biyoteknolog', 'Araştırma Bilimci', 'Eczacılık Uzmanı', 'Çevre Danışmanı', 'Akademisyen'],
    traits: ['Sabır ve titizlik', 'Doğaya merak duyar', 'Deneysel düşünür', 'Araştırmadan keyif alır'],
  },
  {
    id: 11,
    emoji: '💰',
    title: 'Ekonomi & Finans',
    subtitle: 'Piyasanın Nabzı',
    character: 'Analitik · Stratejik · Risk Yöneticisi',
    color: '#FAFFF0',
    accentColor: '#65A30D',
    difficulty: 4,
    salary: '₺28.000 – ₺180.000',
    duration: '4 Yıl',
    desc: 'Piyasaların, para akışlarının ve ekonomik kararların analizini yapan; bireyden küresel sisteme kadar tüm finansal süreçleri anlama ve yönetme disiplinidir.',
    whatYouLearn: ['Mikro & Makro Ekonomi', 'Finans Teorisi & Yatırım', 'Ekonometri & Veri Analizi', 'Bankacılık & Sigortacılık', 'Borsa & Türev Araçlar'],
    careers: ['Finans Analisti', 'Yatırım Bankacısı', 'Risk Yöneticisi', 'Ekonomist', 'Portföy Yöneticisi'],
    traits: ['Sayısal zekası güçlü', 'Riski hesaplayarak alır', 'Küresel gelişmeleri takip eder', 'Stratejik ve öngörülü'],
  },
  {
    id: 12,
    emoji: '📚',
    title: 'Felsefe',
    subtitle: 'Düşüncenin Ötesi',
    character: 'Sorgulayıcı · Analitik · Vizyoner',
    color: '#FDF5E6',
    accentColor: '#92400E',
    difficulty: 3,
    salary: '₺15.000 – ₺70.000',
    duration: '4 Yıl',
    desc: 'Varoluşu, ahlakı, bilgiyi ve gerçekliği derinlemesine sorgulayan; eleştirel ve sistematik düşünme becerisini en üst seviyede geliştiren köklü bir disiplindir.',
    whatYouLearn: ['Mantık & Argümantasyon', 'Etik & Ahlak Felsefesi', 'Siyaset Felsefesi', 'Bilgi Kuramı (Epistemoloji)', 'Varoluş Felsefesi'],
    careers: ['Akademisyen & Araştırmacı', 'Etik Danışmanı', 'Yazar & Editör', 'İnsan Kaynakları Uzmanı', 'Hukuk & Kamu Alanı'],
    traits: ['Görünenin ötesini sorgular', 'Empati ve anlayış derinliği', 'Güçlü yazma ve ifade yeteneği', 'Dogmalara meydan okur'],
  },
];

const DifficultyDots = ({ level, color }) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <View
        key={i}
        style={{
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: i <= level ? color : '#E0E0E0',
        }}
      />
    ))}
  </View>
);

const JobScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meslek Kütüphanesi</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Karakterine en yakın olanı keşfet.</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {jobs.map((job) => (
          <TouchableOpacity 
            key={job.id} 
            style={[styles.jobCard, { 
              backgroundColor: isDarkMode ? colors.cardBackground : job.color,
              borderColor: isDarkMode ? colors.border : 'transparent',
              borderWidth: isDarkMode ? 1 : 0
            }]}
            onPress={() => setSelectedJob(job)}
            activeOpacity={0.85}
          >
            <View style={[styles.emojiBox, { backgroundColor: job.accentColor + '18' }]}>
              <Text style={styles.emoji}>{job.emoji}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobSubtitle}>{job.subtitle}</Text>
              <Text style={styles.jobChar}>{job.character}</Text>
              <View style={styles.cardFooter}>
                <DifficultyDots level={job.difficulty} color={job.accentColor} />
                <Text style={[styles.salaryBadge, { color: job.accentColor }]}>{job.salary}</Text>
              </View>
            </View>
            <View style={[styles.arrowCircle, { backgroundColor: job.accentColor + '20' }]}>
              <Text style={[styles.arrow, { color: job.accentColor }]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Detay Modalı */}
      <Modal visible={selectedJob !== null} animationType="slide" transparent onRequestClose={() => setSelectedJob(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Renkli başlık bandı */}
            <View style={[styles.modalBanner, { backgroundColor: (selectedJob?.accentColor || '#4A90E2') + '18' }]}>
              <Text style={styles.modalEmoji}>{selectedJob?.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: selectedJob?.accentColor }]}>{selectedJob?.title}</Text>
                <Text style={styles.modalSubtitle}>{selectedJob?.subtitle}</Text>
              </View>
              <TouchableOpacity style={styles.closeX} onPress={() => setSelectedJob(null)}>
                <Text style={styles.closeXText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Karakter etiketi */}
              <View style={[styles.charTag, { borderColor: selectedJob?.accentColor + '50', backgroundColor: selectedJob?.accentColor + '10' }]}>
                <Text style={[styles.charTagText, { color: selectedJob?.accentColor }]}>✨ {selectedJob?.character}</Text>
              </View>

              {/* Bilgi satırı */}
              <View style={styles.infoRow}>
                <View style={styles.infoChip}>
                  <Text style={styles.infoIcon}>⏱️</Text>
                  <Text style={styles.infoText}>{selectedJob?.duration}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoIcon}>💰</Text>
                  <Text style={styles.infoText}>{selectedJob?.salary}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoIcon}>📈</Text>
                  <View style={{ marginTop: 2 }}>
                    <DifficultyDots level={selectedJob?.difficulty || 3} color={selectedJob?.accentColor || '#4A90E2'} />
                  </View>
                </View>
              </View>

              {/* Açıklama */}
              <Text style={styles.modalDesc}>{selectedJob?.desc}</Text>

              {/* Ne öğrenirsin */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: selectedJob?.accentColor }]}>📖 Ne Öğrenirsin?</Text>
                {selectedJob?.whatYouLearn.map((item, i) => (
                  <View key={i} style={styles.listRow}>
                    <View style={[styles.bullet, { backgroundColor: selectedJob?.accentColor }]} />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Kariyer yolları */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: selectedJob?.accentColor }]}>🚀 Kariyer Yolları</Text>
                <View style={styles.careerPills}>
                  {selectedJob?.careers.map((c, i) => (
                    <View key={i} style={[styles.pill, { backgroundColor: (selectedJob?.accentColor || '#4A90E2') + '15', borderColor: (selectedJob?.accentColor || '#4A90E2') + '40' }]}>
                      <Text style={[styles.pillText, { color: selectedJob?.accentColor }]}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* İdeal kişilik */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: selectedJob?.accentColor }]}>🎯 Sana Uyar mı?</Text>
                {selectedJob?.traits.map((t, i) => (
                  <View key={i} style={styles.listRow}>
                    <Text style={[styles.checkMark, { color: selectedJob?.accentColor }]}>✓</Text>
                    <Text style={styles.listText}>{t}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: selectedJob?.accentColor }]}
                onPress={() => setSelectedJob(null)}
              >
                <Text style={styles.closeButtonText}>Harika, Anladım! 👍</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFF' },
  header: { paddingHorizontal: 25, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  list: { paddingHorizontal: 20, paddingTop: 10 },

  jobCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, borderRadius: 22, marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  emojiBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  emoji: { fontSize: 26 },
  cardBody: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  jobSubtitle: { fontSize: 11, color: '#8E8E93', marginTop: 1, fontWeight: '500' },
  jobChar: { fontSize: 12, color: '#666', marginTop: 5, fontStyle: 'italic' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  salaryBadge: { fontSize: 11, fontWeight: '700' },
  arrowCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  arrow: { fontSize: 24, fontWeight: '300', marginTop: -2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, maxHeight: height * 0.88 },
  modalBanner: { flexDirection: 'row', alignItems: 'center', padding: 22, paddingBottom: 16, borderTopLeftRadius: 36, borderTopRightRadius: 36, gap: 14 },
  modalEmoji: { fontSize: 40 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  modalSubtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  closeX: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  closeXText: { fontSize: 14, color: '#555', fontWeight: 'bold' },

  modalScroll: { paddingHorizontal: 22 },
  charTag: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 14 },
  charTagText: { fontSize: 13, fontWeight: '700' },

  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoChip: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  infoIcon: { fontSize: 18 },
  infoText: { fontSize: 10, fontWeight: '600', color: '#555', textAlign: 'center' },

  modalDesc: { fontSize: 15, color: '#444', lineHeight: 24, marginBottom: 8 },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginRight: 10, marginTop: 1 },
  checkMark: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  listText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },

  careerPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontSize: 13, fontWeight: '600' },

  closeButton: { borderRadius: 18, padding: 17, alignItems: 'center', marginTop: 24 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default JobScreen;