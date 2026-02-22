import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from '../../context/ScheduleContext';
import { getEventColor } from '../../data/scheduleData';

const PRIMARY = '#820AD1';

const TYPE_LABELS = { class: 'Aula', meeting: 'Reunião', appointment: 'Compromisso', personal: 'Pessoal', other: 'Outro' };
const PRIORITY_LABELS = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' };
const PRIORITY_COLORS = { low: '#6B7280', medium: '#CA8A04', high: '#EA580C', urgent: '#DC2626' };

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'class', label: 'Aulas' },
  { key: 'meeting', label: 'Reuniões' },
  { key: 'appointment', label: 'Compromissos' },
];

export default function EventList() {
  const { getFilteredEvents, setFilter, filters, deleteEvent, getContactById } = useSchedule();
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilter = (key) => {
    setActiveFilter(key);
    setFilter({ eventType: key });
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir evento', 'Tem certeza que deseja excluir esta aula?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteEvent(id) },
    ]);
  };

  const events = getFilteredEvents().sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

  const renderItem = ({ item }) => {
    const contact = item.contactId ? getContactById(item.contactId) : null;
    const color = getEventColor(item.type);
    return (
      <View style={styles.eventCard}>
        <View style={[styles.eventColorBar, { backgroundColor: color }]} />
        <View style={styles.eventBody}>
          <View style={styles.eventTop}>
            <View style={styles.eventMeta}>
              <View style={[styles.typeBadge, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.typeBadgeText, { color }]}>{TYPE_LABELS[item.type] || item.type}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: `${PRIORITY_COLORS[item.priority]}15` }]}>
                <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] }]}>
                  {PRIORITY_LABELS[item.priority]}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>

          <View style={styles.eventDetail}>
            <Ionicons name="time-outline" size={15} color="#9CA3AF" />
            <Text style={styles.eventDetailText}>
              {new Date(item.startDateTime).toLocaleDateString('pt-BR')} ·{' '}
              {new Date(item.startDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              {' – '}
              {new Date(item.endDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {item.location && (
            <View style={styles.eventDetail}>
              <Ionicons name="location-outline" size={15} color="#9CA3AF" />
              <Text style={styles.eventDetailText} numberOfLines={1}>{item.location}</Text>
            </View>
          )}

          {contact && (
            <View style={styles.eventDetail}>
              <Ionicons name="person-outline" size={15} color="#9CA3AF" />
              <Text style={styles.eventDetailText}>{contact.name}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, activeFilter === f.key && styles.filterBtnActive]}
            onPress={() => handleFilter(f.key)}
          >
            <Text style={[styles.filterBtnText, activeFilter === f.key && styles.filterBtnTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Nenhuma aula encontrada</Text>
          <Text style={styles.emptyText}>As aulas aceitas no painel aparecem aqui</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#F3F4F6',
  },
  filterBtnActive: { backgroundColor: PRIMARY },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterBtnTextActive: { color: '#FFF' },

  list: { padding: 16, gap: 14, paddingBottom: 32 },
  eventCard: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  eventColorBar: { width: 6 },
  eventBody: { flex: 1, padding: 16 },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  eventMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 12, fontWeight: '700' },
  deleteBtn: { padding: 6 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, lineHeight: 22 },
  eventDetail: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 },
  eventDetailText: { fontSize: 13, color: '#6B7280', flex: 1 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },
});
