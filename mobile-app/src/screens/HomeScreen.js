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
  const [quoteIndex, setQuoteIndex] = useState(0);

  const motivationQuotes = [
    {
      soz: "Bugün attığın adım, yarının başarısını oluşturur.",
      hatirlatma: "Başarı, bir anda gelen bir sonuç değil; sabır, emek ve kararlılıkla oluşan bir süreçtir. Bugün attığın küçük bir adım bile seni hedeflerine yaklaştırır. Kendine güven, yoluna devam et ve unutma: Vazgeçmediğin sürece ilerliyorsun.",
      not: "Bugün hedeflerim için elimden gelenin en iyisini yapacağım."
    },
    {
      soz: "Hayatta en büyük zafer hiçbir zaman düşmemekte değil, her düştüğünde ayağa kalkabilmektedir.",
      hatirlatma: "Zorluklar karşısında pes etmek en kolayıdır. Ancak seni diğerlerinden ayıracak olan, düştüğünde yeniden kalkabilme gücündür. Her yeni gün, yeni bir başlangıç fırsatıdır.",
      not: "Zorlukları birer basamak olarak göreceğim."
    },
    {
      soz: "Gelecek, hayallerinin güzelliğine inananlara aittir.",
      hatirlatma: "Neyi başarıp başaramayacağına sadece sen karar verirsin. Sınırlarını kendin çizersin. Potansiyelinin farkına var ve onu açığa çıkarmaktan korkma.",
      not: "Kendi potansiyelime inanıyor ve kendime güveniyorum."
    }
  ];

  const personalityData = [
    {
      type: 'Analitik & Araştırmacı',
      icon: '🔬',
      color: '#4A90E2',
      bg: '#F0F8FF',
      professions: 'Yazılım Geliştirici, Veri Bilimcisi, Doktor, Biyolog',
      difficulty: 'Sürekli öğrenmeyi ve analitik düşünmeyi gerektirir. Uzun süreli zihinsel odaklanma yorucu olabilir. Çözümsüz gibi görünen karmaşık problemlerle sık sık karşılaşılır.',
    },
    {
      type: 'Yaratıcı & Sanatsal',
      icon: '🎨',
      color: '#9B59B6',
      bg: '#F9F0FF',
      professions: 'Grafik Tasarımcı, İç Mimar, Oyun Tasarımcısı, Yönetmen',
      difficulty: 'İlhamın her zaman gelmemesi ve yaratıcılık tıkanıklığı en büyük zorluktur. Ayrıca eleştirilere açık olmayı ve esnek çalışma saatlerini tolere etmeyi gerektirir.',
    },
    {
      type: 'Sosyal & Yardımsever',
      icon: '🤝',
      color: '#27AE60',
      bg: '#EAFDF2',
      professions: 'Psikolog, Öğretmen, İnsan Kaynakları, Hemşire',
      difficulty: 'İnsanlarla sürekli ve yoğun etkileşim duygusal olarak yıpratıcı (burnout) olabilir. Karşınızdaki kişilerin sorunlarını içselleştirmemek büyük bir profesyonellik gerektirir.',
    },
    {
      type: 'Lider & Girişimci',
      icon: '🚀',
      color: '#F39C12',
      bg: '#FFF8E6',
      professions: 'Girişimci, Pazarlama Müdürü, Avukat, Satış Uzmanı',
      difficulty: 'Yüksek stres, belirsizlik ve risk alma zorunluluğu vardır. Başarı kadar başarısızlığa da hazırlıklı olmak ve sürekli bir rekabet ortamında liderliği korumak yorucudur.',
    },
    {
      type: 'Pratik & Gerçekçi',
      icon: '🔧',
      color: '#E74C3C',
      bg: '#FDEDEC',
      professions: 'Makine Mühendisi, İnşaat Mühendisi, Pilot',
      difficulty: 'Fiziksel dayanıklılık veya sahada aktif olmayı gerektirebilir. Kurallara ve güvenlik prosedürlerine katı bir şekilde uymak zorunludur.',
    },
    {
      type: 'Düzenli & Geleneksel',
      icon: '📋',
      color: '#34495E',
      bg: '#EDF2F6',
      professions: 'Muhasebeci, Mali Müşavir, Veri Analisti',
      difficulty: 'Sürekli tekrarlayan (rutin) işler ve yüksek dikkat gereksinimi vardır. En ufak bir hesaplama hatası büyük sorunlara yol açabileceği için hata payı sıfıra yakındır.',
    }
  ];

  const bannerData = [
    { id: 1, title: "Geleceğini Keşfet", desc: "OwnWay ile karakterine en uygun mesleği ve üniversite şehrini anında öğren.", tag: "OWNWAY'İ TANI", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" },
    { id: 2, title: "Meslekleri Tanı", desc: "Geleceğin popüler mesleklerini, çalışma alanlarını ve gereksinimlerini detaylıca incele.", tag: "MESLEK REHBERİ", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" },
    { id: 3, title: "Şehrini Bul", desc: "Yaşam tarzına ve beklentilerine en uygun öğrenci şehirlerini haritada keşfet.", tag: "ŞEHİR ANALİZİ", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80" },
    { id: 4, title: "Potansiyelini Ortaya Çıkar", desc: "Kişiliğine en uygun mesleği bulmak için testimizi çöz, sana özel kariyer rotanı çizelim.", tag: "MESLEK ANALİZ TESTİ", img: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=800&q=80" },
  ];

  const rehberData = [
    { id: 1, title: "Motivasyon ve Başarı", summary: "Geleceğini şekillendirmek için ihtiyacın olan o ilk adım...", content: "Başarı yolculuğunda motivasyonunu yüksek tutmak çok önemlidir. Kendi yeteneklerine inanmak, zorluklar karşısında pes etmemek kariyer basamaklarını tırmanırken en büyük gücün olacaktır. Kendi hedeflerini belirle ve her gün o hedefe bir adım daha yaklaşmak için çalış.\n\n“Bugün attığın adım, yarının başarısını oluşturur.”\n\nBaşarı, bir anda gelen bir sonuç değil; sabır, emek ve kararlılıkla oluşan bir süreçtir. Bugün attığın küçük bir adım bile seni hedeflerine yaklaştırır. Kendine güven, yoluna devam et ve unutma: Vazgeçmediğin sürece ilerliyorsun.\n\nKendime Not: Bugün hedeflerim için elimden gelenin en iyisini yapacağım.", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800", color: "#FDF2F2" },
    { id: 2, title: "Hangi Bölümü Seçmeli?", summary: "Karakter analizine göre sana en uygun rehberlik...", content: "Üniversite bölümü seçimi hayatındaki en kritik kararlardan biridir. Sadece bölümün popülerliği değil, senin o alana olan tutkun önemlidir. Mühendislik, Tıp, Sosyal Bilimler veya Sanat... Hangi bölüm seni heyecanlandırıyor? OwnWay Kariyer testini çözerek kendi karakterine uygun meslek gruplarını kolayca bulabilirsin.", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800", color: "#F2FDF5" },
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
              
              {selectedContent?.id === 1 ? (
                <View style={styles.motivationWrapper}>
                  <View style={[styles.quoteBox, isDarkMode && { backgroundColor: '#3A2A2A', borderLeftColor: '#FFB4AB' }]}>
                    <Text style={[styles.quoteTitle, isDarkMode && { color: '#FFB4AB' }]}>✨ Kendime Sözüm</Text>
                    <Text style={[styles.quoteText, isDarkMode && { color: '#FFF' }]}>"{motivationQuotes[quoteIndex].soz}"</Text>
                  </View>
                  
                  <View style={[styles.reminderBox, isDarkMode && { backgroundColor: '#1A2A3A', borderLeftColor: '#8AB4F8' }]}>
                    <Text style={[styles.reminderTitle, isDarkMode && { color: '#8AB4F8' }]}>📌 Bugünün Hatırlatması</Text>
                    <Text style={[styles.reminderText, isDarkMode && { color: '#E8EAED' }]}>{motivationQuotes[quoteIndex].hatirlatma}</Text>
                  </View>
                  
                  <View style={[styles.noteBox, isDarkMode && { backgroundColor: '#3A3322', borderLeftColor: '#FCE29F' }]}>
                    <Text style={[styles.noteTitle, isDarkMode && { color: '#FCE29F' }]}>📝 Kendime Not</Text>
                    <Text style={[styles.noteText, isDarkMode && { color: '#E8EAED' }]}>{motivationQuotes[quoteIndex].not}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.refreshBtn}
                    onPress={() => setQuoteIndex((prev) => (prev + 1) % motivationQuotes.length)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.refreshBtnText}>🔄 Yeni Söz Getir</Text>
                  </TouchableOpacity>
                </View>
              ) : selectedContent?.id === 2 ? (
                <View style={styles.articleWrapper}>
                  <Text style={[styles.articleTitle, isDarkMode && { color: '#E2E8F0' }]}>Hangi Bölümü Seçmelisin? Doğru Kararı Vermek</Text>
                  <Text style={[styles.articleIntro, isDarkMode && { color: '#CBD5E0' }]}>Üniversite bölümü seçimi hayatındaki en kritik kararlardan biridir. Sadece bölümün popülerliği değil, senin o alana olan tutkun da önemlidir. Peki hangi kişilik tipine daha yakınsın?</Text>
                  
                  {personalityData.map((item, idx) => (
                    <View key={idx}>
                      <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>
                        {item.icon} {item.type}
                      </Text>
                      <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>
                        <Text style={{ fontWeight: 'bold' }}>Örnek Meslekler: </Text>{item.professions}{'\n'}
                        <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Zorlukları: </Text>
                        <Text style={{ fontStyle: 'italic' }}>{item.difficulty}</Text>
                      </Text>
                    </View>
                  ))}

                  <View style={[styles.articleHighlight, isDarkMode && { backgroundColor: '#1A365D', borderLeftColor: '#63B3ED' }]}>
                    <Text style={[styles.articleHighlightText, isDarkMode && { color: '#90CDF4' }]}>💡 Özetle: Meslekleri sadece maaş veya popülerliklerine göre değil, günlük hayat tarzına uygun olup olmadıklarına göre değerlendirmelisin. Kariyer Testimizi çözerek kendine en uygun alanı bulabilirsin!</Text>
                  </View>
                </View>
              ) : selectedContent?.id === 3 ? (
                <View style={styles.articleWrapper}>
                  <Text style={[styles.articleTitle, isDarkMode && { color: '#E2E8F0' }]}>Öğrenci Şehri Seçerken Nelere Dikkat Edilmeli?</Text>
                  <Text style={[styles.articleIntro, isDarkMode && { color: '#CBD5E0' }]}>Öğrencilik yıllarının büyük bir kısmı kampüsten ziyade yaşadığın şehirde geçer. Peki hayatının en güzel 4-5 yılını geçireceğin bu şehri seçerken hangi kriterleri göz önünde bulundurmalısın?</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>1. Bütçe ve Yaşam Maliyetleri 💸</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Büyükşehirler (İstanbul, Ankara, İzmir) kültürel anlamda çok zengin olsa da kira ve ulaşım masrafları oldukça yüksektir. Şehri seçerken bütçenle o şehirde rahatça yaşayıp yaşayamayacağını mutlaka hesaplamalısın. Eskişehir, Çanakkale veya Isparta gibi tam bir "öğrenci şehri" olan yerlerde yaşam maliyetleri nispeten daha uygundur.</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>2. Sosyal ve Kültürel İmkanlar 🎭</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Sadece ders çalışmak için değil, kendini geliştirmek için de üniversiteye gidiyorsun. Şehrin tiyatroları, müzeleri, konser alanları var mı? Staj bulma ihtimalin nedir? Kariyer hedefin medya, sanat veya teknoloji ise büyükşehirlerdeki ekosistem seni çok daha hızlı besleyebilir.</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>3. Ulaşım ve Konum 🚆</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Ailene yakın olmak mı istiyorsun yoksa tamamen farklı bir kültürü mü deneyimlemek istiyorsun? Şehrin otobüs, tren ve uçak bağlantılarının ne kadar kolay olduğunu kontrol et. Ayrıca kampüsün şehrin merkezine uzaklığı da günlük yaşamını doğrudan etkileyecek en önemli faktörlerden biridir.</Text>

                  <View style={[styles.articleHighlight, isDarkMode && { backgroundColor: '#1A365D', borderLeftColor: '#63B3ED' }]}>
                    <Text style={[styles.articleHighlightText, isDarkMode && { color: '#90CDF4' }]}>💡 Özetle: Karar verirken sadece üniversitenin adına değil, o şehrin sana katacağı vizyona ve ruh haline de odaklan. Çünkü iyi bir üniversite kadar, seni mutlu eden bir şehir de başarının anahtarıdır.</Text>
                  </View>
                </View>
              ) : selectedContent?.id === 4 ? (
                <View style={styles.articleWrapper}>
                  <Text style={[styles.articleTitle, isDarkMode && { color: '#E2E8F0' }]}>Yapay Zeka ile Kariyerini ve Sınav Başarını Şekillendir</Text>
                  <Text style={[styles.articleIntro, isDarkMode && { color: '#CBD5E0' }]}>Yapay zeka (YZ) hızla gelişiyor ve hem iş dünyasını hem de eğitim sistemini kökten değiştiriyor. Peki bu gücü sadece gelecekteki kariyerin için değil, bugünkü YKS hazırlık sürecin için de nasıl avantaja dönüştürebilirsin?</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>1. YKS Çalışmalarında Yapay Zekayı Verimli Kullanmak 🤖</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Uzun ve yorucu paragraf sorularını okumak veya çözemediğin matematik sorularında tıkanıp kalmak artık eskide kaldı. Yapay zekayı bir "özel hoca" gibi kullanabilirsin. Anlamadığın bir konuyu sanki 10 yaşındaki birine anlatırmış gibi basitleştirmesini isteyebilir ya da sana özel günlük çalışma programları hazırlatabilirsin.</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>2. YKS İçin Faydalı YZ Araçları 🚀</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>
                    <Text style={{ fontWeight: 'bold' }}>• ChatGPT & Claude:</Text> Konu anlatımı özetleri çıkarmak ve zorlandığın konularda farklı bakış açıları kazanmak için birebirdir. (Örn: "Bana Osmanlı duraklama dönemini 3 maddede özetle"){'\n'}
                    <Text style={{ fontWeight: 'bold' }}>• Microsoft Math Solver & Photomath:</Text> Çözemediğin sayısal soruların mantığını adım adım anlamak için harika alternatiflerdir.{'\n'}
                    <Text style={{ fontWeight: 'bold' }}>• Gemini:</Text> Güncel verilere ulaşmak ve sınav stratejileri hakkında taze tavsiyeler almak için kullanabilirsin.
                  </Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>3. Yapay Zeka ve Gelecekteki Kariyerin 💼</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Hangi bölümü seçersen seç (Tıp, Hukuk, Mühendislik veya Sanat), yapay zeka araçlarını iyi kullanabilenler rakiplerinin her zaman bir adım önünde olacak. Unutma; yapay zeka senin mesleğini elinden almayacak, <Text style={{ fontStyle: 'italic', fontWeight: 'bold' }}>yapay zekayı çok iyi kullanan başka bir insan seni geride bırakacak</Text>. Şimdiden "Prompt Engineering" (Etkili komut yazma) becerini geliştirmeye başla.</Text>

                  <View style={[styles.articleHighlight, isDarkMode && { backgroundColor: '#1A365D', borderLeftColor: '#63B3ED' }]}>
                    <Text style={[styles.articleHighlightText, isDarkMode && { color: '#90CDF4' }]}>💡 Özetle: Yapay zekayı tembellik yapmak veya kopyalamak için değil; öğrenme sürecini hızlandırmak, ufkunu genişletmek ve gelecekteki kariyerine yatırım yapmak için bir asistan olarak kullan.</Text>
                  </View>
                </View>
              ) : selectedContent?.id === 5 ? (
                <View style={styles.articleWrapper}>
                  <Text style={[styles.articleTitle, isDarkMode && { color: '#E2E8F0' }]}>Kariyer Planlaması: Geleceğini Şansa Bırakma</Text>
                  <Text style={[styles.articleIntro, isDarkMode && { color: '#CBD5E0' }]}>Kariyer planlaması sadece üniversiteden mezun olunca iş başvurusu yapmaktan ibaret değildir. Aksine, kariyer rotanı şimdiden çizerek rakiplerinin önüne geçebilirsin. Peki bu planlamayı nasıl yapmalısın?</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>1. Kendini Tanımakla Başla 🔍</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Her şeyin başı kendini bilmektir. Hangi derslerde başarılısın? İletişim becerilerin kuvvetli mi yoksa tek başına analitik işler yapmak mı seni daha çok tatmin ediyor? Kendi güçlü yönlerini ve geliştirilmesi gereken zayıf yönlerini dürüstçe analiz etmek atacağın en sağlam adımdır.</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>2. Staj, Kulüpler ve Çevre (Networking) 🤝</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Sadece ders çalışmak ve yüksek notlar almak artık yeterli değil. Üniversite yıllarında hatta lisede katıldığın öğrenci kulüpleri, gönüllülük projeleri ve yaptığın stajlar sana paha biçilemez deneyimler kazandırır. Erken yaşta oluşturduğun çevre (network), mezun olduğunda kapıları açacak en güçlü anahtardır.</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>3. Esnek Ol ve Alternatif Planlar Hazırla 🗺️</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Sadece tek bir hedefe kilitlenip diğer tüm yolları kapatmak büyük bir risktir. Dünyanın veya senin ilgi alanlarının değişebileceğini unutma. "Mühendislik olmazsa Veri Bilimi", "Tıp olmazsa Eczacılık" gibi esnek "B" ve "C" planlarının olması, yaşayacağın stresi büyük oranda azaltacaktır.</Text>

                  <View style={[styles.articleHighlight, isDarkMode && { backgroundColor: '#1A365D', borderLeftColor: '#63B3ED' }]}>
                    <Text style={[styles.articleHighlightText, isDarkMode && { color: '#90CDF4' }]}>💡 Özetle: Kariyer bir varış noktası değil, uzun bir yolculuktur. Hedeflerini belirle ama değişime de her zaman açık ol. En iyi kariyer, senin potansiyelini ve yeteneklerini en iyi yansıtan kariyerdir.</Text>
                  </View>
                </View>
              ) : selectedContent?.id === 6 ? (
                <View style={styles.articleWrapper}>
                  <Text style={[styles.articleTitle, isDarkMode && { color: '#E2E8F0' }]}>Sınav Stresiyle Başa Çıkma Sanatı 🌿</Text>
                  <Text style={[styles.articleIntro, isDarkMode && { color: '#CBD5E0' }]}>Sınav dönemi yaklaşırken kalp atışlarının hızlanması ve zamanın yetmeyeceği hissi tamamen doğaldır. Asıl mesele stresi tamamen sıfırlamak değil, onu seni ileri taşıyacak bir itici güce dönüştürmektir.</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>1. Stresi Kabul Et ve Sebebini Anla 🧘‍♀️</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Stres aslında vücudunun sana "bu konu benim için önemli" deme şeklidir. Ancak kontrolü kaybettiğinde bir engele dönüşür. Sınav anında "Ya başaramazsam?" düşüncesi aklına geldiğinde derhal o düşünceyi durdurup, "Şu an kontrol edebileceğim tek şey önümdeki bu soru" düşüncesine odaklan.</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>2. Nefes ve Mola Teknikleri (Pomodoro) ⏱️</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Saatlerce masadan kalkmadan çalışmak beynini yorar ve stresi artırır. 25 dakika çalışma ve 5 dakika mola (Pomodoro tekniği) gibi yöntemlerle zihnini taze tut. Mola anlarında telefona bakmak yerine, pencereyi açıp derin derin nefes alarak gözlerini uzaklara odakla.</Text>
                  
                  <Text style={[styles.articleSubHeading, isDarkMode && { color: '#F1F5F9' }]}>3. Uyku ve Beslenme Düzeni 🍎</Text>
                  <Text style={[styles.articleParagraph, isDarkMode && { color: '#A0AEC0' }]}>Uykusuz bir beyin, tehlike altındaymış gibi hisseder ve panik hormonları salgılar. Sınavdan önceki gece değil, aylar öncesinden günlük 7-8 saatlik kaliteli bir uyku rutini oluşturmalısın. Şekerli gıdalar yerine ceviz, badem ve bol su tüketimi dikkatini ve dinginliğini artıracaktır.</Text>

                  <View style={[styles.articleHighlight, isDarkMode && { backgroundColor: '#1A365D', borderLeftColor: '#63B3ED' }]}>
                    <Text style={[styles.articleHighlightText, isDarkMode && { color: '#90CDF4' }]}>💡 Özetle: Sınav sadece bir bilgi ölçümüdür, senin değerinin veya zekanın tek göstergesi değildir. Elinden gelenin en iyisini yap ve gerisini akışa bırak. Sen bir sınav sonucundan çok daha fazlasısın!</Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.modalLongText, { color: colors.textSecondary }]}>{selectedContent?.content}</Text>
              )}
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
  motivationWrapper: { marginTop: 5 },
  quoteBox: { backgroundColor: '#FDF4F4', padding: 20, borderRadius: 16, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#F28B82' },
  quoteTitle: { fontSize: 14, fontWeight: '700', color: '#D9534F', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  quoteText: { fontSize: 18, fontStyle: 'italic', fontWeight: '600', color: '#333', lineHeight: 26 },
  reminderBox: { backgroundColor: '#F4F8FE', padding: 20, borderRadius: 16, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#4A90E2' },
  reminderTitle: { fontSize: 14, fontWeight: '700', color: '#4A90E2', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  reminderText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  noteBox: { backgroundColor: '#FDF8E4', padding: 20, borderRadius: 16, marginBottom: 25, borderLeftWidth: 4, borderLeftColor: '#F5B041' },
  noteTitle: { fontSize: 14, fontWeight: '700', color: '#D68910', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  noteText: { fontSize: 15, fontWeight: '500', color: '#7E5109', lineHeight: 24 },
  refreshBtn: { backgroundColor: 'rgba(74, 144, 226, 0.1)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignItems: 'center', alignSelf: 'center', borderWidth: 1, borderColor: 'rgba(74, 144, 226, 0.3)', marginTop: 5, marginBottom: 15 },
  refreshBtnText: { color: '#4A90E2', fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  riasecWrapper: { marginTop: 5, paddingBottom: 20 },
  riasecIntro: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 20, fontStyle: 'italic', textAlign: 'center' },
  riasecCard: { padding: 18, borderRadius: 16, marginBottom: 15, borderLeftWidth: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  riasecHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  riasecIcon: { fontSize: 24, marginRight: 10 },
  riasecType: { fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  riasecField: { marginBottom: 10 },
  riasecLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  riasecValue: { fontSize: 15, color: '#334155', lineHeight: 22 },
  articleWrapper: { paddingVertical: 10, paddingHorizontal: 5, paddingBottom: 25 },
  articleTitle: { fontSize: 24, fontWeight: '300', fontStyle: 'italic', color: '#4A5568', letterSpacing: 0.5, marginBottom: 15, lineHeight: 32 },
  articleIntro: { fontSize: 16, color: '#475569', lineHeight: 26, marginBottom: 25, fontStyle: 'italic' },
  articleSubHeading: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 15, marginBottom: 8 },
  articleParagraph: { fontSize: 15, color: '#475569', lineHeight: 25, marginBottom: 15 },
  articleHighlight: { backgroundColor: '#F0F8FF', padding: 18, borderRadius: 12, borderLeftWidth: 5, borderLeftColor: '#4A90E2', marginTop: 15, marginBottom: 20 },
  articleHighlightText: { fontSize: 15, fontWeight: '600', color: '#1E40AF', lineHeight: 24 },
});

export default HomeScreen;