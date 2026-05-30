import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import api from './api';

const C = { bg:'#0F1117', surface:'#1A1D27', surface2:'#222636', border:'#2E3347', accent:'#6C63FF', teal:'#4ECDC4', warn:'#FFB347', danger:'#FF5C6C', success:'#4CAF7D', text:'#E8EAF6', muted:'#8B90A7' };
const EMPTY = { uni_id:'', dept_name:'', language:'Türkçe', quota:'', base_score:'', base_rank:'' };

export default function AdminDepartmentsTab({ cities, setCities, stats, setStats, headers }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedUni, setExpandedUni] = useState(null);

  // Flatten all universities for quick lookup
  const allUnis = cities.flatMap(c => (c.universities||[]).map(u => ({ ...u, city_name: c.city_name })));

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setModalVisible(true); };
  const openEdit = (dept, uniId) => {
    setEditTarget({ ...dept, uni_id: uniId });
    setForm({ uni_id: String(uniId), dept_name: dept.dept_name||'', language: dept.language||'Türkçe', quota: String(dept.quota||''), base_score: String(dept.base_score||''), base_rank: String(dept.base_rank||'') });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.dept_name.trim()) { Alert.alert('Hata','Bölüm adı zorunludur.'); return; }
    if (!form.uni_id) { Alert.alert('Hata','Üniversite seçimi zorunludur.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, uni_id: parseInt(form.uni_id), quota: parseInt(form.quota)||0, base_score: parseFloat(form.base_score)||0, base_rank: parseInt(form.base_rank)||0 };
      if (editTarget) {
        const res = await api.put(`/admin/departments/${editTarget.id}`, payload, { headers });
        setCities(prev => prev.map(c => ({
          ...c,
          universities: c.universities?.map(u => ({
            ...u,
            departments: u.departments?.map(d => d.id===editTarget.id ? { ...d, ...res.data.data } : d) || []
          })) || []
        })));
        Alert.alert('✅','Bölüm güncellendi.');
      } else {
        const res = await api.post('/admin/departments', payload, { headers });
        const newDept = res.data.data;
        setCities(prev => prev.map(c => ({
          ...c,
          universities: c.universities?.map(u => u.id===newDept.uni_id ? { ...u, departments: [...(u.departments||[]), newDept] } : u) || []
        })));
        if (stats) setStats(p => ({ ...p, totalDepartments: p.totalDepartments + 1 }));
        Alert.alert('✅','Bölüm eklendi.');
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.message||'İşlem başarısız.');
    } finally { setSaving(false); }
  };

  const handleDelete = (dept, uniId) => {
    Alert.alert('Bölüm Sil', `"${dept.dept_name}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          setDeletingId(dept.id);
          await api.delete(`/admin/departments/${dept.id}`, { headers });
          setCities(prev => prev.map(c => ({
            ...c,
            universities: c.universities?.map(u => u.id===uniId ? { ...u, departments: u.departments?.filter(d => d.id!==dept.id)||[] } : u) || []
          })));
          if (stats) setStats(p => ({ ...p, totalDepartments: p.totalDepartments - 1 }));
          Alert.alert('✅','Bölüm silindi.');
        } catch (e) {
          Alert.alert('Hata', e?.response?.data?.message||'Silinemedi.');
        } finally { setDeletingId(null); }
      }},
    ]);
  };

  return (
    <View>
      <TouchableOpacity style={s.addBtn} onPress={openCreate}>
        <Text style={s.addBtnTxt}>➕ Yeni Bölüm Ekle</Text>
      </TouchableOpacity>

      {allUnis.map(uni => {
        const depts = uni.departments || [];
        if (depts.length === 0) return null;
        const isExpanded = expandedUni === uni.id;
        return (
          <View key={uni.id} style={s.groupCard}>
            <TouchableOpacity style={s.groupHeader} onPress={() => setExpandedUni(isExpanded ? null : uni.id)}>
              <View style={{ flex: 1 }}>
                <Text style={s.groupTitle}>{uni.uni_name}</Text>
                <Text style={s.groupMeta}>{uni.city_name} • {depts.length} bölüm</Text>
              </View>
              <Text style={s.chevron}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {isExpanded && depts.map(dept => (
              <View key={dept.id} style={s.deptRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.deptName}>{dept.dept_name}</Text>
                  <Text style={s.deptMeta}>{dept.language||'—'} • Kota: {dept.quota||'—'} • Baz: {dept.base_score||'—'}</Text>
                </View>
                <TouchableOpacity style={s.editBtn} onPress={() => openEdit(dept, uni.id)}>
                  <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(dept, uni.id)} disabled={deletingId===dept.id}>
                  {deletingId===dept.id ? <ActivityIndicator size="small" color={C.danger}/> : <Text>🗑️</Text>}
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
            <Text style={s.modalTitle}>{editTarget ? '✏️ Bölüm Düzenle' : '➕ Yeni Bölüm'}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              <Text style={s.label}>Üniversite Seç</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                {allUnis.map(u => (
                  <TouchableOpacity key={u.id} style={[s.chipBtn, form.uni_id===String(u.id)&&s.chipActive]} onPress={() => setForm(p=>({...p,uni_id:String(u.id)}))}>
                    <Text style={[s.chipTxt, form.uni_id===String(u.id)&&{color:'#FFF'}]} numberOfLines={1}>{u.uni_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {[
                { key:'dept_name', label:'Bölüm Adı', placeholder:'Bilgisayar Mühendisliği' },
                { key:'quota', label:'Kontenjan', placeholder:'50', kb:'number-pad' },
                { key:'base_score', label:'Baz Puan', placeholder:'450.5', kb:'decimal-pad' },
                { key:'base_rank', label:'Baz Sıra', placeholder:'15000', kb:'number-pad' },
              ].map(f => (
                <View key={f.key}>
                  <Text style={s.label}>{f.label}</Text>
                  <TextInput style={s.input} value={form[f.key]} onChangeText={v=>setForm(p=>({...p,[f.key]:v}))} placeholder={f.placeholder} placeholderTextColor={C.muted} keyboardType={f.kb||'default'} />
                </View>
              ))}
              <Text style={s.label}>Dil</Text>
              <View style={{ flexDirection:'row', gap:8, marginTop:4, flexWrap:'wrap' }}>
                {['Türkçe','İngilizce','%30 İngilizce','%70 İngilizce'].map(l => (
                  <TouchableOpacity key={l} style={[s.chipBtn, form.language===l&&s.chipActive]} onPress={() => setForm(p=>({...p,language:l}))}>
                    <Text style={[s.chipTxt, form.language===l&&{color:'#FFF'}]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  groupCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 12, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  groupTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  groupMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  chevron: { color: C.muted, fontSize: 12 },
  deptRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border, gap: 8 },
  deptName: { fontSize: 13, fontWeight: '600', color: C.text },
  deptMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  editBtn: { backgroundColor: 'rgba(108,99,255,.15)', borderRadius: 8, padding: 8 },
  delBtn: { backgroundColor: 'rgba(255,92,108,.1)', borderRadius: 8, padding: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  drag: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', color: C.muted, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14 },
  chipBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, marginRight: 8, marginBottom: 6 },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipTxt: { color: C.muted, fontSize: 12 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, backgroundColor: C.surface2, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelTxt: { color: C.muted, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: C.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveTxt: { color: '#FFF', fontWeight: '700' },
});
