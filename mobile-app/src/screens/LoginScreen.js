import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import api from './api';

const LoginScreen = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Yükleniyor durumu için

  const handleLogin = async () => {
  setLoading(true);
  try {
    const response = await api.post('/auth/login', {
      email: email.trim(),
      password,
    });

    const data = response.data.data; // { token, first_name, last_name, email, ... }

    onLogin({
      token: data.token,
      email: data.email,
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      current_location: data.current_location || "-",
      high_school: data.high_school || "-",
      dept_type: data.dept_type || "-",
      personality_type: data.personality_type || "-",
    });

    Alert.alert("Başarılı", `Hoş geldin, ${data.first_name || ""}!`);
  } catch (error) {
    const errorMsg = error?.response?.data?.message || "Giriş başarısız.";
    Alert.alert("Giriş Hatası", errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>OwnWay</Text>
        <Text style={styles.subtitle}>Geleceğine Yol Çiz</Text>
      </View>

      <View style={styles.form}>
        <TextInput 
          style={styles.input}
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && { backgroundColor: '#A0C4FF' }]} 
          onPress={handleLogin}
          disabled={loading} // Yüklenirken butonu deaktif et
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToRegister} style={styles.registerBtn}>
          <Text style={styles.registerText}>
            Hesabın yok mu? <Text style={styles.boldText}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF7F2', justifyContent: 'center', padding: 30 },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 42, fontWeight: 'bold', color: '#4A90E2' },
  subtitle: { fontSize: 16, color: '#8E8E93', marginTop: 5 },
  form: { width: '100%' },
  input: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 15, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#F0E0D0'
  },
  button: { 
    backgroundColor: '#4A90E2', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  registerBtn: { marginTop: 25, alignItems: 'center' },
  registerText: { color: '#8E8E93', fontSize: 15 },
  boldText: { color: '#4A90E2', fontWeight: 'bold' }
});

export default LoginScreen;