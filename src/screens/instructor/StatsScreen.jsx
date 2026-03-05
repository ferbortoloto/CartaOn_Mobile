import React, { useMemo, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useSchedule } from '../../context/ScheduleContext';
import { getReviews } from '../../services/instructors.service';
import { logger } from '../../utils/logger';

const PRIMARY = '#1D4ED8';

const statusConfig = {
  completed: { label: 'Concluída', color: '#16A34A', dot: '#22C55E' },
  'in-progress': { label: 'Em andamento', color: '#CA8A04', dot: '#EAB308' },
  scheduled: { label: 'Agendada', color: '#2563EB', dot: '#3B82F6' },
};

export default function StatsScreen() {
  const { user } = useAuth();
  const { events } = useSchedule();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    getReviews(user.id)
      .then(data => setReviews(data))
      .catch(e => logger.error('Erro ao carregar avaliações:', e.message));
  }, [user?.id]);

  const classEvents = useMemo(() =>
    events.filter(e => e.type === 'class' || e.type === 'CLASS'),
  [events]);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const classesThisWeek = useMemo(() =>
    classEvents.filter(e => new Date(e.startDateTime) >= weekStart).length,
  [classEvents, weekStart]);

  const activeStudents = useMemo(() => {
    const ids = new Set(classEvents.map(e => e.contactId).filter(Boolean));
    return ids.size;
  }, [classEvents]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const estimatedRevenue = useMemo(() => {
    const pricePerHour = user?.price_per_hour || 0;
    const duration = (user?.class_duration || 60) / 60;
    return Math.round(classEvents.filter(e => e.status === 'completed').length * pricePerHour * duration);
  }, [classEvents, user]);

  const stats = [
    { title: 'Aulas esta Semana', value: String(classesThisWeek), icon: 'calendar-outline', color: '#2563EB', bg: '#EFF6FF' },
    { title: 'Alunos Ativos', value: String(activeStudents), icon: 'people-outline', color: '#16A34A', bg: '#F0FDF4' },
    { title: 'Avaliação Média', value: avgRating ?? '—', icon: 'star-outline', color: '#CA8A04', bg: '#FEFCE8' },
    { title: 'Faturamento', value: `R$ ${estimatedRevenue}`, icon: 'cash-outline', color: PRIMARY, bg: '#EFF6FF' },
  ];

  const recentClasses = useMemo(() =>
    [...classEvents]
      .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime))
      .slice(0, 5)
      .map(e => {
        const d = new Date(e.startDateTime);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const isToday = d.toDateString() === today.toDateString();
        const isTomorrow = d.toDateString() === tomorrow.toDateString();
        const dateLabel = isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const timeLabel = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return {
          id: e.id,
          studentName: e.title.replace(/^Aula de .+ - /, '') || 'Aluno',
          date: `${dateLabel}, ${timeLabel}`,
          type: e.type === 'class' || e.type === 'CLASS' ? 'Aula Prática' : e.type,
          status: e.status === 'scheduled' ? 'scheduled' : e.status === 'completed' ? 'completed' : 'scheduled',
          duration: `${user?.class_duration || 60} min`,
        };
      }),
  [classEvents, user]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Estatísticas</Text>
          <Text style={styles.headerSub}>Acompanhe seu desempenho</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Ionicons name="stats-chart" size={22} color={PRIMARY} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.kpiCard}>
              <View style={styles.kpiTop}>
                <View style={[styles.kpiIconBox, { backgroundColor: stat.bg }]}>
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
              </View>
              <Text style={styles.kpiValue}>{stat.value}</Text>
              <Text style={styles.kpiTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Aulas Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aulas Recentes</Text>
          </View>
          {recentClasses.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma aula registrada ainda.</Text>
          ) : recentClasses.map(item => {
            const cfg = statusConfig[item.status] || statusConfig.scheduled;
            return (
              <View key={item.id} style={styles.classRow}>
                <View style={[styles.classDot, { backgroundColor: cfg.dot }]} />
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{item.studentName}</Text>
                  <Text style={styles.classType}>{item.type} · {item.duration}</Text>
                </View>
                <View style={styles.classRight}>
                  <Text style={styles.classDate}>{item.date}</Text>
                  <Text style={[styles.classStatus, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Banner do mês */}
        {reviews.length > 0 && (
          <LinearGradient colors={['#1E3A8A', '#1D4ED8']} style={styles.banner}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>Avaliação do Mês</Text>
              <Text style={styles.bannerSub}>Você tem {reviews.length} avaliação{reviews.length > 1 ? 'ões' : ''}. Média {avgRating} ⭐</Text>
            </View>
            <Ionicons name="trophy" size={56} color="rgba(255,255,255,0.3)" />
          </LinearGradient>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 16, paddingBottom: 32 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  kpiCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#FFF', borderRadius: 16,
    padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  kpiTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  kpiIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kpiBadge: { backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  kpiBadgeText: { fontSize: 11, color: '#16A34A', fontWeight: '700' },
  kpiValue: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 2 },
  kpiTitle: { fontSize: 12, color: '#6B7280' },
  section: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 13, color: PRIMARY, fontWeight: '600' },
  classRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  classDot: { width: 8, height: 40, borderRadius: 4, marginRight: 12 },
  classInfo: { flex: 1 },
  className: { fontSize: 14, fontWeight: '600', color: '#111827' },
  classType: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  classRight: { alignItems: 'flex-end' },
  classDate: { fontSize: 13, fontWeight: '600', color: '#374151' },
  classStatus: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  testCard: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 10,
  },
  testTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  testName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  testType: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  testDateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  testDateLabel: { fontSize: 12, color: '#6B7280' },
  testDateValue: { fontSize: 12, fontWeight: '700', color: '#111827' },
  prepRow: { marginBottom: 6 },
  prepLabel: { fontSize: 12, color: '#6B7280' },
  prepValue: { fontWeight: '700', color: '#111827' },
  progressBg: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: PRIMARY, borderRadius: 3 },
  banner: {
    borderRadius: 16, padding: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  bannerLeft: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14 },
  bannerBtn: { backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  bannerBtnText: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 },
});
