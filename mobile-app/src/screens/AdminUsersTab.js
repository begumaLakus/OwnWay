import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from './api';

const C = { bg:'#0F1117', surface:'#1A1D27', surface2:'#222636', border:'#2E3347', accent:'#6C63FF', teal:'#4ECDC4', warn:'#FFB347', danger:'#FF5C6C', success:'#4CAF7D', text:'#E8EAF6', muted:'#8B90A7' };

export default function AdminUsersTab({ users, setUsers, stats, setStats, headers }) {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.email||'').toLowerCase().includes(q) ||
      (u.profile?.first_name||'').toLowerCase().includes(q) ||
      (u.profile?.last_name||'').toLowerCase().includes(q);
  });

  const handleDelete = (u) => {
    const name = `${u.profile?.first_name||''} ${u.profile?.last_name||''}`.trim() || u.email;
    Alert.alert('Kullanıcı Sil', `"${name}" silinsin mi? Bu işlem geri alınamaz!`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Evet, Sil', style: 'destructive', onPress: async () => {
        try {
          setLoadingId(u.id);
          await api.delete(`/admin/users/${u.id}`, { headers });
          setUsers(prev => prev.filter(x => x.id !== u.id));
          if (stats) setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
          Alert.alert('✅', 'Kullanıcı silindi.');
        } catch (e) {
          Alert.alert('Hata', e?.response?.data?.message || 'Silinemedi.');
        } finally { setLoadingId(null); }
      }},
    ]);
  };

  const handleRoleToggle = (u) => {
    const newRole = u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    const name = `${u.profile?.first_name||''} ${u.profile?.last_name||''}`.trim() || u.email;
    Alert.alert('Rol Değiştir', `"${name}" kullanıcısının rolü ${newRole} yapılsın mı?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Evet', onPress: async () => {
        try {
          setLoadingId(u.id + 'role');
          await api.patch(`/admin/users/${u.id}/role`, { role: newRole }, { headers });
          setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
        } catch (e) {
          Alert.alert('Hata', e?.response?.data?.message || 'Güncellenemedi.');
        } finally { setLoadingId(null); }
      }},
    ]);
  };

  return (
    <View style={s.card}>
      <TextInput style={s.search} placeholder="🔍  İsim veya e-posta ara..." placeholderTextColor={C.muted} value={search} onChangeText={setSearch} />
      <Text style={s.count}>{filtered.length} kullanıcı</Text>
      <ScrollView>
        {filtered.map(u => {
          const name = `${u.profile?.first_name||''} ${u.profile?.last_name||''}`.trim() || '—';
          const isAdmin = u.role === 'ADMIN';
          const roleLoading = loadingId === u.id + 'role';
          const delLoading = loadingId === u.id;
          return (
            <View key={u.id} style={s.row}>
              <View style={[s.avatar, { backgroundColor: isAdmin ? C.accent : C.surface2 }]}>
                <Text style={s.avatarTxt}>{name[0]?.toUpperCase()||'?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{name}</Text>
                <Text style={s.email}>{u.email}</Text>
                {u.profile?.current_location ? <Text style={s.loc}>📍 {u.profile.current_location}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <TouchableOpacity style={[s.roleBadge, { backgroundColor: isAdmin ? 'rgba(108,99,255,.2)' : 'rgba(78,205,196,.15)' }]} onPress={() => handleRoleToggle(u)} disabled={!!loadingId}>
                  {roleLoading ? <ActivityIndicator size="small" color={C.accent} /> : <Text style={[s.roleText, { color: isAdmin ? C.accent : C.teal }]}>{u.role||'STUDENT'}</Text>}
                </TouchableOpacity>
                {!isAdmin && (
                  <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(u)} disabled={!!loadingId}>
                    {delLoading ? <ActivityIndicator size="small" color={C.danger} /> : <Text style={s.delTxt}>🗑 Sil</Text>}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  search: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14, marginBottom: 12 },
  count: { fontSize: 12, color: C.muted, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  avatar: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTxt: { color: C.text, fontWeight: '700', fontSize: 16 },
  name: { fontSize: 14, fontWeight: '600', color: C.text },
  email: { fontSize: 12, color: C.muted, marginTop: 1 },
  loc: { fontSize: 11, color: C.muted, marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, minWidth: 60, alignItems: 'center' },
  roleText: { fontSize: 11, fontWeight: '700' },
  delBtn: { backgroundColor: 'rgba(255,92,108,.1)', borderWidth: 1, borderColor: 'rgba(255,92,108,.25)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  delTxt: { color: C.danger, fontSize: 11, fontWeight: '600' },
});
