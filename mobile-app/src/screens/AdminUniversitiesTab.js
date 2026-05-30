import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import api from './api';

const C = { bg:'#0F1117', surface:'#1A1D27', surface2:'#222636', border:'#2E3347', accent:'#6C63FF', teal:'#4ECDC4', warn:'#FFB347', danger:'#FF5C6C', success:'#4CAF7D', text:'#E8EAF6', muted:'#8B90A7' };
const EMPTY = { city_id:'', uni_name:'', uni_type:'Devlet', has_campus:'true', campus_count:'1' };

export default function AdminUniversitiesTab({ cities, setCities, stats, setStats, headers }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedCity, setExpandedCity] = useState(null);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setModalVisible(true); };
  const openEdit = (uni) => {
    setEditTarget(uni);
    setForm({ city_id: String(uni.city_id||''), uni_name: uni.uni_name||'', uni_type: uni.uni_type||'Devlet', has_campus: String(uni.has_campus??true), campus_count: String(uni.campus_count||1) });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.uni_name.trim()) { Alert.alert('Hata','Üniversite adı zorunludur.'); return; }
    if (!form.city_id) { Alert.alert('Hata','Şehir seçimi zorunludur.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, city_id: parseInt(form.city_id), has_campus: form.has_campus === 'true', campus_count: parseInt(form.campus_count)||1 };
      if (editTarget) {
        const res = await api.put(`/admin/universities/${editTarget.id}`, payload, { headers });
        setCities(prev => prev.map(c => ({
          ...c,
          universities: c.universities?.map(u => u.id === editTarget.id ? { ...u, ...res.data.data } : u) || []
        })));
        Alert.alert('✅','Üniversite güncellendi.');
      } else {
        const res = await api.post('/admin/universities', payload, { headers });
        const newUni = { ...res.data.data, departments: [] };
        setCities(prev => prev.map(c => c.id === newUni.city_id ? { ...c, universities: [...(c.universities||[]), newUni] } : c));
        if (stats) setStats(p => ({ ...p, totalUniversities: p.totalUniversities + 1 }));
        Alert.alert('✅','Üniversite eklendi.');
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.message || 'İşlem başarısız.');
    } finally { setSaving(false); }
  };

  const handleDelete = (uni) => {
    const deptCount = uni.departments?.length || 0;
    Alert.alert('Üniversite Sil', `"${uni.uni_name}" silinsin mi?\n${deptCount>0?`⚠️ ${deptCount} bölüm de silinecek!`:''}`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          setDeletingId(uni.id);
          await api.delete(`/admin/universities/${uni.id}`, { headers });
          setCities(prev => prev.map(c => ({ ...c, universities: c.universities?.filter(u => u.id !== uni.id)||[] })));
          if (stats) setStats(p => ({ ...p, totalUniversities: p.totalUniversities - 1, totalDepartments: p.totalDepartments - (uni.departments?.length||0) }));
          Alert.alert('✅','Üniversite silindi.');
        } catch (e) {
          Alert.alert('Hata', e?.response?.data?.message||'Silinemedi.');
        } finally { setDeletingId(null); }
      }},
    ]);
  };

  return (
    <View>
      <TouchableOpacity style={s.addBtn} onPress={openCreate}>
        <Text style={s.addBtnTxt}>➕ Yeni Üniversite Ekle</Text>
      </TouchableOpacity>

      {cities.map(c => {
        const unis = c.universities || [];
        if (unis.length === 0) return null;
        const isExpanded = expandedCity === c.id;
        return (
          <View key={c.id} style={s.groupCard}>
            <TouchableOpacity style={s.groupHeader} onPress={() => setExpandedCity(isExpanded ? null : c.id)}>
              <Text style={s.groupTitle}>🏙️ {c.city_name}</Text>
              <Text style={s.groupCount}>{unis.length} üni  {isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {isExpanded && unis.map(uni => (
              <View key={uni.id} style={s.uniRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.uniName}>{uni.uni_name}</Text>
                  <Text style={s.uniMeta}>{uni.uni_type||'—'} • {uni.departments?.length||0} bölüm</Text>
                </View>
                <TouchableOpacity style={s.editBtn} onPress={() => openEdit(uni)}>
                  <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(uni)} disabled={deletingId===uni.id}>
                  {deletingId===uni.id ? <ActivityIndicator size="small" color={C.danger}/> : <Text>🗑️</Text>}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      })}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.sheet}>
            <View style={s.drag} />
            <Text style={s.modalTitle}>{editTarget ? '✏️ Üniversite Düzenle' : '➕ Yeni Üniversite'}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={s.label}>Şehir Seç</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                {cities.map(c => (
                  <TouchableOpacity key={c.id} style={[s.chipBtn, form.city_id===String(c.id)&&s.chipActive]} onPress={() => setForm(p=>({...p,city_id:String(c.id)}))}>
                    <Text style={[s.chipTxt, form.city_id===String(c.id)&&{color:'#FFF'}]}>{c.city_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.label}>Üniversite Adı</Text>
              <TextInput style={s.input} value={form.uni_name} onChangeText={v=>setForm(p=>({...p,uni_name:v}))} placeholder="Üniversite adı" placeholderTextColor={C.muted} />
              <Text style={s.label}>Tür</Text>
              <View style={{ flexDirection:'row', gap:8, marginTop:4 }}>
                {['Devlet','Vakıf'].map(t => (
                  <TouchableOpacity key={t} style={[s.chipBtn, form.uni_type===t&&s.chipActive]} onPress={() => setForm(p=>({...p,uni_type:t}))}>
                    <Text style={[s.chipTxt, form.uni_type===t&&{color:'#FFF'}]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.label}>Kampüs Sayısı</Text>
              <TextInput style={s.input} value={form.campus_count} onChangeText={v=>setForm(p=>({...p,campus_count:v}))} placeholder="1" placeholderTextColor={C.muted} keyboardType="number-pad" />
            </ScrollView>
            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelTxt}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, saving&&{opacity:0.6}]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" size="small"/> : <Text style={s.saveTxt}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  addBtn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  addBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  groupCard: { backgroundColor: C.surface, borderRadius: 14, padding: 0, borderWidth: 1, borderColor: C.border, marginBottom: 12, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  groupTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  groupCount: { fontSize: 12, color: C.muted },
  uniRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, gap: 8 },
  uniName: { fontSize: 13, fontWeight: '600', color: C.text },
  uniMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  editBtn: { backgroundColor: 'rgba(108,99,255,.15)', borderRadius: 8, padding: 8 },
  delBtn: { backgroundColor: 'rgba(255,92,108,.1)', borderRadius: 8, padding: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  drag: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', color: C.muted, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14 },
  chipBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, marginRight: 8 },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipTxt: { color: C.muted, fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, backgroundColor: C.surface2, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelTxt: { color: C.muted, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: C.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveTxt: { color: '#FFF', fontWeight: '700' },
});
