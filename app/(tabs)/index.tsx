import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/format';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useCartStore } from '@/store/cartStore';
import { mockDrinks } from '@/services/mock-data';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const DRINK_WIDTH = 144;

export default function HomeScreen() {
  const theme = 'light';
  const { categories, featured, loadCategories, loadFeatured } = useRestaurantStore();
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    loadCategories();
    loadFeatured();
  }, [loadCategories, loadFeatured]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={24} color={Colors[theme].primary} />
          <View>
            <Text style={[styles.locationLabel, { color: Colors[theme]['on-surface-variant'] }]}>
              Deliver to
            </Text>
            <Text style={[styles.locationText, { color: Colors[theme].primary }]}>
              Current Location
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.cartButton, { backgroundColor: Colors[theme]['surface-container-low'] }]}
          onPress={() => router.push('/your-cart')}
        >
          <MaterialCommunityIcons name="cart-outline" size={22} color={Colors[theme]['on-surface']} />
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity style={[styles.searchBar, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-container'] }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.searchPlaceholder, { color: Colors[theme]['on-surface-variant'] }]}>
            Search for food, restaurants...
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
            Categories
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: Colors[theme].primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: cat.id === '1' ? Colors[theme]['secondary-container'] : Colors[theme]['surface-container-high'] },
                ]}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={32}
                  color={cat.id === '1' ? Colors[theme]['on-secondary-container'] : Colors[theme]['on-surface']}
                />
              </View>
              <Text style={[styles.categoryName, { color: Colors[theme]['on-surface'] }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
            Popular Restaurants
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.restaurantsRow}
        >
          {featured.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              activeOpacity={0.9}
              onPress={() => router.push('/restaurant-details')}
              style={[styles.restaurantCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
            >
              <View style={styles.restaurantImageContainer}>
                <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
                <View style={[styles.ratingBadge, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                  <MaterialCommunityIcons name="star" size={16} color={Colors[theme]['secondary-container']} />
                  <Text style={[styles.ratingText, { color: Colors[theme]['on-surface'] }]}>{restaurant.rating}</Text>
                </View>
              </View>
              <View style={styles.restaurantInfo}>
                <Text
                  style={[styles.restaurantName, { color: Colors[theme]['on-surface'] }]}
                  numberOfLines={1}
                >
                  {restaurant.name}
                </Text>
                <Text style={[styles.restaurantMeta, { color: Colors[theme]['on-surface-variant'] }]}>
                  Swahili · BBQ · {restaurant.deliveryTime}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.dealSection}>
          <View style={[styles.dealBanner, { backgroundColor: Colors[theme].primary }]}>
            <View style={styles.dealContent}>
              <View style={[styles.dealTagWrapper, { backgroundColor: Colors[theme]['secondary-container'] }]}>
                <Text style={[styles.dealTagText, { color: Colors[theme]['on-secondary-container'] }]}>
                  Flash Deal
                </Text>
              </View>
              <Text style={styles.dealTitle}>50% OFF on{'\n'}Your First Order</Text>
              <Text style={styles.dealSubtitle}>Valid for the next 2 hours!</Text>
              <TouchableOpacity style={[styles.dealButton, { backgroundColor: Colors[theme].surface }]}>
                <Text style={[styles.dealButtonText, { color: Colors[theme].primary }]}>Claim Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
            Top Drinks
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: Colors[theme].primary }]}>Explore</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.drinksRow}
        >
          {mockDrinks.map((drink, i) => (
            <TouchableOpacity key={i} style={styles.drinkItem}>
              <View style={[styles.drinkImageBg, { backgroundColor: Colors[theme]['surface-container'] }]}>
                {Images.home.drinks[i] && (
                  <Image source={{ uri: Images.home.drinks[i] }} style={styles.drinkImageStyle} />
                )}
              </View>
              <Text style={[styles.drinkName, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>
                {drink.name}
              </Text>
              <Text style={[styles.drinkPrice, { color: Colors[theme].primary }]}>
                {formatPrice(drink.price)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
            Recommended for You
          </Text>
        </View>

        <View style={styles.recommendedGrid}>
          <TouchableOpacity
            style={[styles.recommendedLarge, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
            activeOpacity={0.8}
          >
            <View style={styles.recommendedLargeContent}>
              <View style={styles.recommendedTextCol}>
                <View style={[styles.bestSellerBadge, { backgroundColor: 'rgba(15, 169, 88, 0.1)' }]}>
                  <Text style={[styles.bestSellerText, { color: Colors[theme]['primary-container'] }]}>Best Seller</Text>
                </View>
                <Text style={[styles.recommendedName, { color: Colors[theme]['on-surface'] }]}>Pilau Special</Text>
                <Text style={[styles.recommendedDesc, { color: Colors[theme]['on-surface-variant'] }]}>Aromatic rice with spiced beef and kachumbari.</Text>
                <Text style={[styles.recommendedPrice, { color: Colors[theme].primary }]}>Tsh 12,000</Text>
              </View>
              <View style={[styles.recommendedImageCol, { backgroundColor: Colors[theme]['surface-container'] }]} />
            </View>
          </TouchableOpacity>

          <View style={styles.recommendedSmallRow}>
            {['Classic Burger', 'Pasta Arabiata'].map((name, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.recommendedSmall, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
                activeOpacity={0.8}
              >
                <View style={[styles.recommendedSmallImage, { backgroundColor: Colors[theme]['surface-container'] }]} />
                <View style={styles.recommendedSmallInfo}>
                  <Text style={[styles.recommendedSmallName, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={[styles.recommendedSmallPrice, { color: Colors[theme].primary }]}>
                    {i === 0 ? 'Tsh 15,000' : 'Tsh 18,500'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'],
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  locationLabel: { ...Typography['label-sm'] },
  locationText: { ...Typography.h2 },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.light.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: { paddingBottom: 100 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing['container-padding'],
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    borderWidth: 1,
    ...Shadows.sm,
  },
  searchPlaceholder: { ...Typography['body-md'] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['container-padding'],
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h2 },
  seeAll: { ...Typography['label-md'] },
  categoriesRow: {
    paddingHorizontal: Spacing['container-padding'],
    gap: Spacing.md,
  },
  categoryItem: { alignItems: 'center', gap: Spacing.sm, width: 72 },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { ...Typography['label-md'], textAlign: 'center' },
  restaurantsRow: {
    paddingHorizontal: Spacing['container-padding'],
    gap: Spacing.md,
  },
  restaurantCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  restaurantImageContainer: { position: 'relative' },
  restaurantImage: { width: CARD_WIDTH, height: 160 },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  ratingText: { ...Typography['label-sm'], fontWeight: '700' },
  restaurantInfo: { padding: Spacing.md },
  restaurantName: { ...Typography['label-md'] },
  restaurantMeta: { ...Typography['body-sm'], marginTop: 4 },
  dealSection: {
    paddingHorizontal: Spacing['container-padding'],
    marginTop: Spacing.lg,
  },
  dealBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  dealContent: { gap: Spacing.sm },
  dealTagWrapper: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  dealTagText: { ...Typography['label-sm'] },
  dealTitle: {
    ...Typography.display,
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 34,
  },
  dealSubtitle: {
    ...Typography['body-sm'],
    color: 'rgba(255,255,255,0.8)',
  },
  dealButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  dealButtonText: {
    ...Typography['label-md'],
  },
  drinksRow: {
    paddingHorizontal: Spacing['container-padding'],
    gap: Spacing.md,
  },
  drinkItem: { width: DRINK_WIDTH },
  drinkImageBg: {
    height: DRINK_WIDTH,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  drinkImageStyle: { width: '100%', height: '100%' },
  drinkName: { ...Typography['label-md'] },
  drinkPrice: { ...Typography['label-sm'], marginTop: 2 },
  recommendedGrid: {
    paddingHorizontal: Spacing['container-padding'],
    gap: Spacing.md,
  },
  recommendedLarge: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  recommendedLargeContent: {
    flexDirection: 'row',
    height: 160,
  },
  recommendedTextCol: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  bestSellerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestSellerText: { ...Typography['label-sm'], fontSize: 10, textTransform: 'uppercase' },
  recommendedName: { ...Typography.h2, marginTop: Spacing.sm },
  recommendedDesc: { ...Typography['body-sm'] },
  recommendedPrice: { ...Typography['label-md'] },
  recommendedImageCol: {
    width: '50%',
  },
  recommendedSmallRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  recommendedSmall: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  recommendedSmallImage: {
    height: 128,
  },
  recommendedSmallInfo: {
    padding: Spacing.sm,
  },
  recommendedSmallName: { ...Typography['label-md'] },
  recommendedSmallPrice: { ...Typography['label-sm'] },
});
