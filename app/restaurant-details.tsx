import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Popular', 'Appetizers', 'Mains', 'Sides', 'Drinks'];

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = 'light';
  const [activeCategory, setActiveCategory] = useState('All');
  const addItem = useCartStore((s) => s.addItem);
  const setRestaurantName = useCartStore((s) => s.setRestaurantName);
  const cartCount = useCartStore((s) => s.itemCount());
  const cartSubtotal = useCartStore((s) => s.subtotal());

  const restaurant = useRestaurantStore((s) => s.currentRestaurant);
  const isLoading = useRestaurantStore((s) => s.isLoading);
  const loadCurrentRestaurant = useRestaurantStore((s) => s.loadCurrentRestaurant);

  useEffect(() => {
    if (id) {
      loadCurrentRestaurant(id);
    }
  }, [id, loadCurrentRestaurant]);

  useEffect(() => {
    if (restaurant) {
      setRestaurantName(restaurant.name);
    }
  }, [restaurant, setRestaurantName]);

  const filteredItems = useMemo(() => {
    if (!restaurant) return [];
    if (activeCategory === 'All') return restaurant.menu;
    if (activeCategory === 'Popular')
      return restaurant.menu.filter((m) => m.isPopular);
    return restaurant.menu.filter((m) => m.category === activeCategory);
  }, [activeCategory, restaurant]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors[theme].primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.emptyText, { color: Colors[theme]['on-surface-variant'] }]}>
          Restaurant not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.goBack, { color: Colors[theme].primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.headerBar, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerLabel, { color: Colors[theme]['on-surface-variant'] }]}>
              Deliver to Current Location
            </Text>
            <Text style={[styles.headerLocation, { color: Colors[theme].primary }]}>
              Dar es Salaam, TZ
            </Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: Colors[theme]['surface-container'] }]}>
          <MaterialCommunityIcons name="cart-outline" size={20} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
      </View>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                <MaterialCommunityIcons name="star" size={14} color={Colors[theme]['secondary-container']} />
                <Text style={[styles.heroBadgeText, { color: Colors[theme]['on-surface'] }]}>
                  {restaurant.rating} ({restaurant.ratingCount})
                </Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: restaurant.isOpen ? Colors[theme].primary : Colors[theme].error }]}>
                <Text style={[styles.heroBadgeText, { color: '#ffffff' }]}>
                  {restaurant.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: Colors[theme].surface }]}>
          <Text style={[styles.restaurantName, { color: Colors[theme]['on-surface'] }]}>
            {restaurant.name}
          </Text>
          <Text style={[styles.cuisine, { color: Colors[theme]['on-surface-variant'] }]}>
            {restaurant.cuisine}
          </Text>

          <View style={[styles.metaRow, { borderTopColor: Colors[theme]['surface-variant'] }]}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker" size={18} color={Colors[theme].primary} />
              <Text style={[styles.metaText, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>
                {restaurant.address}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={Colors[theme].primary} />
              <Text style={[styles.metaText, { color: Colors[theme]['on-surface'] }]}>
                {restaurant.openingHours} - {restaurant.closingHours}
              </Text>
            </View>
          </View>

          <View style={[styles.deliveryRow, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
            <View style={styles.deliveryItem}>
              <MaterialCommunityIcons name="clock-fast" size={20} color={Colors[theme].primary} />
              <Text style={[styles.deliveryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Delivery</Text>
              <Text style={[styles.deliveryValue, { color: Colors[theme]['on-surface'] }]}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={[styles.deliveryDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.deliveryItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color={Colors[theme].primary} />
              <Text style={[styles.deliveryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Distance</Text>
              <Text style={[styles.deliveryValue, { color: Colors[theme]['on-surface'] }]}>{restaurant.distance}</Text>
            </View>
            <View style={[styles.deliveryDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.deliveryItem}>
              <MaterialCommunityIcons name="bike" size={20} color={Colors[theme].primary} />
              <Text style={[styles.deliveryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Fee</Text>
              <Text style={[styles.deliveryValue, { color: Colors[theme]['on-surface'] }]}>{formatPrice(restaurant.deliveryFee)}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryBar}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    activeCategory === cat
                      ? Colors[theme].primary
                      : Colors[theme]['surface-container-high'],
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      activeCategory === cat
                        ? Colors[theme]['on-primary']
                        : Colors[theme]['on-surface-variant'],
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: Colors[theme]['on-surface'] }]}>
            {activeCategory === 'All' ? 'Menu' : activeCategory}
          </Text>
          <View style={styles.menuGrid}>
            {filteredItems.length === 0 && (
              <Text style={[styles.emptyMenu, { color: Colors[theme]['on-surface-variant'] }]}>
                No items in this category
              </Text>
            )}
            {filteredItems.map((item) => (
              <View key={item.id} style={[styles.menuCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
                <View style={styles.menuImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.menuImage} />
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: Colors[theme].primary }]}
                    onPress={() => addItem(item)}
                  >
                    <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.menuInfo}>
                  <View style={styles.menuInfoTop}>
                    <Text style={[styles.menuItemName, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.menuItemPrice, { color: Colors[theme].primary }]}>
                      {formatPrice(item.price)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.menuItemDesc, { color: Colors[theme]['on-surface-variant'] }]}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {cartCount > 0 && (
        <View style={[styles.cartBar, { backgroundColor: Colors[theme].surface }]}>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: Colors[theme].primary }]}
            onPress={() => router.push('/your-cart')}
          >
            <View style={styles.checkoutLeft}>
              <View style={[styles.cartBadge, { backgroundColor: Colors[theme]['on-primary'] }]}>
                <Text style={[styles.cartBadgeText, { color: Colors[theme].primary }]}>{cartCount}</Text>
              </View>
              <Text style={styles.checkoutLabel}>View Cart</Text>
            </View>
            <Text style={styles.checkoutTotal}>{formatPrice(cartSubtotal)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  emptyText: { ...Typography['body-md'] },
  goBack: { ...Typography['label-md'], marginTop: Spacing.sm },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'],
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  headerBackBtn: { padding: 4 },
  headerLabel: { ...Typography['label-sm'] },
  headerLocation: { ...Typography.h2 },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: { position: 'relative', height: 260 },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: Spacing['container-padding'],
    right: Spacing['container-padding'],
  },
  heroBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  heroBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  heroBadgeText: { ...Typography['label-sm'], fontWeight: '600' },
  infoCard: {
    marginHorizontal: Spacing['container-padding'],
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  restaurantName: { ...Typography.display, fontSize: 22 },
  cuisine: { ...Typography['body-sm'], marginTop: 4 },
  metaRow: {
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaText: { ...Typography['body-sm'], flex: 1 },
  deliveryRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  deliveryItem: { flex: 1, alignItems: 'center', gap: 2 },
  deliveryLabel: { ...Typography['label-sm'], fontSize: 10 },
  deliveryValue: { ...Typography['label-md'], fontWeight: '600' },
  deliveryDivider: { width: 1, height: 32, alignSelf: 'center' },
  categoryBar: { marginTop: Spacing.md },
  categoryContent: { paddingHorizontal: Spacing['container-padding'], gap: Spacing.sm },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryText: { ...Typography['label-md'] },
  menuSection: { padding: Spacing['container-padding'], paddingBottom: 120 },
  menuSectionTitle: { ...Typography.h2, marginBottom: Spacing.md },
  emptyMenu: { ...Typography['body-md'], textAlign: 'center', paddingVertical: 40 },
  menuGrid: { gap: Spacing.md },
  menuCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuImageContainer: { position: 'relative', height: 192 },
  menuImage: { width: '100%', height: '100%' },
  addBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  menuInfo: { padding: Spacing.md },
  menuInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  menuItemName: { ...Typography.h2, flex: 1 },
  menuItemPrice: { ...Typography.h2 },
  menuItemDesc: { ...Typography['body-sm'] },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing['container-padding'],
    paddingVertical: Spacing.md,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  checkoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cartBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { ...Typography['label-md'], fontWeight: '700' },
  checkoutLabel: { ...Typography['label-md'], color: '#ffffff' },
  checkoutTotal: { ...Typography.h2, color: '#ffffff' },
});
