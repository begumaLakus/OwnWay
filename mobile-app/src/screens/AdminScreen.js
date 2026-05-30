import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, SafeAreaView, StatusBar,
} from 'react-native';
import api from './api';
import AdminUsersTab from './AdminUsersTab';
import AdminCitiesTab from './AdminCitiesTab';
import AdminUniversitiesTab from './AdminUniversitiesTab';
import AdminDepartmentsTab from './AdminDepartmentsTab';

const C = { bg:'#0F1117', surface:'#1A1D27', surface2:'#222636', border:'#2E3347', accent:'#6C63FF', teal:'#4ECDC4', warn:'#FFB347', danger:'#FF5C6C', success:'#4CAF7D', text:'#E8EAF6', muted:'#8B90A7' };

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[s.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={[s.statValue, { color }]}>{value ?? '—'}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const TABS = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'users',     icon: '👥', label: 'Kullanıcılar' },
  { key: 'cities',    icon: '🏙️',  label: 'Şehirler' },
  { key: 'unis',      icon: '🎓', label: 'Üniversiteler' },
  { key: 'depts',     icon: '📚', label: 'Bölümler' },
];

export default function AdminScreen({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headers = { Authorization: `Bearer ${user?.token}` };

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, uRes, cRes] = await Promise.all([
        api.get('/admin/stats', { headers }),
        api.get('/admin/users', { headers }),
        api.get('/admin/cities', { headers }),
      ]);
      if (sRes.data.success) setStats(sRes.data.data);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (cRes.data.success) setCities(cRes.data.data);
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.message || 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  if (loading) {
    return (
      <View style={s.loadingScreen}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={s.loadingText}>Admin paneli yükleniyor...</Text>
      </View>
    );
  }

  const tabContent = () => {
    const sharedProps = { cities, setCities, stats, setStats, headers };
    switch (tab) {
      case 'users':
        return <AdminUsersTab users={users} setUsers={setUsers} stats={stats} setStats={setStats} headers={headers} />;
      case 'cities':
        return <AdminCitiesTab {...sharedProps} />;
      case 'unis':
        return <AdminUniversitiesTab {...sharedProps} />;
      case 'depts':
        return <AdminDepartmentsTab {...sharedProps} />;
      default: // dashboard
        return (
          <View>
            <View style={s.statsGrid}>
              <StatCard icon="👥" label="Kullanıcı"    value={stats?.totalUsers}       color={C.accent} />
              <StatCard icon="🏙️" label="Şehir"        value={stats?.totalCities}      color={C.teal} />
              <StatCard icon="🎓" label="Üniversite"   value={stats?.totalUniversities} color={C.warn} />
              <StatCard icon="📚" label="Bölüm"        value={stats?.totalDepartments} color={C.success} />
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>📋 Son Kayıtlı Kullanıcılar</Text>
              {users.slice(-5).reverse().map(u => {
                const name = `${u.profile?.first_name||''} ${u.profile?.last_name||''}`.trim();
                const isAdmin = u.role === 'ADMIN';
                return (
                  <View key={u.id} style={s.recentRow}>
                    <View style={[s.avatar, { backgroundColor: isAdmin ? C.accent : C.surface2 }]}>
                      <Text style={s.avatarTxt}>{(name||u.email||'?')[0].toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.name}>{name || '—'}</Text>
                      <Text style={s.email}>{u.email}</Text>
                    </View>
                    <View style={[s.roleBadge, { backgroundColor: isAdmin ? 'rgba(108,99,255,.2)' : 'rgba(78,205,196,.15)' }]}>
                      <Text style={[s.roleText, { color: isAdmin ? C.accent : C.teal }]}>{u.role||'STUDENT'}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>🛡️ Admin Paneli</Text>
          <Text style={s.headerSub}>OwnWay Yönetim Sistemi</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
          <Text style={s.logoutTxt}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* TAB BAR */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBarWrap} contentContainerStyle={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab===t.key&&s.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[s.tabTxt, tab===t.key&&s.tabTxtActive]}>{t.icon} {t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* CONTENT */}
      <ScrollView
        style={s.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
        {tabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  loadingScreen: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: C.muted, marginTop: 14, fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,92,108,.12)', borderWidth: 1, borderColor: 'rgba(255,92,108,.3)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  logoutTxt: { color: C.danger, fontSize: 13, fontWeight: '600' },
  tabBarWrap: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, maxHeight: 50 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 8 },
  tab: { paddingVertical: 14, paddingHorizontal: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: C.accent },
  tabTxt: { color: C.muted, fontSize: 12, fontWeight: '500' },
  tabTxtActive: { color: C.accent, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '700', letterSpacing: -1 },
  statLabel: { fontSize: 12, color: C.muted, marginTop: 2 },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 14 },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  avatar: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTxt: { color: C.text, fontWeight: '700', fontSize: 16 },
  name: { fontSize: 14, fontWeight: '600', color: C.text },
  email: { fontSize: 12, color: C.muted, marginTop: 1 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  roleText: { fontSize: 11, fontWeight: '700' },
});
