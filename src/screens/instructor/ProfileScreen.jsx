import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Image, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

const PRIMARY = '#820AD1';

const achievements = [
  { icon: 'trophy-outline', title: 'Mais de 500 alunos formados', year: '2023' },
  { icon: 'star-outline', title: 'Avaliação 4.9/5.0', year: '2024' },
  { icon: 'checkmark-circle-outline', title: '100% de aprovação', year: '2023' },
];

const recentReviews = [
  { studentName: 'Ana Costa', rating: 5, comment: 'Excelente instrutor! Paciente e didático.', date: '2 dias atrás' },
  { studentName: 'Pedro Santos', rating: 5, comment: 'Aulas claras e objetivas. Recomendo!', date: '1 semana atrás' },
  { studentName: 'Maria Oliveira', rating: 4, comment: 'Muito profissional, me ajudou bastante.', date: '2 semanas atrás' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    carModel: user?.carModel || '',
    licenseCategory: user?.licenseCategory || '',
    pricePerHour: String(user?.pricePerHour || ''),
    bio: 'Instrutor de direção com mais de 5 anos de experiência, especializado em formação de condutores seguros e conscientes.',
  });

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja sair?')) {
        logout();
      }
    } else {
      Alert.alert('Sair', 'Tem certeza que deseja sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Salvo!', 'Perfil atualizado com sucesso.');
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={14}
        color={i < rating ? '#EAB308' : '#D1D5DB'}
      />
    ));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <Text style={styles.headerSub}>Informações profissionais</Text>
        </View>
        <View style={styles.headerActions}>
          {isEditing ? (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={16} color="#FFF" />
              <Text style={styles.saveBtnText}>Salvar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil-outline" size={16} color={PRIMARY} />
              <Text style={styles.editBtnText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + Info */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} />
            {isEditing && (
              <TouchableOpacity style={styles.cameraBtn}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>Instrutor de Direção</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#EAB308" />
            <Text style={styles.ratingText}>{user?.rating}</Text>
            <Text style={styles.ratingCount}>({user?.reviewsCount} avaliações)</Text>
          </View>
          {user?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
              <Text style={styles.verifiedText}>Instrutor Verificado</Text>
            </View>
          )}
        </View>

        {/* Info Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>
          <InfoRow icon="mail-outline" label="E-mail" value={user?.email} editing={false} />
          <InfoRow
            icon="call-outline" label="Telefone" value={formData.phone}
            editing={isEditing} onChangeText={(v) => setFormData(p => ({ ...p, phone: v }))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Profissionais</Text>
          <InfoRow
            icon="car-outline" label="Veículo" value={formData.carModel}
            editing={isEditing} onChangeText={(v) => setFormData(p => ({ ...p, carModel: v }))}
          />
          <InfoRow
            icon="document-text-outline" label="Categoria CNH" value={formData.licenseCategory}
            editing={isEditing} onChangeText={(v) => setFormData(p => ({ ...p, licenseCategory: v }))}
          />
          <InfoRow
            icon="cash-outline" label="Valor por hora" value={`R$ ${formData.pricePerHour}`}
            editing={isEditing} onChangeText={(v) => setFormData(p => ({ ...p, pricePerHour: v }))}
            keyboardType="numeric"
          />
          <InfoRow icon="time-outline" label="Experiência" value="5+ anos" editing={false} />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre Mim</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              multiline
              value={formData.bio}
              onChangeText={(v) => setFormData(p => ({ ...p, bio: v }))}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.bioText}>{formData.bio}</Text>
          )}
        </View>

        {/* Conquistas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          {achievements.map((a, i) => (
            <View key={i} style={styles.achievementRow}>
              <View style={styles.achievementIcon}>
                <Ionicons name={a.icon} size={20} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.achievementTitle}>{a.title}</Text>
                <Text style={styles.achievementYear}>{a.year}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Avaliações Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avaliações Recentes</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Ver todas</Text></TouchableOpacity>
          </View>
          {recentReviews.map((r, i) => (
            <View key={i} style={[styles.reviewRow, i < recentReviews.length - 1 && styles.reviewBorder]}>
              <View style={styles.reviewTop}>
                <View>
                  <Text style={styles.reviewName}>{r.studentName}</Text>
                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 3 }}>
                    {renderStars(r.rating)}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{r.date}</Text>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, editing, onChangeText, keyboardType }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#9CA3AF" style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {editing ? (
          <TextInput
            style={styles.infoInput}
            value={value?.replace('R$ ', '') || value}
            onChangeText={onChangeText}
            keyboardType={keyboardType || 'default'}
          />
        ) : (
          <Text style={styles.infoValue}>{value}</Text>
        )}
      </View>
    </View>
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
  headerActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  editBtnText: { color: PRIMARY, fontWeight: '600', fontSize: 13 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#16A34A', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  content: { padding: 16, paddingBottom: 40 },
  avatarCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: PRIMARY },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: PRIMARY, borderRadius: 14, width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 2 },
  userRole: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  ratingText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  ratingCount: { fontSize: 13, color: '#6B7280' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  verifiedText: { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  section: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },
  seeAll: { fontSize: 13, color: PRIMARY, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  infoIcon: { marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: '#111827', marginTop: 2, fontWeight: '500' },
  infoInput: {
    fontSize: 15, color: '#111827', borderBottomWidth: 1.5,
    borderBottomColor: PRIMARY, paddingVertical: 2, marginTop: 2,
  },
  bioInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 10, fontSize: 14, color: '#374151', minHeight: 80,
  },
  bioText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  achievementRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  achievementIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F0FF', alignItems: 'center', justifyContent: 'center',
  },
  achievementTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  achievementYear: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  reviewRow: { paddingVertical: 12 },
  reviewBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  reviewName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  reviewDate: { fontSize: 12, color: '#9CA3AF' },
  reviewComment: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#FCA5A5', borderRadius: 14, paddingVertical: 14,
    backgroundColor: '#FFF5F5', marginBottom: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
