import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from '../../context/ScheduleContext';
import { getEventColor } from '../../data/scheduleData';
import { estimateTravelTime, checkGap, formatTravelTime } from '../../utils/travelTime';

const PRIMARY = '#1D4ED8';

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

  // Builds a flat list of { type: 'event' | 'separator', ... } for rendering
  const buildRenderList = () => {
    const result = [];
    for (let i = 0; i < events.length; i++) {
      result.push({ type: 'event', data: events[i] });

      if (i < events.length - 1) {
        const curr = events[i];
        const next = events[i + 1];

        // Only show separator for consecutive class events (same or adjacent day)
        const currEnd = new Date(curr.endDateTime);
        const nextStart = new Date(next.startDateTime);
        const gapMin = Math.round((nextStart.getTime() - currEnd.getTime()) / 60000);

        // Only show if gap is under 4 hours (same session day, meaningful)
        if (gapMin >= 0 && gapMin <= 240) {
          const coordA = curr.meetingPoint?.coordinates || null;
          const coordB = next.meetingPoint?.coordinates || null;
          const travelMin = coordA && coordB
            ? estimateTravelTime(coordA, coordB)
            : null;

          if (travelMin !== null) {
            const gap = checkGap(gapMin, travelMin);
            result.push({ type: 'separator', gapMin, travelMin, status: gap.status, margin: gap.margin });
          }
        }
      }
    }
    return result;
  };

  const renderEvent = (item) => {
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

          {item.meetingPoint?.address ? (
            <View style={styles.eventDetail}>
              <Ionicons
                name={item.meetingPoint.type === 'student_home' ? 'home-outline' :
                      item.meetingPoint.type === 'instructor_location' ? 'business-outline' :
                      'location-outline'}
                size={15} color="#9CA3AF"
              />
              <Text style={styles.eventDetailText} numberOfLines={1}>{item.meetingPoint.address}</Text>
            </View>
          ) : item.location ? (
            <View style={styles.eventDetail}>
              <Ionicons name="location-outline" size={15} color="#9CA3AF" />
              <Text style={styles.eventDetailText} numberOfLines={1}>{item.location}</Text>
            </View>
          ) : null}

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

  const renderSeparator = (sep) => {
    const color = sep.status === 'conflict' ? '#EF4444' : sep.status === 'warning' ? '#D97706' : '#6B7280';
    const bg = sep.status === 'conflict' ? '#FEF2F2' : sep.status === 'warning' ? '#FFFBEB' : '#F9FAFB';
    const icon = sep.status === 'conflict' ? 'close-circle-outline' : sep.status === 'warning' ? 'warning-outline' : 'car-outline';
    return (
      <View style={[styles.travelSeparator, { backgroundColor: bg, borderColor: `${color}40` }]}>
        <View style={styles.travelSepLine} />
        <View style={[styles.travelSepPill, { borderColor: `${color}50` }]}>
          <Ionicons name={icon} size={13} color={color} />
          <Text style={[styles.travelSepText, { color }]}>
            {formatTravelTime(sep.travelMin)} de deslocamento
          </Text>
          {sep.status !== 'ok' && (
            <Text style={[styles.travelSepSub, { color }]}>
              · gap: {sep.gapMin} min
            </Text>
          )}
        </View>
        <View style={styles.travelSepLine} />
      </View>
    );
  };

  const renderList = buildRenderList();

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
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {renderList.map((entry, idx) =>
            entry.type === 'event'
              ? <View key={`e-${entry.data.id}`}>{renderEvent(entry.data)}</View>
              : <View key={`s-${idx}`}>{renderSeparator(entry)}</View>
          )}
        </ScrollView>
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

  travelSeparator: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1,
    paddingVertical: 6, paddingHorizontal: 10, gap: 8,
  },
  travelSepLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  travelSepPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: '#FFF',
  },
  travelSepText: { fontSize: 11, fontWeight: '700' },
  travelSepSub: { fontSize: 10, fontWeight: '500' },
});
