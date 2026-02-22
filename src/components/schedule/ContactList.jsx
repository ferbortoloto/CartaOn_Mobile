import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from '../../context/ScheduleContext';
import ContactModal from './ContactModal';

const PRIMARY = '#820AD1';

const STATUS_CONFIG = {
  active: { label: 'Ativo', color: '#16A34A', bg: '#F0FDF4' },
  pending: { label: 'Pendente', color: '#CA8A04', bg: '#FFFBEB' },
  inactive: { label: 'Inativo', color: '#6B7280', bg: '#F9FAFB' },
};

export default function ContactList() {
  const { contacts, addContact, updateContact, deleteContact } = useSchedule();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const handleSave = (contactData) => {
    if (editingContact) {
      updateContact({ ...editingContact, ...contactData });
    } else {
      addContact(contactData);
    }
    setModalVisible(false);
    setEditingContact(null);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingContact(null);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir aluno', 'Tem certeza que deseja remover este aluno?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteContact(id) },
    ]);
  };

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.inactive;
    return (
      <View style={styles.contactCard}>
        <View style={[styles.avatar, { backgroundColor: PRIMARY + '20' }]}>
          <Text style={[styles.avatarText, { color: PRIMARY }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.contactTop}>
            <Text style={styles.contactName}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>

          {item.email && (
            <View style={styles.contactDetail}>
              <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
              <Text style={styles.contactDetailText} numberOfLines={1}>{item.email}</Text>
            </View>
          )}

          {item.phone && (
            <View style={styles.contactDetail}>
              <Ionicons name="call-outline" size={14} color="#9CA3AF" />
              <Text style={styles.contactDetailText}>{item.phone}</Text>
            </View>
          )}

          {item.notes && (
            <Text style={styles.contactNotes} numberOfLines={1}>{item.notes}</Text>
          )}
        </View>

        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
            <Ionicons name="pencil-outline" size={16} color={PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search + Add */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar aluno..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
          </Text>
          {!search && (
            <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAdd}>
              <Ionicons name="add-circle-outline" size={18} color={PRIMARY} />
              <Text style={styles.emptyAddText}>Adicionar primeiro aluno</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      <ContactModal
        visible={modalVisible}
        contact={editingContact}
        onSave={handleSave}
        onClose={() => { setModalVisible(false); setEditingContact(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  addBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },

  list: { padding: 14, paddingTop: 6, paddingBottom: 32 },
  contactCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 20, fontWeight: '800' },
  contactInfo: { flex: 1 },
  contactTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  contactName: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  contactDetail: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  contactDetailText: { fontSize: 13, color: '#6B7280', flex: 1 },
  contactNotes: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 },
  contactActions: { flexDirection: 'column', gap: 8, flexShrink: 0 },
  editBtn: { padding: 8, backgroundColor: '#F5F0FF', borderRadius: 10 },
  deleteBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 10 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  emptyAddText: { fontSize: 14, color: PRIMARY, fontWeight: '600' },
});
