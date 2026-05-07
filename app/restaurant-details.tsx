import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';
import { mockMenuItems } from '@/services/mock-data';

const categories = ['Popular', 'Appetizers', 'Mains', 'Sides', 'Drinks'];

export default function RestaurantDetailsScreen() {
  const theme = 'light';
  const [activeCategory, setActiveCategory] = useState('Popular');
  const { addItem, itemCount, subtotal } = useCartStore();

  const filteredItems = mockMenuItems.filter(
    (item) => item.category === activeCategory || activeCategory === 'All'
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.headerBar, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme].primary} />
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
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: Colors[theme]['surface-container'] }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors[theme]['on-surface']} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: Colors[theme]['surface-container'] }]}>
            <MaterialCommunityIcons name="heart-outline" size={20} color={Colors[theme]['on-surface']} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView bounces={false}>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: Images.restaurantDetails.hero }}
            style={styles.heroImage}
          />
          <View style={styles.heroGradient} />
          <View style={styles.heroBadges}>
            <View style={[styles.heroBadge, { backgroundColor: Colors[theme].primary }]}>
              <MaterialCommunityIcons name="star" size={14} color="#ffffff" />
              <Text style={styles.heroBadgeText}> 4.8 (500+)</Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: Colors[theme]['secondary-container'] }]}>
              <Text style={[styles.heroBadgeText, { color: Colors[theme]['on-secondary-container'] }]}>Free Delivery</Text>
            </View>
          </View>
        </View>

        <View style={[styles.restaurantInfo, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <Text style={[styles.restaurantName, { color: Colors[theme]['on-surface'] }]}>
            The Terrace Swahili Bistro
          </Text>
          <Text style={[styles.cuisine, { color: Colors[theme]['on-surface-variant'] }]}>
            Modern Swahili Fusion · Seafood · Grill
          </Text>
          <View style={[styles.metaRow, { borderTopColor: Colors[theme]['surface-variant'] }]}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={Colors[theme].primary} />
              <Text style={[styles.metaText, { color: Colors[theme]['on-surface'] }]}>25-35 min</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color={Colors[theme].primary} />
              <Text style={[styles.metaText, { color: Colors[theme]['on-surface'] }]}>2.4 km</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="credit-card" size={20} color={Colors[theme].primary} />
              <Text style={[styles.metaText, { color: Colors[theme]['on-surface'] }]}>TSh 2,500</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryBar}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((cat) => (
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
            {activeCategory}
          </Text>
          <View style={styles.menuGrid}>
            {(activeCategory === 'Popular' ? mockMenuItems : filteredItems).map((item) => (
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

      {itemCount() > 0 && (
        <View style={[styles.cartBar, { backgroundColor: Colors[theme].surface }]}>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: Colors[theme].primary }]}
            onPress={() => router.push('/your-cart')}
          >
            <View style={styles.checkoutLeft}>
              <View style={[styles.cartBadge, { backgroundColor: Colors[theme]['on-primary'] }]}>
                <Text style={[styles.cartBadgeText, { color: Colors[theme].primary }]}>{itemCount()}</Text>
              </View>
              <Text style={styles.checkoutLabel}>View Cart</Text>
            </View>
            <Text style={styles.checkoutTotal}>{formatPrice(subtotal())}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
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
  heroBadges: {
    position: 'absolute',
    bottom: 16,
    left: Spacing['container-padding'],
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
  heroBadgeText: { ...Typography['label-sm'], color: '#ffffff' },
  restaurantInfo: {
    marginHorizontal: Spacing['container-padding'],
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  restaurantName: { ...Typography.display, fontSize: 22 },
  cuisine: { ...Typography['body-sm'], marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  metaItem: { alignItems: 'center', gap: 4 },
  metaText: { ...Typography['label-sm'] },
  metaDivider: { width: 1, height: 32 },
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
  menuItemName: { ...Typography.h2 },
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
