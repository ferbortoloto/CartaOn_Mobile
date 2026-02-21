import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AvailabilityViewer from '../../components/user/AvailabilityViewer';

const PRIMARY = '#820AD1';

const REVIEWS = [
  { id: '1', author: 'Lucas M.', rating: 5, text: 'Excelente instrutora! Muito paciente e didática.', date: 'Jan 2026' },
  { id: '2', author: 'Carla S.', rating: 5, text: 'Aprendi muito rápido. Recomendo muito!', date: 'Dez 2025' },
  { id: '3', author: 'Marcos P.', rating: 4, text: 'Ótima profissional. Pontual e bem-humorada.', date: 'Nov 2025' },
];

function StarRow({ rating, size = 14, color = '#EAB308' }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : i < rating ? 'star-half' : 'star-outline'}
          size={size}
          color={color}
        />
      ))}
    </View>
  );
}

export default function InstructorDetailScreen({ route, navigation }) {
  const { instructor } = route.params;
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const catColor = instructor.licenseCategory === 'A' ? '#EA580C' : '#2563EB';

  const handleSchedule = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Selecione um horário', 'Por favor, selecione pelo menos um horário disponível.');
      return;
    }
    const dateStr = selectedDate
      ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
      : '';
    Alert.alert(
      'Aula Solicitada!',
      `Sua solicitação foi enviada para ${instructor.name}.\n\nData: ${dateStr}\nHorários: ${selectedSlots.join(', ')}\n\nAguarde a confirmação do instrutor.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instrutor</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.hero}>
          <Image source={{ uri: instructor.photo }} style={styles.heroPhoto} />
          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{instructor.name}</Text>
              {instructor.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.verifiedText}>Verificado</Text>
                </View>
              )}
            </View>

            <View style={styles.heroRatingRow}>
              <StarRow rating={instructor.rating} />
              <Text style={styles.heroRating}>{instructor.rating.toFixed(1)}</Text>
              <Text style={styles.heroReviews}>({instructor.reviewsCount} avaliações)</Text>
            </View>

            <View style={styles.heroMeta}>
              <View style={[styles.catBadge, { backgroundColor: `${catColor}20` }]}>
                <Text style={[styles.catText, { color: catColor }]}>Categoria {instructor.licenseCategory}</Text>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Text style={styles.locationText} numberOfLines={1}>{instructor.location}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price + Car card */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={20} color={PRIMARY} />
            <Text style={styles.infoValue}>R$ {instructor.pricePerHour}</Text>
            <Text style={styles.infoLabel}>por hora</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="car-outline" size={20} color="#2563EB" />
            <Text style={styles.infoValue} numberOfLines={1}>{instructor.carModel}</Text>
            <Text style={styles.infoLabel}>veículo</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="star" size={20} color="#EAB308" />
            <Text style={styles.infoValue}>{instructor.rating.toFixed(1)}</Text>
            <Text style={styles.infoLabel}>avaliação</Text>
          </View>
        </View>

        {/* Bio */}
        {instructor.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre o Instrutor</Text>
            <Text style={styles.bioText}>{instructor.bio}</Text>
          </View>
        )}

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          <Text style={styles.sectionSub}>Selecione a data e os horários para solicitar uma aula</Text>
          <AvailabilityViewer
            instructorId={instructor.id}
            onSlotsSelected={(slots, date) => {
              setSelectedSlots(slots);
              setSelectedDate(date);
            }}
          />
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          {REVIEWS.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.author.charAt(0)}</Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <View style={styles.reviewMeta}>
                    <StarRow rating={review.rating} size={12} />
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Schedule CTA */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerPrice}>R$ {instructor.pricePerHour}/h</Text>
          <Text style={styles.footerSlots}>
            {selectedSlots.length > 0
              ? `${selectedSlots.length} horário${selectedSlots.length > 1 ? 's' : ''} selecionado${selectedSlots.length > 1 ? 's' : ''}`
              : 'Selecione horários'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.scheduleBtn, selectedSlots.length === 0 && styles.scheduleBtnDisabled]}
          onPress={handleSchedule}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFF" />
          <Text style={styles.scheduleBtnText}>Solicitar Aula</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },

  scroll: { flex: 1 },

  hero: {
    backgroundColor: '#FFF', padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  heroPhoto: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E7EB', flexShrink: 0 },
  heroInfo: { flex: 1, gap: 6 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  heroName: { fontSize: 20, fontWeight: '800', color: '#111827' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  heroRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroRating: { fontSize: 14, fontWeight: '700', color: '#374151' },
  heroReviews: { fontSize: 12, color: '#9CA3AF' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  catText: { fontSize: 11, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  locationText: { fontSize: 11, color: '#9CA3AF', flex: 1 },

  infoGrid: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  infoItem: { flex: 1, alignItems: 'center', gap: 3 },
  infoValue: { fontSize: 14, fontWeight: '800', color: '#111827', textAlign: 'center' },
  infoLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  infoDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB' },

  section: {
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 16,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sectionSub: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  bioText: { fontSize: 14, color: '#374151', lineHeight: 21 },

  reviewCard: {
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 12,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${PRIMARY}20`, alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: 16, fontWeight: '800', color: PRIMARY },
  reviewInfo: { flex: 1 },
  reviewAuthor: { fontSize: 14, fontWeight: '700', color: '#111827' },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  reviewDate: { fontSize: 11, color: '#9CA3AF' },
  reviewText: { fontSize: 13, color: '#6B7280', lineHeight: 19 },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 14 : 14,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  footerInfo: { flex: 1 },
  footerPrice: { fontSize: 20, fontWeight: '800', color: PRIMARY },
  footerSlots: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  scheduleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PRIMARY, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 14,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  scheduleBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  scheduleBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
