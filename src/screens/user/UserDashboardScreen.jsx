import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Platform, ActivityIndicator, TextInput, Animated, Dimensions, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useInstructorSearch } from '../../hooks/useInstructorSearch';
import InstructorCard from '../../components/user/InstructorCard';
import LeafletMapView from '../../components/shared/LeafletMapView';

const PRIMARY = '#820AD1';
const MAP_CENTER = { lat: -23.5700, lng: -46.6600 };

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'A', label: 'Moto (A)' },
  { key: 'B', label: 'Carro (B)' },
];

const SCREEN_H = Dimensions.get('window').height;
const EXPANDED_H = SCREEN_H * 0.52;
const COLLAPSED_H = 116; // handle row + search + filters
const MIDPOINT = (EXPANDED_H + COLLAPSED_H) / 2;

export default function UserDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { instructors, loading } = useInstructorSearch();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [panelExpanded, setPanelExpanded] = useState(true);
  const flatRef = useRef(null);
  const mapRef = useRef(null);
  const panelHeight = useRef(new Animated.Value(EXPANDED_H)).current;
  // Track the last "settled" height so PanResponder always has the right base
  const settledHeight = useRef(EXPANDED_H);

  const animateTo = (toValue, expanded) => {
    settledHeight.current = toValue;
    Animated.spring(panelHeight, {
      toValue,
      useNativeDriver: false,
      tension: 70,
      friction: 12,
    }).start();
    setPanelExpanded(expanded);
  };

  const ensureExpanded = () => {
    if (!panelExpanded) animateTo(EXPANDED_H, true);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Only claim the gesture if user moves mostly vertically
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > 5 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderGrant: () => {
        // Freeze animation and capture actual current value
        panelHeight.stopAnimation();
        settledHeight.current = panelHeight._value ?? settledHeight.current;
      },
      onPanResponderMove: (_, gs) => {
        const newH = Math.max(
          COLLAPSED_H,
          Math.min(EXPANDED_H, settledHeight.current - gs.dy),
        );
        panelHeight.setValue(newH);
      },
      onPanResponderRelease: (_, gs) => {
        const projectedH = settledHeight.current - gs.dy;
        // Fast swipe takes priority over position
        if (gs.vy > 0.4 || (gs.dy > 50 && projectedH < EXPANDED_H)) {
          animateTo(COLLAPSED_H, false);
        } else if (gs.vy < -0.4 || gs.dy < -50) {
          animateTo(EXPANDED_H, true);
        } else {
          // Snap to nearest
          const snap = projectedH > MIDPOINT ? EXPANDED_H : COLLAPSED_H;
          animateTo(snap, snap === EXPANDED_H);
        }
      },
      onPanResponderTerminate: (_, gs) => {
        // Interrupted (e.g. scroll claimed the gesture) — snap back
        const projectedH = settledHeight.current - gs.dy;
        const snap = projectedH > MIDPOINT ? EXPANDED_H : COLLAPSED_H;
        animateTo(snap, snap === EXPANDED_H);
      },
    }),
  ).current;

  const filtered = instructors.filter(inst => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.carModel.toLowerCase().includes(search.toLowerCase()) ||
      inst.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || inst.licenseCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const mapMarkers = useMemo(() =>
    instructors.map(inst => ({
      id: inst.id,
      latitude: inst.coordinates.latitude,
      longitude: inst.coordinates.longitude,
      label: `R$ ${inst.pricePerHour}`,
      color: PRIMARY,
      type: 'default',
    })),
    [instructors],
  );

  const handleMarkerPress = (id) => {
    mapRef.current?.highlightMarker(id);
    ensureExpanded();
    const idx = filtered.findIndex(i => i.id === id);
    if (idx >= 0 && flatRef.current) {
      flatRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
    }
  };

  return (
    <View style={styles.container}>
      {/* MAP */}
      <LeafletMapView
        ref={mapRef}
        center={MAP_CENTER}
        zoom={13}
        markers={mapMarkers}
        onMarkerPress={handleMarkerPress}
      />

      {/* HEADER OVERLAY */}
      <SafeAreaView edges={['top']} style={styles.headerOverlay} pointerEvents="box-none">
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Ionicons name="person" size={18} color="#FFF" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerGreeting}>Bem-vindo!</Text>
              <Text style={styles.headerName}>{user?.name || 'Aluno CartaOn'}</Text>
            </View>
          </View>
          <View style={styles.countPill}>
            <Ionicons name="people" size={13} color={PRIMARY} />
            <Text style={styles.countPillText}>{instructors.length} instrutores</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* BOTTOM PANEL */}
      <Animated.View style={[styles.bottomPanel, { height: panelHeight }]}>

        {/* ── Drag handle ── */}
        <View style={styles.handleRow} {...panResponder.panHandlers}>
          <View style={styles.panelHandle} />
          <Ionicons
            name={panelExpanded ? 'chevron-down' : 'chevron-up'}
            size={14}
            color="#9CA3AF"
            style={{ marginTop: 2 }}
          />
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar instrutor, carro..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              onFocus={ensureExpanded}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category filters */}
        <View style={styles.filtersRow}>
          {CATEGORY_FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, categoryFilter === f.key && styles.filterBtnActive]}
              onPress={() => { ensureExpanded(); setCategoryFilter(f.key); }}
            >
              <Text style={[styles.filterBtnText, categoryFilter === f.key && styles.filterBtnTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructor list */}
        {panelExpanded && (
          loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={PRIMARY} size="large" />
              <Text style={styles.loadingText}>Buscando instrutores próximos...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={36} color="#D1D5DB" />
              <Text style={styles.emptyText}>Nenhum instrutor encontrado</Text>
            </View>
          ) : (
            <FlatList
              ref={flatRef}
              data={filtered}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <InstructorCard
                  instructor={item}
                  onPress={() => navigation.navigate('InstructorDetail', { instructor: item })}
                />
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              onScrollToIndexFailed={() => {}}
            />
          )
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, margin: 12, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerGreeting: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerName: { fontSize: 14, fontWeight: '800', color: '#111827', marginTop: 1 },
  countPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F0FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  countPillText: { fontSize: 11, fontWeight: '700', color: PRIMARY },

  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 12,
  },
  handleRow: {
    alignItems: 'center', paddingTop: 10, paddingBottom: 4, cursor: 'grab',
  },
  panelHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB',
  },

  searchRow: { paddingHorizontal: 12, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginBottom: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterBtnActive: { backgroundColor: PRIMARY },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterBtnTextActive: { color: '#FFF' },
  list: { paddingHorizontal: 12, paddingBottom: Platform.OS === 'ios' ? 100 : 80 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#9CA3AF' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
