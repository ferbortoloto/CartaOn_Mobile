import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

const PRIMARY = '#820AD1';

const ACHIEVEMENTS = [
  { icon: 'car-outline', label: '5 Aulas', color: '#2563EB', bg: '#EFF6FF' },
  { icon: 'star-outline', label: 'Aluno 5★', color: '#EAB308', bg: '#FFFBEB' },
  { icon: 'checkmark-circle-outline', label: 'Verificado', color: '#16A34A', bg: '#F0FDF4' },
];

const RECENT_CLASSES = [
  { id: '1', instructor: 'Maria Santos', type: 'Aula Prática', date: '18 Fev 2026', status: 'Concluída', statusColor: '#16A34A' },
  { id: '2', instructor: 'Ana Costa', type: 'Simulado', date: '14 Fev 2026', status: 'Concluída', statusColor: '#16A34A' },
  { id: '3', instructor: 'Carlos Oliveira', type: 'Aula Teórica', date: '10 Fev 2026', status: 'Cancelada', statusColor: '#EF4444' },
];

export default function UserProfileScreen() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Aluno CartaOn');
  const [email, setEmail] = useState(user?.email || 'user@gmail.com');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [goal, setGoal] = useState('Categoria B');

  const handleSave = () => {
    setEditing(false);
    Alert.alert('Perfil atualizado!', 'Suas informações foram salvas com sucesso.');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja sair da sua conta?')) logout();
    } else {
      Alert.alert('Sair', 'Deseja sair da sua conta?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => editing ? handleSave() : setEditing(true)}
        >
          <Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={18} color={PRIMARY} />
          <Text style={styles.editBtnText}>{editing ? 'Salvar' : 'Editar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              textAlign="center"
            />
          ) : (
            <Text style={styles.avatarName}>{name}</Text>
          )}
          <View style={styles.roleBadge}>
            <Ionicons name="school-outline" size={12} color={PRIMARY} />
            <Text style={styles.roleText}>Aluno CartaOn</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Aulas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>7h</Text>
            <Text style={styles.statLabel}>Horas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Instrutores</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <View style={styles.achievementsRow}>
            {ACHIEVEMENTS.map((a, i) => (
              <View key={i} style={[styles.achievementItem, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
                <Text style={[styles.achievementLabel, { color: a.color }]}>{a.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Personal info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <InfoField
            icon="mail-outline"
            label="E-mail"
            value={email}
            editing={editing}
            onChange={setEmail}
            keyboardType="email-address"
          />
          <InfoField
            icon="call-outline"
            label="Telefone"
            value={phone}
            editing={editing}
            onChange={setPhone}
            keyboardType="phone-pad"
          />
          <InfoField
            icon="ribbon-outline"
            label="Objetivo"
            value={goal}
            editing={editing}
            onChange={setGoal}
          />
        </View>

        {/* Recent classes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aulas Recentes</Text>
          {RECENT_CLASSES.map(cls => (
            <View key={cls.id} style={styles.classRow}>
              <View style={[styles.classIcon, { backgroundColor: `${PRIMARY}20` }]}>
                <Ionicons name="car-outline" size={18} color={PRIMARY} />
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.classType}>{cls.type}</Text>
                <Text style={styles.classInstructor}>{cls.instructor} · {cls.date}</Text>
              </View>
              <View style={[styles.classStatus, { backgroundColor: `${cls.statusColor}20` }]}>
                <Text style={[styles.classStatusText, { color: cls.statusColor }]}>{cls.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoField({ icon, label, value, editing, onChange, keyboardType }) {
  return (
    <View style={styles.infoField}>
      <View style={styles.infoFieldLabel}>
        <Ionicons name={icon} size={14} color="#9CA3AF" />
        <Text style={styles.infoFieldLabelText}>{label}</Text>
      </View>
      {editing ? (
        <TextInput
          style={styles.infoFieldInput}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      ) : (
        <Text style={styles.infoFieldValue}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${PRIMARY}15`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: PRIMARY },

  scroll: { flex: 1 },

  avatarSection: { alignItems: 'center', paddingVertical: 28, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  avatarLetter: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  avatarName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  nameInput: {
    fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6,
    borderBottomWidth: 2, borderBottomColor: PRIMARY, paddingBottom: 4, minWidth: 180,
  },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${PRIMARY}15`, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: PRIMARY },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 14, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: PRIMARY },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 3 },
  statDivider: { width: 1, height: 32, backgroundColor: '#E5E7EB' },

  section: {
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 14, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },

  achievementsRow: { flexDirection: 'row', gap: 8 },
  achievementItem: { flex: 1, alignItems: 'center', borderRadius: 12, paddingVertical: 12, gap: 5 },
  achievementLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  infoField: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 12 },
  infoFieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  infoFieldLabelText: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoFieldValue: { fontSize: 15, color: '#111827', fontWeight: '500' },
  infoFieldInput: {
    fontSize: 15, color: '#111827', fontWeight: '500',
    borderBottomWidth: 1.5, borderBottomColor: PRIMARY, paddingBottom: 4,
  },

  classRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  classIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  classInfo: { flex: 1 },
  classType: { fontSize: 14, fontWeight: '700', color: '#111827' },
  classInstructor: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  classStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  classStatusText: { fontSize: 11, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center',
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#FCA5A5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
