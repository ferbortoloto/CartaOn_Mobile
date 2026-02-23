import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initialAvailability, toggleTimeAvailability, TimeSlots,
  WeekDays, WeekDaysNames, WeekDaysShort,
} from '../../data/availabilityData';

const PRIMARY = '#1D4ED8';
const DAYS_ORDER = [
  WeekDays.MONDAY, WeekDays.TUESDAY, WeekDays.WEDNESDAY,
  WeekDays.THURSDAY, WeekDays.FRIDAY, WeekDays.SATURDAY, WeekDays.SUNDAY,
];

export default function AvailabilityManager() {
  const [selectedDay, setSelectedDay] = useState(WeekDays.MONDAY);
  const [availability, setAvailability] = useState(initialAvailability);

  const toggle = (time) => {
    setAvailability(prev => toggleTimeAvailability(prev, selectedDay, time));
  };

  const selectAll = () => {
    setAvailability(prev => ({ ...prev, [selectedDay]: [...TimeSlots] }));
  };

  const clearAll = () => {
    setAvailability(prev => ({ ...prev, [selectedDay]: [] }));
  };

  const save = async () => {
    try {
      await AsyncStorage.setItem('availability', JSON.stringify(availability));
      Alert.alert('Salvo!', 'Disponibilidade atualizada com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a disponibilidade.');
    }
  };

  const currentSlots = availability[selectedDay] || [];
  const totalSlots = Object.values(availability).reduce((acc, slots) => acc + slots.length, 0);
  const daysWithSlots = Object.values(availability).filter(s => s.length > 0).length;

  return (
    <View style={styles.container}>
      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent}>
        {DAYS_ORDER.map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.dayPill, selectedDay === day && styles.dayPillActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayPillText, selectedDay === day && styles.dayPillTextActive]}>
              {WeekDaysShort[day]}
            </Text>
            {availability[day]?.length > 0 && (
              <View style={[styles.dayDot, selectedDay === day && styles.dayDotActive]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Day label + actions */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{WeekDaysNames[selectedDay]}</Text>
        <View style={styles.dayActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={selectAll}>
            <Text style={styles.actionBtnText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnClear]} onPress={clearAll}>
            <Text style={[styles.actionBtnText, styles.actionBtnClearText]}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalSlots}</Text>
          <Text style={styles.statLabel}>Horários disponíveis</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{daysWithSlots}</Text>
          <Text style={styles.statLabel}>Dias com disponibilidade</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentSlots.length}</Text>
          <Text style={styles.statLabel}>Horários hoje</Text>
        </View>
      </View>

      {/* Time slots grid */}
      <ScrollView style={styles.slotsScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.slotsGrid}>
          {TimeSlots.map(time => {
            const isActive = currentSlots.includes(time);
            return (
              <TouchableOpacity
                key={time}
                style={[styles.slot, isActive && styles.slotActive]}
                onPress={() => toggle(time)}
                activeOpacity={0.75}
              >
                <Text style={[styles.slotText, isActive && styles.slotTextActive]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Salvar Disponibilidade</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dayScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dayScrollContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  dayPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', alignItems: 'center', position: 'relative',
  },
  dayPillActive: { backgroundColor: PRIMARY },
  dayPillText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  dayPillTextActive: { color: '#FFF' },
  dayDot: {
    position: 'absolute', top: 4, right: 4,
    width: 6, height: 6, borderRadius: 3, backgroundColor: PRIMARY,
  },
  dayDotActive: { backgroundColor: '#FFF' },

  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  dayTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  dayActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#F5F0FF', borderRadius: 8,
  },
  actionBtnClear: { backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: PRIMARY },
  actionBtnClearText: { color: '#EF4444' },

  stats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 12,
    padding: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: PRIMARY },
  statLabel: { fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#E5E7EB' },

  slotsScroll: { flex: 1, paddingHorizontal: 16 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
  slot: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  slotActive: { backgroundColor: '#F5F0FF', borderColor: PRIMARY },
  slotText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  slotTextActive: { color: PRIMARY },

  saveBtn: {
    backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 24, marginTop: 8,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
