import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CalendarView from '../../components/schedule/CalendarView';
import AvailabilityManager from '../../components/schedule/AvailabilityManager';
import EventList from '../../components/schedule/EventList';
import ContactList from '../../components/schedule/ContactList';
import { useSchedule } from '../../context/ScheduleContext';

const PRIMARY = '#820AD1';

const TABS = [
  { key: 'calendar', label: 'Calendário', icon: 'calendar-outline' },
  { key: 'availability', label: 'Disponibilidade', icon: 'time-outline' },
  { key: 'events', label: 'Aulas', icon: 'list-outline' },
  { key: 'contacts', label: 'Alunos', icon: 'people-outline' },
];

export default function ScheduleScreen() {
  const [activeTab, setActiveTab] = useState('calendar');
  const { events, contacts } = useSchedule();

  const badgeCounts = {
    events: events.length,
    contacts: contacts.length,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Agenda</Text>
          <Text style={styles.headerSub}>Gerencie suas aulas e alunos</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statPill}>
            <Ionicons name="calendar" size={14} color={PRIMARY} />
            <Text style={styles.statPillText}>{events.length} aulas</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="people" size={14} color={PRIMARY} />
            <Text style={styles.statPillText}>{contacts.length} alunos</Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const badge = badgeCounts[tab.key];
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isActive ? tab.icon.replace('-outline', '') : tab.icon}
                size={16}
                color={isActive ? PRIMARY : '#9CA3AF'}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {badge > 0 && (
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'availability' && <AvailabilityManager />}
        {activeTab === 'events' && <EventList />}
        {activeTab === 'contacts' && <ContactList />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  headerStats: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F0FF', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
  },
  statPillText: { fontSize: 11, fontWeight: '700', color: PRIMARY },

  tabBar: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexGrow: 0 },
  tabBarContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: '#F5F0FF' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: PRIMARY },
  tabBadge: {
    backgroundColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: `${PRIMARY}25` },
  tabBadgeText: { fontSize: 10, fontWeight: '800', color: '#6B7280' },
  tabBadgeTextActive: { color: PRIMARY },

  content: { flex: 1, backgroundColor: '#F9FAFB' },
});
