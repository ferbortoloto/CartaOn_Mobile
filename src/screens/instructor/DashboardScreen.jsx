import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ScrollView, Image, Platform, Alert, Animated, Dimensions, PanResponder,
  TextInput, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useSchedule } from '../../context/ScheduleContext';
import { usePlans } from '../../context/PlansContext';
import LeafletMapView from '../../components/shared/LeafletMapView';

const PRIMARY = '#820AD1';
const SCREEN_H = Dimensions.get('window').height;
const EXPANDED_H = SCREEN_H * 0.48;
const COLLAPSED_H = 88; // handle + kpi strip
const MIDPOINT = (EXPANDED_H + COLLAPSED_H) / 2;

const INSTRUCTOR_LOCATION = { latitude: -23.5505, longitude: -46.6333 };

const TYPE_COLOR = {
  'Aula Prática': { bg: '#F0FDF4', text: '#16A34A' },
  'Aula Teórica': { bg: '#EFF6FF', text: '#2563EB' },
  'Simulado':     { bg: '#FFF7ED', text: '#EA580C' },
};

const CLASS_TYPES = ['Aula Prática', 'Aula Teórica', 'Misto'];

const CLASS_TYPE_ICON = {
  'Aula Prática': 'car-outline',
  'Aula Teórica': 'book-outline',
  'Misto':        'grid-outline',
};

// Instructor ID for mock — must match IDs in src/data/instructors.js ('1' = Maria Santos)
const DEMO_INSTRUCTOR_ID = '1';

const INITIAL_REQUESTS = [
  {
    id: '1', studentName: 'Ana Costa',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop',
    location: 'Av. Paulista, 1000 - Bela Vista', distance: '2.3 km', estimatedTime: '8 min',
    type: 'Aula Prática', price: 85, rating: 4.8, phone: '(11) 98765-4321',
    status: 'pending', requestTime: '2 min atrás',
    coordinates: { latitude: -23.5634, longitude: -46.6521 },
  },
  {
    id: '2', studentName: 'Pedro Santos',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    location: 'Rua Augusta, 1500 - Consolação', distance: '3.1 km', estimatedTime: '12 min',
    type: 'Aula Teórica', price: 60, rating: 4.9, phone: '(11) 97654-3210',
    status: 'pending', requestTime: '5 min atrás',
    coordinates: { latitude: -23.5505, longitude: -46.6433 },
  },
  {
    id: '3', studentName: 'Maria Oliveira',
    studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
    location: 'Alameda Santos, 2000 - Jardim Paulista', distance: '1.8 km', estimatedTime: '6 min',
    type: 'Simulado', price: 70, rating: 5.0, phone: '(11) 96543-2109',
    status: 'pending', requestTime: '8 min atrás',
    coordinates: { latitude: -23.5669, longitude: -46.6555 },
  },
  {
    id: '4', studentName: 'João Silva',
    studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
    location: 'Rua Oscar Freire, 500 - Pinheiros', distance: '4.2 km', estimatedTime: '15 min',
    type: 'Aula Prática', price: 85, rating: 4.7, phone: '(11) 95432-1098',
    status: 'accepted', requestTime: '10 min atrás',
    coordinates: { latitude: -23.5613, longitude: -46.6689 },
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1', type: 'request', title: 'Nova solicitação de aula',
    body: 'Ana Costa quer Aula Prática • 2.3 km • R$ 85', time: '2 min atrás', read: false, requestId: '1',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop',
  },
  {
    id: 'n2', type: 'message', title: 'Mensagem de Pedro Santos',
    body: 'Professor, posso adiantar a aula para as 14h hoje?', time: '5 min atrás', read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
  },
  {
    id: 'n3', type: 'late', title: 'Aluno atrasado',
    body: 'Maria Oliveira está 15 min atrasada para a aula das 10h00', time: '8 min atrás', read: false,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
  },
  {
    id: 'n4', type: 'request', title: 'Nova solicitação de aula',
    body: 'Pedro Santos quer Aula Teórica • 3.1 km • R$ 60', time: '5 min atrás', read: false, requestId: '2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
  },
  {
    id: 'n5', type: 'message', title: 'Mensagem de Ana Costa',
    body: 'Olá! Confirmo presença para amanhã às 9h. Obrigada!', time: '20 min atrás', read: true,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop',
  },
];

