import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import api from './api';

const TestScreen = ({ navigation }) => {
  const [answers, setAnswers] = useState({}); 
  const [loading, setLoading] = useState(false);

  // Görseldeki soruların mantıksal karşılığı (UI tarafında bunları zaten gösteriyorsun)
  const questions = [
    { id: 1, category: "culture" },
    { id: 2, category: "modern" },
    { id: 3, category: "social" },
    { id: 4, category: "nature" },
    { id: 5, category: "culture" },
    { id: 6, category: "modern" },
    { id: 7, category: "social" },
    { id: 8, category: "nature" },
  ];

  const handleFinish = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert("Uyarı", "Lütfen tüm soruları cevaplayın.");
      return;
    }

    setLoading(true);

    // 1. JSON FORMATINDA PUANLAMA MANTIĞI
    // Begüm'ün şemasına (culture_w, nature_w vb.) tam uyumlu obje oluşturuyoruz
    let finalScores = {
      culture_w: 0,
      nature_w: 0,
      social_w: 0,
      modern_w: 0
    };

    // Her kategorinin kaç soru içerdiğini sayıyoruz (ortalama almak için)
    let counts = { culture: 0, nature: 0, social: 0, modern: 0 };

    questions.forEach(q => {
      const score = answers[q.id] || 0; // Seçilen şıkkın değeri (1-4 arası)
      // 4 seçenek olduğu için (puan / 4) * 100 yaparak 100'lük sisteme çeviriyoruz
      const normalizedScore = (score / 4) * 100; 

      if (q.category === "culture") { finalScores.culture_w += normalizedScore; counts.culture++; }
      if (q.category === "nature") { finalScores.nature_w += normalizedScore; counts.nature++; }
      if (q.category === "social") { finalScores.social_w += normalizedScore; counts.social++; }
      if (q.category === "modern") { finalScores.modern_w += normalizedScore; counts.modern++; }
    });

    // Kategorilerin ortalamasını alarak tam 0-100 arası nihai JSON'u hazırlıyoruz
    const payload = {
      culture_w: Math.round(finalScores.culture_w / counts.culture),
      nature_w: Math.round(finalScores.nature_w / counts.nature),
      social_w: Math.round(finalScores.social_w / counts.social),
      modern_w: Math.round(finalScores.modern_w / counts.modern),
    };

    try {
      // 2. Begüm'e giden JSON: payload
      const response = await api.post('/test/submit', payload); // Backend test endpointinize göre burayı güncelleyin
      navigation.navigate('ResultScreen', { cities: response.data });
    } catch (error) {
      console.log(error);
      Alert.alert("Hata", "Puanlar gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerText}>Şehir Önerisi Testi</Text>
      
      {/* Senin mevcut görsel tasarımın burada devam ediyor */}
      {questions.map((q) => (
        <View key={q.id} style={styles.questionBox}>
          <Text style={styles.questionText}>Soru {q.id}</Text>
          <View style={styles.optionsContainer}>
            {[1, 2, 3, 4].map((val) => (
              <TouchableOpacity 
                key={val} 
                style={[styles.optionButton, answers[q.id] === val && styles.selectedOption]}
                onPress={() => setAnswers({...answers, [q.id]: val})}
              >
                <Text style={answers[q.id] === val ? styles.selectedText : styles.optionText}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={handleFinish} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Testi Bitir</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

// ... styles aynı kalıyor

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBFF' },
  contentContainer: { padding: 20, paddingBottom: 50 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#4A90E2', marginBottom: 20, textAlign: 'center' },
  questionBox: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  questionText: { fontSize: 16, marginBottom: 10, color: '#333' },
  optionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  optionButton: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center' },
  selectedOption: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  optionText: { color: '#666' },
  selectedText: { color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#4A90E2', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});

export default TestScreen;