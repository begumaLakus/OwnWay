import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from './api';

export default function AdminDashboardScreen({ navigation, user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (response.data && response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      Alert.alert("Hata", "Kullanıcı listesi backend'den çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (response.data && response.data.success) {
        Alert.alert("Başarılı", "Kullanıcı sistemden tamamen temizlendi.");
        fetchUsers();
      }
    } catch (error) {
      Alert.alert("İşlem Başarısız", "Admin yetkiniz geçersiz veya bir hata oluştu.");
    }
  };

  const confirmDelete = (userId, email) => {
    Alert.alert(
      "Kullanıcıyı Sil",
      `${email} adresli kullanıcıyı silmek istediğinize emin misiniz?`,
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Evet, Sil", style: "destructive", onPress: () => handleDeleteUser(userId) }
      ]
    );
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ Sistem Yönetim Paneli</Text>
        <Text style={styles.subTitle}>Toplam Kayıtlı Üye: {users.length}</Text>
        {onLogout && (
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>📧 {item.email || "E-posta Yok"}</Text>
              <Text style={styles.userName}>👤 {item.profile?.first_name ? `${item.profile.first_name} ${item.profile.last_name || ''}` : "Profil Doldurulmamış"}</Text>
              <Text style={styles.userRole}>🔑 Rol: <Text style={styles.roleTag}>{item.role || 'user'}</Text></Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id, item.email)}>
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Sistemde kayıtlı kullanıcı bulunamadı.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 16, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E9ECEF', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#212529', textAlign: 'center' },
  subTitle: { fontSize: 14, color: '#6C757D', textAlign: 'center', marginTop: 4 },
  userCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 2 },
  userInfo: { flex: 1 },
  userEmail: { fontSize: 16, fontWeight: '600', color: '#495057' },
  userName: { fontSize: 14, color: '#6C757D', marginTop: 4 },
  userRole: { fontSize: 13, color: '#495057', marginTop: 4 },
  roleTag: { fontWeight: 'bold', color: '#007AFF' },
  deleteButton: { backgroundColor: '#DC3545', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  deleteButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#6C757D', marginTop: 40, fontSize: 16 },
  logoutBtn: { marginTop: 10, alignSelf: 'center', backgroundColor: '#FFF5F5', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 12 },
  logoutText: { color: '#DC3545', fontWeight: 'bold', fontSize: 14 },
});