const NOTIF_STYLE = {
  request: { bg: '#F5F0FF', icon: 'notifications-outline', color: '#820AD1', label: 'Solicitação' },
  message: { bg: '#EFF6FF', icon: 'chatbubble-outline', color: '#2563EB', label: 'Mensagem' },
  late:    { bg: '#FFFBEB', icon: 'warning-outline',     color: '#CA8A04', label: 'Atraso' },
};

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { addEvent, addContact } = useSchedule();
  const { getInstructorPlans, togglePlan, addPlan } = usePlans();

  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'plans'
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  // New plan form state
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanCount, setNewPlanCount] = useState('5');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanValidity, setNewPlanValidity] = useState('60');
  const [newPlanType, setNewPlanType] = useState('Aula Prática');

  const panelHeight = useRef(new Animated.Value(EXPANDED_H)).current;
  const settledHeight = useRef(EXPANDED_H);

  const instructorPlans = getInstructorPlans(DEMO_INSTRUCTOR_ID);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const unreadCount = notifications.filter(n => !n.read).length;
  const estimatedRevenue = acceptedRequests.reduce((s, r) => s + r.price, 0);

  const handleSaveNewPlan = () => {
    if (!newPlanName.trim() || !newPlanPrice.trim()) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha nome e preço do plano.');
      return;
    }
    addPlan({
      instructorId: DEMO_INSTRUCTOR_ID,
      name: newPlanName.trim(),
      description: newPlanDesc.trim(),
      classCount: parseInt(newPlanCount, 10) || 5,
      classType: newPlanType,
      price: parseFloat(newPlanPrice.replace(',', '.')) || 0,
      validityDays: parseInt(newPlanValidity, 10) || 60,
    });
    setNewPlanName('');
    setNewPlanDesc('');
    setNewPlanCount('5');
    setNewPlanPrice('');
    setNewPlanValidity('60');
    setNewPlanType('Aula Prática');
    setShowNewPlanModal(false);
    Alert.alert('Plano criado!', 'Seu novo plano já está disponível para os alunos.');
  };

  const animateTo = (toValue, expanded) => {
    settledHeight.current = toValue;
    Animated.spring(panelHeight, { toValue, useNativeDriver: false, tension: 70, friction: 12 }).start();
    setPanelExpanded(expanded);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > 5 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderGrant: () => {
        panelHeight.stopAnimation();
        settledHeight.current = panelHeight._value ?? settledHeight.current;
      },
      onPanResponderMove: (_, gs) => {
        panelHeight.setValue(
          Math.max(COLLAPSED_H, Math.min(EXPANDED_H, settledHeight.current - gs.dy)),
        );
      },
      onPanResponderRelease: (_, gs) => {
        const proj = settledHeight.current - gs.dy;
        if (gs.vy > 0.4 || (gs.dy > 50 && proj < EXPANDED_H)) {
          animateTo(COLLAPSED_H, false);
        } else if (gs.vy < -0.4 || gs.dy < -50) {
          animateTo(EXPANDED_H, true);
        } else {
          const snap = proj > MIDPOINT ? EXPANDED_H : COLLAPSED_H;
          animateTo(snap, snap === EXPANDED_H);
        }
      },
      onPanResponderTerminate: (_, gs) => {
        const proj = settledHeight.current - gs.dy;
        const snap = proj > MIDPOINT ? EXPANDED_H : COLLAPSED_H;
        animateTo(snap, snap === EXPANDED_H);
      },
    }),
  ).current;

  const mapMarkers = useMemo(() => [
    { id: 'self', latitude: INSTRUCTOR_LOCATION.latitude, longitude: INSTRUCTOR_LOCATION.longitude, label: 'Você', color: PRIMARY, type: 'self' },
    ...requests.map(req => ({
      id: req.id,
      latitude: req.coordinates.latitude,
      longitude: req.coordinates.longitude,
      label: `R$ ${req.price}`,
      color: req.status === 'accepted' ? '#16A34A' : '#EF4444',
      type: 'default',
    })),
  ], [requests]);

  const handleAcceptRequest = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    const newContact = addContact({
      name: request.studentName,
      email: `${request.studentName.toLowerCase().replace(' ', '.')}@email.com`,
      phone: request.phone, status: 'active',
      notes: `Aluno solicitou aula de ${request.type}`,
    });
    addEvent({
      title: `Aula de ${request.type} - ${request.studentName}`,
      type: 'class', priority: 'medium',
      startDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      endDateTime:   new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      contactId: newContact?.id, location: request.location,
      description: `Aula de ${request.type} via app. Valor: R$ ${request.price}`,
      status: 'scheduled',
    });
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
    setNotifications(prev => prev.map(n => n.requestId === requestId ? { ...n, read: true } : n));
    setSelectedRequest(null);
    Alert.alert('Aula aceita!', `Aula com ${request.studentName} adicionada à agenda.`);
  };

  const handleRejectRequest = (requestId) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    setNotifications(prev => prev.filter(n => n.requestId !== requestId));
    setSelectedRequest(null);
  };

  const handleNotificationPress = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.type === 'request' && notif.requestId) {
      const req = requests.find(r => r.id === notif.requestId);
      if (req?.status === 'pending') { setShowNotifications(false); setSelectedRequest(req); }
    } else if (notif.type === 'message') {
      setShowNotifications(false); navigation.navigate('Chat');
    }
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <View style={styles.container}>
      {/* MAP */}
      <LeafletMapView
        center={{ lat: INSTRUCTOR_LOCATION.latitude, lng: INSTRUCTOR_LOCATION.longitude }}
        zoom={14} markers={mapMarkers}
        onMarkerPress={(id) => {
          const req = requests.find(r => r.id === id);
          if (req?.status === 'pending') { animateTo(EXPANDED_H, true); setSelectedRequest(req); }
        }}
      />

      {/* HEADER OVERLAY */}
      <SafeAreaView edges={['top']} style={styles.headerOverlay}>
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
            <View>
              <Text style={styles.headerGreeting}>Bem-vindo</Text>
              <Text style={styles.headerName}>{user?.name || 'Instrutor CartaOn'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => setShowNotifications(true)} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* BOTTOM PANEL */}
      <Animated.View style={[styles.bottomPanel, { height: panelHeight }]}>

        {/* Drag handle */}
        <View style={styles.handleRow} {...panResponder.panHandlers}>
          <View style={styles.panelHandle} />
          <Ionicons name={panelExpanded ? 'chevron-down' : 'chevron-up'} size={13} color="#D1D5DB" style={{ marginTop: 2 }} />
        </View>

        {/* ── KPI strip ── */}
        <View style={styles.kpiStrip}>
          <View style={[styles.kpiChip, { backgroundColor: '#F5F0FF' }]}>
            <Ionicons name="notifications-outline" size={14} color={PRIMARY} />
            <Text style={[styles.kpiNum, { color: PRIMARY }]}>{pendingRequests.length}</Text>
            <Text style={[styles.kpiLbl, { color: PRIMARY }]}>Pendentes</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={[styles.kpiChip, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" />
            <Text style={[styles.kpiNum, { color: '#16A34A' }]}>{acceptedRequests.length}</Text>
            <Text style={[styles.kpiLbl, { color: '#16A34A' }]}>Aceitas</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={[styles.kpiChip, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="wallet-outline" size={14} color="#2563EB" />
            <Text style={[styles.kpiNum, { color: '#2563EB' }]}>R${estimatedRevenue}</Text>
            <Text style={[styles.kpiLbl, { color: '#2563EB' }]}>Estimado</Text>
          </View>
        </View>

        {/* ── Tab switcher ── */}
        {panelExpanded && (
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
              onPress={() => setActiveTab('requests')}
            >
              <Ionicons name="notifications-outline" size={13} color={activeTab === 'requests' ? PRIMARY : '#9CA3AF'} />
              <Text style={[styles.tabBtnText, activeTab === 'requests' && styles.tabBtnTextActive]}>
                Solicitações
              </Text>
              {pendingRequests.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{pendingRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'plans' && styles.tabBtnActive]}
              onPress={() => setActiveTab('plans')}
            >
              <Ionicons name="layers-outline" size={13} color={activeTab === 'plans' ? PRIMARY : '#9CA3AF'} />
              <Text style={[styles.tabBtnText, activeTab === 'plans' && styles.tabBtnTextActive]}>
                Planos
              </Text>
              <View style={[styles.tabBadge, { backgroundColor: '#F5F0FF' }]}>
                <Text style={[styles.tabBadgeText, { color: PRIMARY }]}>{instructorPlans.length}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── REQUESTS TAB ── */}
        {panelExpanded && activeTab === 'requests' && (
          pendingRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="checkmark-done-outline" size={28} color={PRIMARY} />
              </View>
              <Text style={styles.emptyTitle}>Tudo em dia!</Text>
              <Text style={styles.emptyText}>Nenhuma solicitação pendente no momento.</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.cardsList}
              contentContainerStyle={styles.cardsContent}
              showsVerticalScrollIndicator={false}
            >
              {pendingRequests.map(req => {
                const tc = TYPE_COLOR[req.type] || { bg: '#F3F4F6', text: '#6B7280' };
                return (
                  <TouchableOpacity
                    key={req.id}
                    style={styles.reqCard}
                    onPress={() => setSelectedRequest(req)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.reqAccent} />
                    <View style={styles.reqBody}>
                      <View style={styles.reqTopRow}>
                        <Image source={{ uri: req.studentAvatar }} style={styles.reqAvatar} />
                        <View style={styles.reqNameBlock}>
                          <Text style={styles.reqName}>{req.studentName}</Text>
                          <View style={styles.reqBadgesRow}>
                            <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
                              <Text style={[styles.typeBadgeText, { color: tc.text }]}>{req.type}</Text>
                            </View>
                            <View style={styles.ratingPill}>
                              <Ionicons name="star" size={10} color="#EAB308" />
                              <Text style={styles.ratingText}>{req.rating}</Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.reqPrice}>R$ {req.price}</Text>
                      </View>
                      <View style={styles.reqLocRow}>
                        <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.reqLocText} numberOfLines={1}>{req.location}</Text>
                      </View>
                      <View style={styles.reqMetaRow}>
                        <Ionicons name="navigate-outline" size={11} color="#6B7280" />
                        <Text style={styles.reqMetaText}>{req.distance}</Text>
                        <View style={styles.metaDot} />
                        <Ionicons name="time-outline" size={11} color="#6B7280" />
                        <Text style={styles.reqMetaText}>{req.estimatedTime}</Text>
                        <Text style={styles.reqAgo}>{req.requestTime}</Text>
                      </View>
                      <View style={styles.reqActions}>
                        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectRequest(req.id)}>
                          <Ionicons name="close" size={13} color="#EF4444" />
                          <Text style={styles.rejectBtnText}>Recusar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptRequest(req.id)}>
                          <Ionicons name="checkmark" size={13} color="#FFF" />
                          <Text style={styles.acceptBtnText}>Aceitar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.detailBtn} onPress={() => setSelectedRequest(req)}>
                          <Text style={styles.detailBtnText}>Detalhes</Text>
                          <Ionicons name="chevron-forward" size={12} color={PRIMARY} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )
        )}

        {/* ── PLANS TAB ── */}
        {panelExpanded && activeTab === 'plans' && (
          <ScrollView
            style={styles.cardsList}
            contentContainerStyle={styles.cardsContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header row */}
            <View style={styles.plansHeader}>
              <Text style={styles.plansHeaderText}>
                {instructorPlans.filter(p => p.isActive).length} plano{instructorPlans.filter(p => p.isActive).length !== 1 ? 's' : ''} ativo{instructorPlans.filter(p => p.isActive).length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity style={styles.newPlanBtn} onPress={() => setShowNewPlanModal(true)}>
                <Ionicons name="add" size={14} color="#FFF" />
                <Text style={styles.newPlanBtnText}>Novo Plano</Text>
              </TouchableOpacity>
            </View>

            {instructorPlans.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="layers-outline" size={28} color={PRIMARY} />
                </View>
                <Text style={styles.emptyTitle}>Sem planos</Text>
                <Text style={styles.emptyText}>Crie planos de aulas para atrair mais alunos.</Text>
              </View>
            ) : (
              instructorPlans.map(plan => {
                const pricePerClass = (plan.price / plan.classCount).toFixed(0);
                return (
                  <View key={plan.id} style={[styles.planCard, !plan.isActive && styles.planCardInactive]}>
                    <View style={styles.planCardLeft}>
                      <View style={[styles.planIconBox, { opacity: plan.isActive ? 1 : 0.4 }]}>
                        <Ionicons name={CLASS_TYPE_ICON[plan.classType] || 'layers-outline'} size={18} color={PRIMARY} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.planCardName, !plan.isActive && styles.planCardNameInactive]}>
                          {plan.name}
                        </Text>
                        <View style={styles.planCardMeta}>
                          <Text style={styles.planCardMetaText}>{plan.classCount} aulas · {plan.validityDays} dias</Text>
                          <View style={styles.metaDot} />
                          <Text style={styles.planCardMetaText}>{plan.classType}</Text>
                        </View>
                        <View style={styles.planCardPriceRow}>
                          <Text style={[styles.planCardPrice, !plan.isActive && { color: '#9CA3AF' }]}>
                            R$ {plan.price}
                          </Text>
                          <Text style={styles.planCardPriceSub}>R$ {pricePerClass}/aula</Text>
                          {plan.purchasedBy > 0 && (
                            <View style={styles.purchasedPill}>
                              <Ionicons name="people-outline" size={10} color="#6B7280" />
                              <Text style={styles.purchasedPillText}>{plan.purchasedBy}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <Switch
                      value={plan.isActive}
                      onValueChange={() => togglePlan(plan.id)}
                      trackColor={{ false: '#E5E7EB', true: `#820AD160` }}
                      thumbColor={plan.isActive ? PRIMARY : '#9CA3AF'}
                    />
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </Animated.View>

      {/* ── NEW PLAN MODAL ── */}
      <Modal visible={showNewPlanModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNewPlanModal(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo Plano</Text>
            <TouchableOpacity onPress={() => setShowNewPlanModal(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do plano *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Pacote Iniciante"
                placeholderTextColor="#9CA3AF"
                value={newPlanName}
                onChangeText={setNewPlanName}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, { height: 72, textAlignVertical: 'top' }]}
                placeholder="Descreva o que está incluso..."
                placeholderTextColor="#9CA3AF"
                value={newPlanDesc}
                onChangeText={setNewPlanDesc}
                multiline
              />
            </View>

            <Text style={styles.formLabel}>Tipo de aula</Text>
            <View style={styles.typeSelector}>
              {CLASS_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeSelectorBtn, newPlanType === t && styles.typeSelectorBtnActive]}
                  onPress={() => setNewPlanType(t)}
                >
                  <Ionicons name={CLASS_TYPE_ICON[t]} size={14} color={newPlanType === t ? PRIMARY : '#6B7280'} />
                  <Text style={[styles.typeSelectorText, newPlanType === t && styles.typeSelectorTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Nº de aulas</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="5"
                  placeholderTextColor="#9CA3AF"
                  value={newPlanCount}
                  onChangeText={setNewPlanCount}
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Validade (dias)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="60"
                  placeholderTextColor="#9CA3AF"
                  value={newPlanValidity}
                  onChangeText={setNewPlanValidity}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preço total (R$) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: 390,00"
                placeholderTextColor="#9CA3AF"
                value={newPlanPrice}
                onChangeText={setNewPlanPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalRejectBtn} onPress={() => setShowNewPlanModal(false)}>
              <Text style={styles.modalRejectText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalAcceptBtn} onPress={handleSaveNewPlan}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={styles.modalAcceptText}>Salvar Plano</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── NOTIFICATIONS MODAL ── */}
      <Modal visible={showNotifications} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNotifications(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="notifications" size={20} color="#374151" />
              <Text style={styles.modalTitle}>Notificações</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} nova{unreadCount > 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Marcar lidas</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.notifList}>
            {notifications.map(notif => {
              const cfg = NOTIF_STYLE[notif.type] || NOTIF_STYLE.message;
              return (
                <TouchableOpacity key={notif.id} style={[styles.notifItem, !notif.read && styles.notifUnread]} onPress={() => handleNotificationPress(notif)} activeOpacity={0.75}>
                  <View style={[styles.notifIconBox, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon} size={18} color={cfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <Text style={[styles.notifTitle, !notif.read && { fontWeight: '700', color: '#111827' }]} numberOfLines={1}>{notif.title}</Text>
                      {!notif.read && <View style={styles.notifDot} />}
                    </View>
                    <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={[styles.notifTypeBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.notifTypeText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                      <Text style={styles.notifTime}>{notif.time}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── REQUEST DETAIL MODAL ── */}
      <Modal visible={!!selectedRequest} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedRequest(null)}>
        {selectedRequest && (
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Solicitação</Text>
              <TouchableOpacity onPress={() => setSelectedRequest(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              <View style={styles.detailStudentRow}>
                <Image source={{ uri: selectedRequest.studentAvatar }} style={styles.detailAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailStudentName}>{selectedRequest.studentName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Ionicons name="star" size={13} color="#EAB308" />
                    <Text style={styles.detailRating}>{selectedRequest.rating}</Text>
                    <Text style={styles.detailAgo}>• {selectedRequest.requestTime}</Text>
                  </View>
                </View>
                <View style={styles.detailPriceTag}>
                  <Text style={styles.detailPriceLabel}>Valor</Text>
                  <Text style={styles.detailPriceVal}>R$ {selectedRequest.price}</Text>
                </View>
              </View>

              <View style={styles.detailBody}>
                <DetailRow icon="car-outline"      label="Tipo de Aula" value={selectedRequest.type} />
                <DetailRow icon="location-outline" label="Local"        value={selectedRequest.location} />
                <DetailRow icon="call-outline"     label="Contato"      value={selectedRequest.phone} />
                <View style={styles.detailGrid}>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridVal}>{selectedRequest.distance}</Text>
                    <Text style={styles.detailGridLbl}>Distância</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridVal}>{selectedRequest.estimatedTime}</Text>
                    <Text style={styles.detailGridLbl}>Tempo estimado</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalRejectBtn} onPress={() => handleRejectRequest(selectedRequest.id)}>
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.modalRejectText}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAcceptBtn} onPress={() => handleAcceptRequest(selectedRequest.id)}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                <Text style={styles.modalAcceptText}>Aceitar Aula</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRowItem}>
      <Ionicons name={icon} size={16} color="#9CA3AF" />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailRowLabel}>{label}</Text>
        <Text style={styles.detailRowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, margin: 12, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  headerGreeting: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase' },
  headerName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  bellBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 17, height: 17, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#FFF' },
  bellBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  // ── Bottom panel ──
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 10,
  },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 2, cursor: 'grab' },
  panelHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },

  // ── KPI strip ──
  kpiStrip: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 14, marginTop: 8, marginBottom: 4,
    backgroundColor: '#FAFAFA', borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  kpiChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 4 },
  kpiNum: { fontSize: 15, fontWeight: '800' },
  kpiLbl: { fontSize: 10, fontWeight: '600' },
  kpiDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB', marginHorizontal: 6 },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151' },
  sectionBadge: { backgroundColor: '#FEE2E2', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', color: '#EF4444' },

  // ── Request cards ──
  cardsList: { flex: 1 },
  cardsContent: { paddingHorizontal: 12, paddingBottom: Platform.OS === 'ios' ? 90 : 16, gap: 8 },

  reqCard: {
    flexDirection: 'row', backgroundColor: '#FFF',
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  reqAccent: { width: 4, backgroundColor: '#EF4444' },
  reqBody: { flex: 1, padding: 12, gap: 6 },

  reqTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reqAvatar: { width: 40, height: 40, borderRadius: 20 },
  reqNameBlock: { flex: 1 },
  reqName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  reqBadgesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  typeBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, color: '#374151', fontWeight: '600' },
  reqPrice: { fontSize: 17, fontWeight: '800', color: '#111827' },

  reqLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reqLocText: { fontSize: 11, color: '#6B7280', flex: 1 },

  reqMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reqMetaText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB' },
  reqAgo: { fontSize: 10, color: '#9CA3AF', marginLeft: 'auto' },

  reqActions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#FFF5F5' },
  rejectBtnText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 5, backgroundColor: '#16A34A' },
  acceptBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' },
  detailBtnText: { fontSize: 12, color: PRIMARY, fontWeight: '600' },

  // ── Tab switcher ──
  tabSwitcher: {
    flexDirection: 'row', marginHorizontal: 14, marginTop: 8, marginBottom: 4,
    backgroundColor: '#F3F4F6', borderRadius: 12, padding: 3, gap: 3,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: 10, paddingVertical: 7,
  },
  tabBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  tabBtnTextActive: { color: PRIMARY, fontWeight: '700' },
  tabBadge: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeText: { fontSize: 10, fontWeight: '800', color: '#EF4444' },

  // ── Plans tab ──
  plansHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  plansHeaderText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  newPlanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PRIMARY, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  newPlanBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },

  planCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 14,
    borderWidth: 1, borderColor: '#F3F4F6', padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    gap: 10,
  },
  planCardInactive: { backgroundColor: '#FAFAFA', opacity: 0.7 },
  planCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  planIconBox: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: `#820AD115`,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  planCardName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  planCardNameInactive: { color: '#9CA3AF' },
  planCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  planCardMetaText: { fontSize: 11, color: '#9CA3AF' },
  planCardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  planCardPrice: { fontSize: 15, fontWeight: '800', color: '#111827' },
  planCardPriceSub: { fontSize: 10, color: '#9CA3AF' },
  purchasedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  purchasedPillText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },

  // ── Form (new plan modal) ──
  formGroup: { gap: 6 },
  formRow: { flexDirection: 'row', gap: 12 },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.3 },
  formInput: {
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#111827',
  },
  typeSelector: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeSelectorBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  typeSelectorBtnActive: { borderColor: PRIMARY, backgroundColor: '#F5F0FF' },
  typeSelectorText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  typeSelectorTextActive: { color: PRIMARY, fontWeight: '700' },

  // ── Empty state ──
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F5F0FF', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },

  // ── Modals ──
  modalSafe: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  unreadBadge: { backgroundColor: '#FEE2E2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  unreadBadgeText: { fontSize: 11, fontWeight: '700', color: '#EF4444' },
  markAllBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F5F0FF', borderRadius: 8 },
  markAllText: { fontSize: 12, color: PRIMARY, fontWeight: '600' },
  closeBtn: { padding: 4 },

  notifList: { flex: 1 },
  notifItem: { flexDirection: 'row', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  notifUnread: { backgroundColor: '#FAFAFE' },
  notifIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitle: { fontSize: 13, color: '#374151', fontWeight: '500', flex: 1 },
  notifBody: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  notifDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: PRIMARY },
  notifTypeBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  notifTypeText: { fontSize: 10, fontWeight: '700' },
  notifTime: { fontSize: 11, color: '#9CA3AF' },

  detailStudentRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailAvatar: { width: 60, height: 60, borderRadius: 30 },
  detailStudentName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  detailRating: { fontSize: 13, fontWeight: '600', color: '#374151' },
  detailAgo: { fontSize: 12, color: '#9CA3AF' },
  detailPriceTag: { alignItems: 'center', backgroundColor: '#F5F0FF', borderRadius: 12, padding: 10 },
  detailPriceLabel: { fontSize: 10, color: PRIMARY, fontWeight: '600', textTransform: 'uppercase' },
  detailPriceVal: { fontSize: 20, fontWeight: '800', color: PRIMARY },

  detailBody: { padding: 20, gap: 14 },
  detailRowItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailRowLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' },
  detailRowValue: { fontSize: 14, color: '#111827', fontWeight: '500', marginTop: 2 },
  detailGrid: { flexDirection: 'row', gap: 12 },
  detailGridItem: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, alignItems: 'center' },
  detailGridVal: { fontSize: 18, fontWeight: '800', color: '#111827' },
  detailGridLbl: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  modalActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  modalRejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 14, paddingVertical: 14, backgroundColor: '#FFF5F5' },
  modalRejectText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  modalAcceptBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#16A34A', borderRadius: 14, paddingVertical: 14 },
  modalAcceptText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
