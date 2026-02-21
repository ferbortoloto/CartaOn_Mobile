import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#820AD1';

export default function InstructorCard({ instructor, onPress }) {
  const catColor = instructor.licenseCategory === 'A' ? '#EA580C' : '#2563EB';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: instructor.photo }} style={styles.photo} />

      <View style={styles.info}>
        {/* Name + verified */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{instructor.name}</Text>
          {instructor.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
          )}
        </View>

        {/* Car + Category */}
        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={12} color="#9CA3AF" />
          <Text style={styles.detailText} numberOfLines={1}>{instructor.carModel}</Text>
          <View style={[styles.catBadge, { backgroundColor: `${catColor}20` }]}>
            <Text style={[styles.catText, { color: catColor }]}>Cat. {instructor.licenseCategory}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={12} color="#9CA3AF" />
          <Text style={styles.detailText} numberOfLines={1}>{instructor.location}</Text>
        </View>

        {/* Rating + Price */}
        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#EAB308" />
            <Text style={styles.ratingText}>{instructor.rating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>({instructor.reviewsCount})</Text>
          </View>
          <Text style={styles.price}>R$ {instructor.pricePerHour}/h</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  photo: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', flexShrink: 0 },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#6B7280', flex: 1 },
  catBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  catText: { fontSize: 10, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  reviewsText: { fontSize: 11, color: '#9CA3AF' },
  price: { fontSize: 13, fontWeight: '800', color: PRIMARY },
});
