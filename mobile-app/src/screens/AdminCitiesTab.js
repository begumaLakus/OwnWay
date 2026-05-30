import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import api from './api';

const C = { bg:'#0F1117', surface:'#1A1D27', surface2:'#222636', border:'#2E3347', accent:'#6C63FF', teal:'#4ECDC4', warn:'#FFB347', danger:'#FF5C6C', success:'#4CAF7D', text:'#E8EAF6', muted:'#8B90A7' };

const EMPTY_FORM = { city_name:'', culture_score:'', nature_score:'', social_score:'', modern_score:'', total_cost_index:'' };

function CityForm({ form, setForm }) {
  const fields = [
    { key:'city_name', label:'Şehir Adı', placeholder:'İstanbul' },
    { key:'culture_score', label:'Kültür Skoru (0-5)', placeholder:'3.5', keyboard:'decimal-pad' },
    { key:'nature_score', label:'Doğa Skoru (0-5)', placeholder:'2.0', keyboard:'decimal-pad' },
    { key:'social_score', label:'Sosyal Skoru (0-5)', placeholder:'4.0', keyboard:'decimal-pad' },
    { key:'modern_score', label:'Modern Skoru (0-5)', placeholder:'4.5', keyboard:'decimal-pad' },
    { key:'total_cost_index', label:'Yaşam Maliyeti (0-10)', placeholder:'7.0', keyboard:'decimal-pad' },
  ];
  return (
    <>
      {fields.map(f => (
        <View key={f.key}>
          <Text style={s.label}>{f.label}</Text>
          <TextInput style={s.input} value={form[f.key]} onChangeText={v => setForm(p => ({...p,[f.key]:v}))} placeholder={f.placeholder} placeholderTextColor={C.muted} keyboardType={f.keyboard||'default'} />
        </View>
      ))}
    </>
  );
}

export default function AdminCitiesTab({ cities, setCities, stats, setStats, headers }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalVisible(true); };
  const openEdit = (c) => {
    setEditTarget(c);
    setForm({ city_name: c.city_name||'', culture_score: String(c.culture_score||''), nature_score: String(c.nature_score||''), social_score: String(c.social_score||''), modern_score: String(c.modern_score||''), total_cost_index: String(c.total_cost_index||'') });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.city_name.trim()) { Alert.alert('Hata', 'Şehir adı zorunludur.'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/admin/cities/${editTarget.id}`, form, { headers });
        setCities(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...res.data.data } : c));
        Alert.alert('✅', 'Şehir güncellendi.');
      } else {
        const res = await api.post('/admin/cities', form, { headers });
        setCities(prev => [...prev, { ...res.data.data, universities: [] }]);
        if (stats) setStats(p => ({ ...p, totalCities: p.totalCities + 1 }));
        Alert.alert('✅', 'Şehir eklendi.');
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.message || 'İşlem başarısız.');
    } finally { setSaving(false); }
  };

  const handleDelete = (c) => {
    const uniCount = c.universities?.length || 0;
    Alert.alert('Şehir Sil', `"${c.city_name}" silinsin mi?\n${uniCount > 0 ? `⚠️ ${uniCount} üniversite ve bölümleri de silinecek!` : ''}`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          setDeletingId(c.id);
          await api.delete(`/admin/cities/${c.id}`, { headers });
          setCities(prev => prev.filter(x => x.id !== c.id));
          if (stats) setStats(p => ({ ...p, totalCities: p.totalCities - 1 }));
          Alert.alert('✅', 'Şehir silindi.');
        } catch (e) {
          Alert.alert('Hata', e?.response?.data?.message || 'Silinemedi.');
        } finally { setDeletingId(null); }
      }},
    ]);
  };

  return (
    <View>
      <TouchableOpacity style={s.addBtn} onPress={openCreate}>
        <Text style={s.addBtnTxt}>➕ Yeni Şehir Ekle</Text>
      </TouchableOpacity>

      {cities.map(c => {
        const uniCount = c.universities?.length || 0;
        const deptCount = c.universities?.reduce((a, u) => a + (u.departments?.length||0), 0) || 0;
        const scores = [
          { label:'Kültür', val:parseFloat(c.culture_score||0), color:C.accent },
          { label:'Doğa', val:parseFloat(c.nature_score||0), color:C.teal },
          { label:'Sosyal', val:parseFloat(c.social_score||0), color:C.warn },
          { label:'Modern', val:parseFloat(c.modern_score||0), color:C.success },
        ];
        return (
          <View key={c.id} style={s.cityCard}>
            <View style={s.cityHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.cityName}>{c.city_name}</Text>
                <Text style={s.cityMeta}>{uniCount} üni • {deptCount} bölüm</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={s.editBtn} onPress={() => openEdit(c)}>
                  <Text style={s.editBtnTxt}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(c)} disabled={deletingId === c.id}>
                  {deletingId === c.id ? <ActivityIndicator size="small" color={C.danger} /> : <Text style={s.delBtnTxt}>🗑️</Text>}
                </TouchableOpacity>
              </View>
            </View>
            {scores.map(sc => (
              <View key={sc.label} style={s.scoreRow}>
                <Text style={s.scoreLabel}>{sc.label}</Text>
                <View style={s.scoreBarBg}>
                  <View style={[s.scoreBarFill, { width:`${Math.min((sc.val/5)*100,100)}%`, backgroundColor:sc.color }]} />
                </View>
                <Text style={[s.scoreVal, { color:sc.color }]}>{sc.val.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        );
      })}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.sheet}>
            <View style={s.drag} />
            <Text style={s.modalTitle}>{editTarget ? '✏️ Şehir Düzenle' : '➕ Yeni Şehir'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <CityForm form={form} setForm={setForm} />
            </ScrollView>
            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelTxt}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, saving&&{opacity:0.6}]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.saveTxt}>Kaydet</Text>}
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
  cityCard: { backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  cityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cityName: { fontSize: 16, fontWeight: '700', color: C.text },
  cityMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  editBtn: { backgroundColor: 'rgba(108,99,255,.15)', borderRadius: 8, padding: 8 },
  editBtnTxt: { fontSize: 14 },
  delBtn: { backgroundColor: 'rgba(255,92,108,.1)', borderRadius: 8, padding: 8 },
  delBtnTxt: { fontSize: 14 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  scoreLabel: { fontSize: 11, color: C.muted, width: 55 },
  scoreBarBg: { flex: 1, height: 5, backgroundColor: C.surface2, borderRadius: 3, overflow: 'hidden', marginHorizontal: 8 },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  scoreVal: { fontSize: 11, fontWeight: '700', minWidth: 28, textAlign: 'right' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  drag: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', color: C.muted, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, backgroundColor: C.surface2, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelTxt: { color: C.muted, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: C.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveTxt: { color: '#FFF', fontWeight: '700' },
});
