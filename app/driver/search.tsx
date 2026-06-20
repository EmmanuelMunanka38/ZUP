import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Restaurant } from '@/types';

export default function DriverSearchScreen() {
  const theme = 'light';
  const { restaurants, isLoading, error, loadRestaurants, clearError } = useRestaurantStore();
  const [searchQuery, setSearchQuery] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadRestaurants();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const filtered = searchQuery.trim()
    ? restaurants.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : restaurants;

  const openRestaurants = filtered.filter((r) => r.isOpen);
  const closedRestaurants = filtered.filter((r) => !r.isOpen);

  const renderRestaurant = (restaurant: Restaurant) => (
    <TouchableOpacity
      key={restaurant.id}
      activeOpacity={0.7}
      style={[styles.restaurantCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
    >
      <View style={styles.cardTop}>
        <OptimizedImage uri={restaurant.image} style={styles.restaurantImage} />
        <View style={[styles.openBadge, { backgroundColor: restaurant.isOpen ? Colors[theme].primary : Colors[theme]['on-surface-variant'] }]}>
          <Text style={styles.openBadgeText}>{restaurant.isOpen ? 'Open' : 'Closed'}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.restaurantName, { color: Colors[theme]['on-surface'] }]}>{restaurant.name}</Text>
        <Text style={[styles.cuisine, { color: Colors[theme]['on-surface-variant'] }]}>{restaurant.cuisine}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="star" size={14} color={Colors[theme].secondary} />
            <Text style={[styles.metaText, { color: Colors[theme]['on-surface-variant'] }]}>{restaurant.rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="map-marker" size={14} color={Colors[theme]['on-surface-variant']} />
            <Text style={[styles.metaText, { color: Colors[theme]['on-surface-variant'] }]}>{restaurant.distance}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="bike" size={14} color={Colors[theme]['on-surface-variant']} />
            <Text style={[styles.metaText, { color: Colors[theme]['on-surface-variant'] }]}>{restaurant.deliveryTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Search Restaurants</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors[theme]['on-surface-variant']} />
        <TextInput
          style={[styles.searchInput, { color: Colors[theme]['on-surface'] }]}
          placeholder="Search restaurants or cuisine..."
          placeholderTextColor={Colors[theme]['on-surface-variant']}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close" size={18} color={Colors[theme]['on-surface-variant']} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cloud-off-outline" size={56} color={Colors[theme].error} />
            <Text style={[styles.emptyText, { color: Colors[theme].error }]}>Failed to load restaurants</Text>
            <Text style={[styles.emptySubtext, { color: Colors[theme]['on-surface-variant'] }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: Colors[theme].primary }]}
              onPress={() => { clearError(); loadRestaurants(); }}
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#ffffff" />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {openRestaurants.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>Open Now</Text>
              {openRestaurants.map(renderRestaurant)}
            </>
          )}
          {closedRestaurants.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface-variant'] }]}>Closed</Text>
              {closedRestaurants.map(renderRestaurant)}
            </>
          )}
          {filtered.length === 0 && !error && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="store-off" size={56} color={Colors[theme]['surface-variant']} />
              <Text style={[styles.emptyText, { color: Colors[theme]['on-surface-variant'] }]}>No restaurants found</Text>
              <Text style={[styles.emptySubtext, { color: Colors[theme]['on-surface-variant'] }]}>
                {searchQuery ? 'Try a different search term' : 'No restaurants are currently available'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 56, paddingBottom: Spacing.md,
  },
  headerTitle: { ...Typography.h2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing['container-padding'], marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderRadius: BorderRadius.xl,
  },
  searchInput: { flex: 1, ...Typography['body-md'] },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 40 },
  sectionTitle: { ...Typography.h1, marginBottom: Spacing.md, marginTop: Spacing.sm },
  restaurantCard: {
    borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.md,
    ...Shadows.sm, borderWidth: 1, borderColor: Colors.light['surface-variant'],
  },
  cardTop: { position: 'relative' },
  restaurantImage: { width: '100%', height: 140, backgroundColor: Colors.light['surface-container'] },
  openBadge: {
    position: 'absolute', top: Spacing.sm, left: Spacing.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  openBadgeText: { color: '#ffffff', ...Typography['label-sm'], fontWeight: '700' },
  cardBody: { padding: Spacing.md },
  restaurantName: { ...Typography.h2 },
  cuisine: { ...Typography['body-sm'], marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...Typography['label-sm'] },
  emptyState: { alignItems: 'center', gap: Spacing.md, marginTop: 60 },
  emptyText: { ...Typography['body-md'] },
  emptySubtext: { ...Typography['label-sm'], textAlign: 'center', paddingHorizontal: Spacing.lg },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
  retryBtnText: { ...Typography['label-md'], color: '#ffffff', fontWeight: '700' },
});
