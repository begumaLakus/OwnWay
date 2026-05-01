import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const JobScreen = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  const jobs = [
    {
      id: 1,
      title: "Bilgisayar Mühendisliği",
      image: require('../../assets/images/bilgisayar.jpg'),
      character: "Analitik, Meraklı, Sistemci",
      desc: "Mantıksal düşünme becerisi yüksek, karmaşık problemleri parçalara ayırarak çözmeyi seven ve sürekli gelişen teknolojiye adapte olabilen bireyler içindir.",
      color: "#E8F0FE" // Soft Mavi
    },
    {
      id: 2,
      title: "Tıp",
      image: require('../../assets/images/tip.jpg'),
      character: "Özverili, Dikkatli, Dayanıklı",
      desc: "Yüksek sorumluluk bilincine sahip, insan hayatına dokunmayı seven, yoğun çalışma temposunda bile soğukkanlılığını koruyabilen karakterler için uygundur.",
      color: "#FFF5F5" // Soft Kırmızı/Pembe
    },
    {
      id: 3,
      title: "Hukuk",
      image: require('../../assets/images/hukuk.jpg'),
      character: "Adaletli, İkna Edici, Detaycı",
      desc: "Güçlü bir hafıza ve analiz yeteneğine sahip, haksızlıklara karşı duyarlı, okumayı ve araştırmayı seven, hitabet yönü güçlü bireylerin alanıdır.",
      color: "#FDF7F2" // Beije Krem
    },
    {
      id: 4,
      title: "Psikoloji",
      image: require('../../assets/images/psikoloji.jpeg'),
      character: "Empatik, Sabırlı, İyi Dinleyici",
      desc: "İnsan davranışlarının nedenlerini merak eden, yargılamadan dinleyebilen, sezgileri güçlü ve duygusal zekası yüksek kişiler için ideal bir meslektir.",
      color: "#F0F4F8" // Soft Gri/Mavi
    },
    {
  id: 5,
  title: "Felsefe",
  image: require('../../assets/images/felsefe.jpg'),
  character: "Sorgulayıcı, Analitik, Vizyoner",
  desc: "Dünyayı, varoluşu ve bilgiyi derinlemesine sorgulayan, eleştirel düşünme yeteneği gelişmiş ve görünenin ötesindeki anlamları keşfetmeyi seven zihinler içindir.",
  color: "#FDF5E6" // Old Lace (Felsefenin klasik dokusuna uygun, hafif eskitme kağıt tonu)
}
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meslek Kütüphanesi</Text>
        <Text style={styles.headerSubtitle}>Karakterine en yakın olanı keşfet.</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {jobs.map((job) => (
          <TouchableOpacity 
            key={job.id} 
            style={[styles.jobCard, { backgroundColor: job.color }]}
            onPress={() => setSelectedJob(job)}
          >
            <View>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobCharShort}>{job.character}</Text>
            </View>
            <View style={styles.arrowCircle}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meslek Detay Modalı */}
      <Modal visible={selectedJob !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image 
  source={typeof selectedJob?.image === 'string' ? { uri: selectedJob.image } : selectedJob?.image} 
  style={styles.jobImage} 
/>
            
            <View style={styles.paddingArea}>
              <Text style={styles.modalTitle}>{selectedJob?.title}</Text>
              
              <View style={styles.tag}>
                <Text style={styles.tagText}>✨ {selectedJob?.character}</Text>
              </View>

              <Text style={styles.modalDesc}>{selectedJob?.desc}</Text>

              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSelectedJob(null)}
              >
                <Text style={styles.closeButtonText}>Anladım</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: { paddingHorizontal: 25, marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#333', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 16, color: '#8E8E93', marginTop: 5 },
  list: { paddingHorizontal: 25, paddingBottom: 100 },
  jobCard: { 
    padding: 25, 
    borderRadius: 24, 
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    // Minimal Gölge
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  jobTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  jobCharShort: { fontSize: 13, color: '#666', marginTop: 4, fontWeight: '500' },
  arrowCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center' },
  arrow: { fontSize: 18, color: '#4A90E2', fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, height: '85%' },
  jobImage: { width: '100%', height: 300, borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  paddingArea: { padding: 30 },
  modalTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  tag: { backgroundColor: '#F0F4F8', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginVertical: 15, alignSelf: 'flex-start' },
  tagText: { color: '#4A90E2', fontWeight: '600', fontSize: 14 },
  modalDesc: { fontSize: 17, color: '#555', lineHeight: 26, marginBottom: 30 },
  closeButton: { backgroundColor: '#4A90E2', padding: 20, borderRadius: 20, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default JobScreen;