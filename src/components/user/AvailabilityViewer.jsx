import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#1D4ED8';

const ALL_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getAvailableSlots(instructorId, dayOfWeek) {
  // Generate deterministic availability based on instructor id and day
  const seed = parseInt(instructorId, 10) || 1;
  // Weekdays have more slots than weekends
  if (dayOfWeek === 0) return []; // Sunday - no availability
  if (dayOfWeek === 6) {
    // Saturday: limited slots
    return seed % 2 === 0 ? ['09:00', '09:30', '10:00', '10:30'] : ['08:00', '08:30', '09:00'];
  }
  // Weekdays: morning and afternoon slots, varying by instructor
  const morning = ALL_SLOTS.slice(0, 6 + (seed % 3));
  const afternoon = ALL_SLOTS.slice(6, 12 + (seed % 3));
  return [...morning, ...afternoon].filter((_, i) => (i + seed + dayOfWeek) % 3 !== 0);
}

export default function AvailabilityViewer({ instructorId, onSlotsSelected }) {
  const today = new Date();
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const selectedDate = days[selectedDayIndex];
  const dayOfWeek = selectedDate.getDay();
  const availableSlots = useMemo(
    () => getAvailableSlots(instructorId, dayOfWeek),
    [instructorId, dayOfWeek],
  );

  const toggleSlot = (slot) => {
    setSelectedSlots(prev => {
      const next = prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot];
      onSlotsSelected?.(next, selectedDate);
      return next;
    });
  };

  const handleDaySelect = (index) => {
    setSelectedDayIndex(index);
    setSelectedSlots([]);
    onSlotsSelected?.([], days[index]);
  };

  return (
    <View style={styles.container}>
      {/* Day picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayScroll}
        contentContainerStyle={styles.dayScrollContent}
      >
        {days.map((day, index) => {
          const isSelected = selectedDayIndex === index;
          const isToday = index === 0;
          const dow = day.getDay();
          const slots = getAvailableSlots(instructorId, dow);
          const hasSlots = slots.length > 0;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayPill, isSelected && styles.dayPillActive, !hasSlots && styles.dayPillUnavailable]}
              onPress={() => hasSlots && handleDaySelect(index)}
              activeOpacity={hasSlots ? 0.75 : 1}
            >
              <Text style={[styles.dayPillWeekday, isSelected && styles.dayPillTextActive, !hasSlots && styles.dayPillTextUnavailable]}>
                {isToday ? 'Hoje' : DAY_NAMES[dow]}
              </Text>
              <Text style={[styles.dayPillDate, isSelected && styles.dayPillTextActive, !hasSlots && styles.dayPillTextUnavailable]}>
                {day.getDate()}
              </Text>
              <Text style={[styles.dayPillMonth, isSelected && styles.dayPillTextActive, !hasSlots && styles.dayPillTextUnavailable]}>
                {MONTH_NAMES[day.getMonth()]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected date label */}
      <View style={styles.dateHeader}>
        <Ionicons name="calendar-outline" size={14} color={PRIMARY} />
        <Text style={styles.dateHeaderText}>
          {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTH_NAMES[selectedDate.getMonth()]}
        </Text>
        {selectedSlots.length > 0 && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>{selectedSlots.length} selecionado{selectedSlots.length > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {/* Time slots */}
      {availableSlots.length === 0 ? (
        <View style={styles.noSlots}>
          <Ionicons name="moon-outline" size={28} color="#D1D5DB" />
          <Text style={styles.noSlotsText}>Sem disponibilidade neste dia</Text>
        </View>
      ) : (
        <View style={styles.slotsGrid}>
          {availableSlots.map(slot => {
            const isActive = selectedSlots.includes(slot);
            return (
              <TouchableOpacity
                key={slot}
                style={[styles.slot, isActive && styles.slotActive]}
                onPress={() => toggleSlot(slot)}
                activeOpacity={0.75}
              >
                <Text style={[styles.slotText, isActive && styles.slotTextActive]}>{slot}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { },
  dayScroll: { flexGrow: 0 },
  dayScrollContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  dayPill: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, backgroundColor: '#F3F4F6',
    minWidth: 58,
  },
  dayPillActive: { backgroundColor: PRIMARY },
  dayPillUnavailable: { backgroundColor: '#F9FAFB', opacity: 0.5 },
  dayPillWeekday: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  dayPillDate: { fontSize: 18, fontWeight: '800', color: '#374151', marginTop: 2 },
  dayPillMonth: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', marginTop: 1 },
  dayPillTextActive: { color: '#FFF' },
  dayPillTextUnavailable: { color: '#D1D5DB' },

  dateHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  dateHeaderText: { fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 },
  selectedBadge: {
    backgroundColor: `${PRIMARY}20`, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  selectedBadgeText: { fontSize: 11, fontWeight: '700', color: PRIMARY },

  noSlots: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  noSlotsText: { fontSize: 13, color: '#9CA3AF' },

  slotsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, paddingBottom: 8,
  },
  slot: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  slotActive: { backgroundColor: `${PRIMARY}15`, borderColor: PRIMARY },
  slotText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  slotTextActive: { color: PRIMARY, fontWeight: '700' },
});
