import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
// 🎯questions.js dosyasından 48 soruyu çeken alan[cite: 1]:
import { personalityQuestions } from '../data/questions'; 
// 🎯 Kendi Mac IP'sinin olduğu axios bağlantı dosyan:
import api from './api'; 

export default function PersonalityTestScreen({ navigation }) {
  // Şu an kullanıcının hangi soruda olduğunu tutan state (0 = 1. Soru)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Verilen tüm cevapları { soru_id: puan } şeklinde tutan nesne
  const [answers, setAnswers] = useState({}); 
  // Backend'e veri gönderirken loading animasyonu göstermek için
  const [loading, setLoading] = useState(false);

  const currentQuestion = personalityQuestions[currentQuestionIndex];
  const totalQuestions = personalityQuestions.length;

  // Kullanıcı 1-5 arası bir puana tıkladığında çalışacak fonksiyon
  const handleAnswer = (score) => {
    // Yeni cevabı mevcut cevapların üzerine ekle
    setAnswers({ ...answers, [currentQuestion.id]: score });

    // Eğer daha cevaplanacak soru varsa otomatik olarak bir sonraki soruya geç
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Test bittiğinde sonuçları arkadaşının backend kısmına gönderecek fonksiyon
  const submitTest = async () => {
    setLoading(true);
    try {
      // 🚨 Arkadaşının backend tarafında açacağı endpoint adresi: /api/test/submit
      const response = await api.post('/test/submit', {
        answers: answers // Kullanıcının tüm cevaplarını nesne olarak gönderiyoruz
      });

      if (response.data && response.data.success) {
        // Backend hesaplama yapıp bize en uygun 3 mesleği dizi olarak dönecek
        const [m1, m2, m3] = response.data.recommendations;
        
        Alert.alert(
          "Analiz Sonucu 🎉",
          `Kişiliğinize En Uygun 3 Meslek:\n\n1. 💼 ${m1}\n2. 💼 ${m2}\n3. 💼 ${m3}`,
          [{ text: "Harika, Teşekkürler!", onPress: () => navigation.navigate('Profile') }]
        );
      }
    } catch (error) {
      console.error("Test gönderme hatası:", error);
      Alert.alert("Hata", "Test sonuçları veritabanına gönderilirken bir hata oluştu kanka.");
    } finally {
      setLoading(false);
    }
  };

  // Eğer arka planda veri gönderiliyorsa ekranda loading dönsün
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Kişilik analizi yapılıyor ve veritabanına kaydediliyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* İlerleme Durumu */}
      <Text style={styles.progressText}>Soru {currentQuestionIndex + 1} / {totalQuestions}</Text>
      
      {/* Soru Alanı */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>
      </View>

      {/* 1-5 Arası Puanlama Butonları (Likert Skalası) */}
      <Text style={styles.hintText}>Bu aktiviteyi yapmaktan ne kadar keyif alırsınız?</Text>
      <View style={styles.optionsContainer}>
        {[
          { label: "❌ Hiç Sevmem", score: 1 },
          { label: "📉 Az Severim", score: 2 },
          { label: "😐 Fark Etmez / Nötr", score: 3 },
          { label: "📈 Severim", score: 4 },
          { label: "🔥 Çok Severim", score: 5 },
        ].map((item) => {
          // Eğer kullanıcı bu soruya daha önce cevap verdiyse butonu vurgulamak için
          const isSelected = answers[currentQuestion.id] === item.score;
          return (
            <TouchableOpacity 
              key={item.score} 
              style={[styles.optionButton, isSelected && styles.selectedOptionButton]} 
              onPress={() => handleAnswer(item.score)}
            >
              <Text style={[styles.optionButtonText, isSelected && styles.selectedOptionText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Alt Gezinme Çubuğu (Geri Gelme ve Testi Bitirme) */}
      <View style={styles.footerRow}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          >
            <Text style={styles.backButtonText}>⬅️ Önceki Soru</Text>
          </TouchableOpacity>
        )}

        {/* Sadece 48 sorunun tamamı cevaplandığında ortaya çıkan buton */}
        {Object.keys(answers).length === totalQuestions && (
          <TouchableOpacity style={styles.submitButton} onPress={submitTest}>
            <Text style={styles.submitButtonText}>Analiz Et ve Bitir 🚀</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FA', padding: 20, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  progressText: { fontSize: 14, color: '#6C757D', textAlign: 'center', marginBottom: 10, fontWeight: '600' },
  questionCard: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 16, marginBottom: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  questionText: { fontSize: 18, fontWeight: 'bold', color: '#212529', textAlign: 'center', lineHeight: 26 },
  hintText: { fontSize: 14, color: '#495057', textAlign: 'center', marginBottom: 15, fontWeight: '500' },
  optionsContainer: { gap: 12 },
  optionButton: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E9ECEF' },
  selectedOptionButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  optionButtonText: { color: '#495057', fontSize: 16, fontWeight: '600' },
  selectedOptionText: { color: '#FFFFFF' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, alignItems: 'center', minHeight: 50 },
  backButton: { padding: 10 },
  backButtonText: { color: '#6C757D', fontSize: 14, fontWeight: '600' },
  submitButton: { backgroundColor: '#28A745', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginLeft: 'auto' },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  loadingText: { marginTop: 15, fontSize: 15, color: '#495057', fontWeight: '500', textAlign: 'center', paddingHorizontal: 30 }
});