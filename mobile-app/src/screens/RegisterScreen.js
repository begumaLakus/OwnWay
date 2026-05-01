import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from './api';

const RegisterScreen = ({ onRegister, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password_hash: '',
    role: 'student',
    first_name: '',
    last_name: '',
    current_location: '',
    high_school: '',
    dept_type: '',
    financial_status: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    const requiredFields = [
      'email',
      'password_hash',
      'first_name',
      'last_name',
      'current_location',
      'high_school',
      'dept_type',
    ];

    const hasEmptyRequired = requiredFields.some((field) => !String(formData[field] || '').trim());
    if (hasEmptyRequired) {
      Alert.alert('Hata', 'Lutfen zorunlu alanlari doldurun.');
      return;
    }

    setLoading(true);
    try {
      const registerPayload = {
        email: formData.email.trim(),
        password: formData.password_hash,
      };
      await api.post('/auth/register', registerPayload);

      const loginResponse = await api.post('/auth/login', registerPayload);
      const token = loginResponse?.data?.data?.token;

    
      const profilePayload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        current_location: formData.current_location.trim(),
        high_school: formData.high_school.trim(),
        dept_type: formData.dept_type.trim(),
        financial_status: formData.financial_status, // parsedFinancialStatus yerine direkt kendisini yaz
      };

      await api.put('/user/profile', profilePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onRegister({
        email: registerPayload.email,
        token,
        first_name: profilePayload.first_name,
        last_name: profilePayload.last_name,
        current_location: profilePayload.current_location,
        high_school: profilePayload.high_school,
        dept_type: profilePayload.dept_type,
        personality_type: null,
        financial_status: profilePayload.financial_status,
      });
    } catch (error) {
      const backendMessage = error?.response?.data?.message || '';
      let userMessage = 'Kayit islemi basarisiz oldu. Sunucuyu kontrol et.';

      if (backendMessage.includes('DATABASE_URL')) {
        userMessage = 'Sunucu veritabani baglantisi hazir degil. Biraz sonra tekrar dene.';
      } else if (backendMessage) {
        userMessage = backendMessage;
      }

      Alert.alert(
        'Kayit Hatasi',
        userMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* BAŞLIK */}
      <View style={styles.header}>
        <Text style={styles.logoText}>OwnWay</Text>
        <Text style={styles.subTitle}>Kayıt Formu</Text>
      </View>

      {/* FORM ALANLARI */}
      <View style={styles.inputGroup}>
        <TextInput 
          placeholder="Ad" 
          style={styles.input} 
          placeholderTextColor="#C7C7CD" 
          value={formData.first_name}
          onChangeText={(v) => updateField('first_name', v)} 
        />
        <TextInput 
          placeholder="Soyad" 
          style={styles.input} 
          placeholderTextColor="#C7C7CD" 
          value={formData.last_name}
          onChangeText={(v) => updateField('last_name', v)}
        />
        <TextInput 
          placeholder="E-posta" 
          style={styles.input} 
          keyboardType="email-address" 
          placeholderTextColor="#C7C7CD" 
          value={formData.email}
          onChangeText={(v) => updateField('email', v)}
        />
        
        <TextInput 
          placeholder="Sifre" 
          style={styles.input} 
          secureTextEntry={true} 
          placeholderTextColor="#C7C7CD" 
          value={formData.password_hash}
          onChangeText={(v) => updateField('password_hash', v)}
        />
        
        <TextInput 
          placeholder="Sehir" 
          style={styles.input} 
          placeholderTextColor="#C7C7CD" 
          value={formData.current_location}
          onChangeText={(v) => updateField('current_location', v)}
        />
        <TextInput 
          placeholder="Lise" 
          style={styles.input} 
          placeholderTextColor="#C7C7CD" 
          value={formData.high_school}
          onChangeText={(v) => updateField('high_school', v)}
        />
        <TextInput 
          placeholder="Bolum Turu" 
          style={styles.input} 
          placeholderTextColor="#C7C7CD" 
          value={formData.dept_type}
          onChangeText={(v) => updateField('dept_type', v)}
        />

        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, alignSelf: 'flex-start', marginLeft: 5 }}>Finansal Durum</Text>
<View style={{ flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 15, padding: 5, marginBottom: 20, width: '100%' }}>
  {['Düşük', 'Orta', 'Yüksek'].map((status) => (
    <TouchableOpacity
      key={status}
      style={{
        flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12,
        backgroundColor: formData.financial_status === status ? '#FFF' : 'transparent',
        elevation: formData.financial_status === status ? 3 : 0
      }}
      onPress={() => updateField('financial_status', status)}
    >
      <Text style={{ 
        color: formData.financial_status === status ? '#4A90E2' : '#888', 
        fontWeight: formData.financial_status === status ? 'bold' : '600' 
      }}>
        {status}
      </Text>
    </TouchableOpacity>
  ))}
</View>
      </View>

      <TouchableOpacity 
        style={styles.mainButton} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainButtonText}>Devam Et</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
        <Text style={styles.backButtonText}>Geri Dön</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF7F2' },
  scrollContent: { paddingHorizontal: 35, alignItems: 'center', paddingTop: 60 },
  header: { marginBottom: 30, alignItems: 'center' },
  logoText: { fontSize: 45, fontWeight: 'bold', color: '#4A90E2' },
  subTitle: { fontSize: 18, color: '#8E8E93', marginTop: 5 },
  inputGroup: { width: '100%' },
  input: { 
    width: '100%', backgroundColor: '#FFF', height: 52, borderRadius: 15, 
    paddingHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' 
  },
  mainButton: { 
    width: '100%', backgroundColor: '#4A90E2', height: 45, borderRadius: 18, 
    justifyContent: 'center', alignItems: 'center', marginTop: 10  
  },
  mainButtonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  backButton: { marginTop: 20, padding: 10 },
  backButtonText: { color: '#8E8E93', fontSize: 14 }
});

export default RegisterScreen;