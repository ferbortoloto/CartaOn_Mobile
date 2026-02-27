import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AvailabilityViewer from '../../components/user/AvailabilityViewer';
import Avatar from '../../components/shared/Avatar';
import { usePlans } from '../../context/PlansContext';
import { useAuth } from '../../hooks/useAuth';
import { MeetingPointType } from '../../data/scheduleData';

const PRIMARY = '#1D4ED8';

const CLASS_TYPE_ICON = {
  'Aula Prática': 'car-outline',
  'Aula Teórica': 'book-outline',
  'Misto':        'grid-outline',
};

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
  const { getActivePlans } = usePlans();
  const { user } = useAuth();
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [carChoice, setCarChoice] = useState(
    instructor.carOptions === 'student' ? 'student' : 'instructor',
  );
  const [meetingType, setMeetingType] = useState(
    user?.address ? MeetingPointType.STUDENT_HOME : MeetingPointType.INSTRUCTOR_LOCATION
  );
  const [customAddress, setCustomAddress] = useState('');

  const plans = getActivePlans(instructor.id);

  const catColor = instructor.licenseCategory === 'A' ? '#EA580C' : '#2563EB';

  const getMeetingPointLabel = () => {
    if (meetingType === MeetingPointType.STUDENT_HOME) return user?.address || 'Minha casa';
    if (meetingType === MeetingPointType.INSTRUCTOR_LOCATION) return instructor.location || 'Local do instrutor';
    return customAddress || 'Local personalizado';
  };

  const handleSchedule = () => {
    if (selectedSlots.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Por favor, selecione pelo menos um horário disponível.');
      } else {
        Alert.alert('Selecione um horário', 'Por favor, selecione pelo menos um horário disponível.');
      }
      return;
    }
    if (meetingType === MeetingPointType.CUSTOM && !customAddress.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Informe o endereço do local de encontro.');
      } else {
        Alert.alert('Local de encontro', 'Informe o endereço do local de encontro.');
      }
      return;
    }
    const dateStr = selectedDate
      ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
      : '';
    const carLabel = carChoice === 'student'
      ? 'Seu carro'
      : `Carro do instrutor${instructor.carModel ? ` (${instructor.carModel})` : ''}`;
    const meetingLabel = getMeetingPointLabel();
    const msg = `Sua solicitação foi enviada para ${instructor.name}.\n\nData: ${dateStr}\nHorários: ${selectedSlots.join(', ')}\nVeículo: ${carLabel}\nLocal de encontro: ${meetingLabel}\n\nAguarde a confirmação do instrutor.`;
    if (Platform.OS === 'web') {
      window.alert(`Aula Solicitada!\n\n${msg}`);
      navigation.goBack();
    } else {
      Alert.alert('Aula Solicitada!', msg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
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
          <Avatar uri={instructor.photo} name={instructor.name} size={80} style={styles.heroPhotoFlex} />
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
            {instructor.carOptions === 'student' ? (
              <>
                <Ionicons name="car-sport-outline" size={20} color="#2563EB" />
                <Text style={[styles.infoValue, { color: '#2563EB' }]} numberOfLines={1}>Carro do aluno</Text>
                <Text style={styles.infoLabel}>veículo</Text>
              </>
            ) : (
              <>
                <Ionicons name="car-outline" size={20} color="#2563EB" />
                <Text style={styles.infoValue} numberOfLines={1}>{instructor.carModel || '—'}</Text>
                <Text style={styles.infoLabel}>veículo</Text>
              </>
            )}
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

        {/* Plans */}
        {plans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planos disponíveis</Text>
            <Text style={styles.sectionSub}>Economize contratando um pacote de aulas</Text>
            {plans.map(plan => {
              const originalTotal = instructor.pricePerHour * plan.classCount;
              const savings = originalTotal - plan.price;
              const discountPct = Math.round((savings / originalTotal) * 100);
              const pricePerClass = (plan.price / plan.classCount).toFixed(0);
              return (
                <View key={plan.id} style={styles.planCard}>
                  <View style={styles.planCardTop}>
                    <View style={styles.planIconBox}>
                      <Ionicons name={CLASS_TYPE_ICON[plan.classType] || 'layers-outline'} size={20} color={PRIMARY} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planDesc} numberOfLines={2}>{plan.description}</Text>
                    </View>
                    {discountPct > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>-{discountPct}%</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.planChipsRow}>
                    <View style={styles.planChip}>
                      <Ionicons name="school-outline" size={11} color={PRIMARY} />
                      <Text style={styles.planChipText}>{plan.classCount} aulas</Text>
                    </View>
                    <View style={[styles.planChip, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="time-outline" size={11} color="#2563EB" />
                      <Text style={[styles.planChipText, { color: '#2563EB' }]}>{plan.validityDays} dias</Text>
                    </View>
                    <View style={[styles.planChip, { backgroundColor: '#FFF7ED' }]}>
                      <Ionicons name="layers-outline" size={11} color="#EA580C" />
                      <Text style={[styles.planChipText, { color: '#EA580C' }]}>{plan.classType}</Text>
                    </View>
                  </View>

                  <View style={styles.planFooter}>
                    <View>
                      <Text style={styles.planPrice}>R$ {plan.price}</Text>
                      <Text style={styles.planPriceSub}>R$ {pricePerClass}/aula</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.planContractBtn}
                      onPress={() => navigation.navigate('PlanCheckout', { plan, instructor })}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="bag-outline" size={14} color="#FFF" />
                      <Text style={styles.planContractBtnText}>Contratar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          <Text style={styles.sectionSub}>Selecione a data e os horários para solicitar uma aula</Text>

          {/* Car selector */}
          {instructor.carOptions === 'both' ? (
            <View style={styles.carSelector}>
              <Text style={styles.carSelectorLabel}>Qual carro será usado?</Text>
              <View style={styles.carChipRow}>
                {[
                  { v: 'instructor', label: 'Carro do instrutor', icon: 'car-outline' },
                  { v: 'student',    label: 'Meu carro',          icon: 'car-sport-outline' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.v}
                    style={[styles.carChip, carChoice === opt.v && styles.carChipActive]}
                    onPress={() => setCarChoice(opt.v)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={14}
                      color={carChoice === opt.v ? '#FFF' : '#6B7280'}
                    />
                    <Text style={[styles.carChipText, carChoice === opt.v && styles.carChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.carInfoRow}>
              <Ionicons name="car-outline" size={13} color={PRIMARY} />
              <Text style={styles.carInfoText}>
                {instructor.carOptions === 'student'
                  ? 'Aula realizada no seu próprio carro'
                  : `Aula no veículo do instrutor${instructor.carModel ? ` (${instructor.carModel})` : ''}`}
              </Text>
            </View>
          )}

          {/* Meeting point selector */}
          <View style={styles.meetingSection}>
            <Text style={styles.carSelectorLabel}>Local de encontro</Text>
            <View style={styles.meetingChipRow}>
              {[
                {
                  v: MeetingPointType.STUDENT_HOME,
                  label: 'Minha casa',
                  icon: 'home-outline',
                  disabled: !user?.address,
                },
                {
                  v: MeetingPointType.INSTRUCTOR_LOCATION,
                  label: 'Local do instrutor',
                  icon: 'location-outline',
                  disabled: false,
                },
                {
                  v: MeetingPointType.CUSTOM,
                  label: 'Outro local',
                  icon: 'map-outline',
                  disabled: false,
                },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.v}
                  style={[
                    styles.carChip,
                    meetingType === opt.v && styles.carChipActive,
                    opt.disabled && styles.carChipDisabled,
                  ]}
                  onPress={() => !opt.disabled && setMeetingType(opt.v)}
                  activeOpacity={opt.disabled ? 1 : 0.8}
                >
                  <Ionicons
                    name={opt.icon}
                    size={13}
                    color={
                      opt.disabled ? '#D1D5DB' :
                      meetingType === opt.v ? '#FFF' : '#6B7280'
                    }
                  />
                  <Text style={[
                    styles.carChipText,
                    meetingType === opt.v && styles.carChipTextActive,
                    opt.disabled && styles.carChipTextDisabled,
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Show address hint or custom input */}
            {meetingType === MeetingPointType.STUDENT_HOME && user?.address ? (
              <View style={styles.meetingAddressRow}>
                <Ionicons name="location-outline" size={13} color={PRIMARY} />
                <Text style={styles.meetingAddressText} numberOfLines={2}>{user.address}</Text>
              </View>
            ) : meetingType === MeetingPointType.STUDENT_HOME && !user?.address ? (
              <View style={styles.meetingAddressRow}>
                <Ionicons name="information-circle-outline" size={13} color="#9CA3AF" />
                <Text style={[styles.meetingAddressText, { color: '#9CA3AF' }]}>
                  Cadastre seu endereço no perfil para usar esta opção
                </Text>
              </View>
            ) : meetingType === MeetingPointType.INSTRUCTOR_LOCATION ? (
              <View style={styles.meetingAddressRow}>
                <Ionicons name="location-outline" size={13} color={PRIMARY} />
                <Text style={styles.meetingAddressText} numberOfLines={2}>
                  {instructor.location || 'Local informado pelo instrutor'}
                </Text>
              </View>
            ) : (
              <TextInput
                style={styles.meetingCustomInput}
                placeholder="Digite o endereço do local de encontro"
                placeholderTextColor="#9CA3AF"
                value={customAddress}
                onChangeText={setCustomAddress}
              />
            )}
          </View>

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
  heroPhotoFlex: { flexShrink: 0 },
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

  // Plans
  planCard: {
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14, gap: 10,
  },
  planCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  planIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: `#1D4ED815`,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  planName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  planDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginTop: 2 },
  discountBadge: { backgroundColor: '#16A34A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  discountBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  planChipsRow: { flexDirection: 'row', gap: 6 },
  planChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  planChipText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  planFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  planPrice: { fontSize: 18, fontWeight: '800', color: '#111827' },
  planPriceSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  planContractBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1D4ED8', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  planContractBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Car selector
  carSelector: { marginBottom: 14 },
  carSelectorLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  carChipRow: { flexDirection: 'row', gap: 8 },
  carChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#F9FAFB',
  },
  carChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  carChipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  carChipTextActive: { color: '#FFF' },
  carInfoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EFF6FF', borderRadius: 10, padding: 10, marginBottom: 14,
  },
  carInfoText: { fontSize: 12, color: PRIMARY, fontWeight: '600', flex: 1 },

  meetingSection: { marginBottom: 14 },
  meetingChipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  carChipDisabled: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', opacity: 0.6 },
  carChipTextDisabled: { color: '#D1D5DB' },
  meetingAddressRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#EFF6FF', borderRadius: 10, padding: 10,
  },
  meetingAddressText: { fontSize: 12, color: PRIMARY, fontWeight: '500', flex: 1, lineHeight: 18 },
  meetingCustomInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, padding: 10,
    fontSize: 13, color: '#111827',
  },

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
