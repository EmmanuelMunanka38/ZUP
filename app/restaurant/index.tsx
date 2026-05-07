import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/format';
import { useRestaurantStore } from '@/store/restaurantStore';
import { mockDashboardStats } from '@/services/mock-data';

const { width } = Dimensions.get('window');

export default function RestaurantDashboardScreen() {
  const theme = 'light';
  const stats = mockDashboardStats;
  useRestaurantStore();

  const [orders] = useState([
    { id: '#PK-9281', items: '2x Swahili Pilau Mixed, 1x Fresh Juice', customer: 'David M.', amount: 28500, time: '04:32', urgent: true },
    { id: '#PK-9285', items: '1x Grilled Tilapia (Large), 2x Ugali Extra', customer: 'Sarah J.', amount: 45000, time: '08:15', urgent: false },
  ]);

  useEffect(() => {
    // Data is loaded on mount from mockDashboardStats
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.restaurantInfo}>
          <Image source={{ uri: Images.restaurantDashboard.logo }} style={styles.restaurantLogo} />
          <View>
            <Text style={[styles.restaurantName, { color: Colors[theme].primary }]}>Mama Africa Cuisine</Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={Colors[theme]['on-surface-variant']} />
              <Text style={[styles.restaurantLocation, { color: Colors[theme]['on-surface-variant'] }]}>Dar es Salaam, Masaki</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusToggle, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: Colors[theme]['outline-variant'] }]}>
            <View style={[styles.statusActive, { backgroundColor: Colors[theme].primary }]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusActiveText}>Active</Text>
            </View>
            <Text style={[styles.statusInactive, { color: Colors[theme]['on-surface-variant'] }]}>Busy</Text>
          </View>
          <TouchableOpacity style={[styles.cartBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
            <MaterialCommunityIcons name="cart-outline" size={20} color={Colors[theme].primary} />
            <View style={[styles.cartBadge, { backgroundColor: Colors[theme].error }]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={styles.statTop}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                <MaterialCommunityIcons name="receipt" size={18} color={Colors[theme].primary} />
              </View>
              <Text style={[styles.statGrowth, { color: Colors[theme].primary }]}>+{stats.orderGrowth}%</Text>
            </View>
            <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Today&apos;s Orders</Text>
            <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{stats.todayOrders}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={styles.statTop}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(253,192,3,0.15)' }]}>
                <MaterialCommunityIcons name="credit-card" size={18} color={Colors[theme].secondary} />
              </View>
              <Text style={[styles.statGrowth, { color: Colors[theme].secondary }]}>+{stats.revenueGrowth}%</Text>
            </View>
            <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Daily Revenue</Text>
            <Text style={[styles.statValueBig, { color: Colors[theme]['on-surface'] }]}>{formatPrice(stats.dailyRevenue)}</Text>
          </View>

          <View style={[styles.riderCard, { backgroundColor: Colors[theme].primary }]}>
            <View style={styles.riderContent}>
              <Text style={[styles.riderLabel, { color: 'rgba(255,255,255,0.8)' }]}>Rider Status</Text>
              <Text style={[styles.riderCount, { color: '#ffffff' }]}>{stats.activeRiders} Riders Active</Text>
              <View style={styles.riderAvatars}>
                {Images.restaurantDashboard.riders.slice(0, 3).map((rider, i) => (
                  <View key={i} style={[styles.riderMini, { borderColor: Colors[theme].primary }]}>
                    <Image source={{ uri: rider }} style={styles.riderMiniImage} />
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.riderBgIcon}>
              <MaterialCommunityIcons name="bike" size={120} color="#ffffff" />
            </View>
          </View>
        </View>

        <View style={styles.ordersHeader}>
          <Text style={[styles.ordersTitle, { color: Colors[theme]['on-surface'] }]}>New Orders</Text>
          <View style={styles.ordersFilterRow}>
            <MaterialCommunityIcons name="history" size={18} color={Colors[theme].primary} />
            <Text style={[styles.ordersFilter, { color: Colors[theme].primary }]}>Past 30 mins</Text>
          </View>
        </View>

        {orders.map((order) => (
          <View key={order.id} style={[styles.orderCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={styles.orderMeta}>
              <View style={[styles.timerBadge, { backgroundColor: order.urgent ? Colors[theme]['error-container'] : 'rgba(253,192,3,0.15)' }]}>
                <MaterialCommunityIcons name="timer-outline" size={14} color={order.urgent ? Colors[theme]['on-error-container'] : Colors[theme]['on-secondary-container']} />
                <Text style={[styles.timerText, { color: order.urgent ? Colors[theme]['on-error-container'] : Colors[theme]['on-secondary-container'] }]}>
                  {' '}{order.time}
                </Text>
              </View>
              <Text style={[styles.orderId, { color: Colors[theme]['on-surface-variant'] }]}>{order.id}</Text>
            </View>
            <Text style={[styles.orderItems, { color: Colors[theme]['on-surface'] }]}>{order.items}</Text>
            <View style={styles.orderInfo}>
              <View style={styles.orderCustomer}>
                <MaterialCommunityIcons name="account" size={18} color={Colors[theme]['on-surface-variant']} />
                <Text style={[styles.customerName, { color: Colors[theme]['on-surface-variant'] }]}>{order.customer}</Text>
              </View>
              <View style={styles.orderAmountRow}>
                <MaterialCommunityIcons name="credit-card" size={18} color={Colors[theme]['on-surface-variant']} />
                <Text style={[styles.orderAmount, { color: Colors[theme]['on-surface'] }]}>{formatPrice(order.amount)}</Text>
              </View>
            </View>
            <View style={styles.orderActions}>
              <TouchableOpacity style={[styles.viewDetailsBtn, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: 'rgba(15,169,88,0.2)' }]}>
                <Text style={[styles.viewDetailsText, { color: Colors[theme].primary }]}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: Colors[theme].primary }]}>
                <Text style={styles.acceptBtnText}>Accept Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={[styles.trendingTitle, { color: Colors[theme]['on-surface'] }]}>Trending Items</Text>
        <View style={styles.trendingGrid}>
          {[
            { name: 'Swahili Pilau', sold: 12 },
            { name: 'Grilled Tilapia', sold: 8 },
            { name: 'Beef Mishkaki', sold: 15 },
            { name: 'Fresh Passion Juice', sold: 22 },
          ].map((item, i) => (
            <View key={i} style={[styles.trendingCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              <View style={[styles.trendingImage, { backgroundColor: Colors[theme]['surface-container'] }]}>
                <Image source={{ uri: Images.restaurantDashboard.trending[i] }} style={styles.trendingItemImage} />
              </View>
              <View style={styles.trendingInfo}>
                <Text style={[styles.trendingName, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.trendingSold, { color: Colors[theme].primary }]}>{item.sold} sold today</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: Colors[theme].surface }]}>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color={Colors[theme].primary} />
          <Text style={[styles.navLabel, { color: Colors[theme].primary }]}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="magnify" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Search</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="receipt" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Orders</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="account" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Profile</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.fab, { backgroundColor: Colors[theme].primary }]}>
        <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 56, paddingBottom: Spacing.md, borderBottomWidth: 1,
  },
  restaurantInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  restaurantLogo: { width: 40, height: 40, borderRadius: BorderRadius.md },
  restaurantName: { ...Typography.h2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  restaurantLocation: { ...Typography['label-sm'] },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statusToggle: {
    flexDirection: 'row', borderRadius: BorderRadius.full, padding: 2, alignItems: 'center',
    borderWidth: 1,
  },
  statusActive: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffffff' },
  statusActiveText: { ...Typography['label-sm'], color: '#ffffff', fontWeight: '700' },
  statusInactive: { ...Typography['label-md'], paddingHorizontal: Spacing.md, paddingVertical: 6 },
  cartBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 160 },
  statsGrid: { gap: Spacing.md, marginBottom: Spacing.lg },
  statCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadows.sm,
    borderWidth: 1, borderColor: Colors.light['surface-variant'],
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  statIconWrap: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  statGrowth: { ...Typography['label-sm'], fontWeight: '700' },
  statLabel: { ...Typography['label-sm'] },
  statValue: { ...Typography.h1, marginTop: 4 },
  statValueBig: { ...Typography.h1, marginTop: 4 },
  riderCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.lg, overflow: 'hidden', position: 'relative',
  },
  riderContent: { position: 'relative', zIndex: 1 },
  riderLabel: { ...Typography['label-sm'] },
  riderCount: { ...Typography.h1, marginTop: 4 },
  riderAvatars: { flexDirection: 'row', marginTop: Spacing.md, gap: -8 },
  riderBgIcon: { position: 'absolute', right: -16, bottom: -16, opacity: 0.1 },
  riderMini: {
    width: 32, height: 32, borderRadius: BorderRadius.full, borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  riderMiniImage: { width: 28, height: 28, borderRadius: 14 },
  ordersHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md,
  },
  ordersTitle: { ...Typography.h1 },
  ordersFilterRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ordersFilter: { ...Typography['label-md'] },
  orderCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm,
    borderWidth: 1, borderColor: Colors.light['surface-variant'],
  },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  timerBadge: { paddingHorizontal: Spacing.md, paddingVertical: 2, borderRadius: BorderRadius.full, flexDirection: 'row', alignItems: 'center' },
  timerText: { ...Typography['label-sm'], fontWeight: '700' },
  orderId: { ...Typography['label-md'] },
  orderItems: { ...Typography.h2, marginBottom: Spacing.md },
  orderInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  orderCustomer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  customerName: { ...Typography['body-sm'] },
  orderAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderAmount: { ...Typography['label-md'] },
  orderActions: { flexDirection: 'row', gap: Spacing.md },
  viewDetailsBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, alignItems: 'center',
  },
  viewDetailsText: { ...Typography['label-md'] },
  acceptBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, alignItems: 'center',
  },
  acceptBtnText: { ...Typography['label-md'], color: '#ffffff' },
  trendingTitle: { ...Typography.h1, marginBottom: Spacing.md, marginTop: Spacing.md },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  trendingCard: {
    width: (width - Spacing['container-padding'] * 2 - Spacing.md) / 2,
    borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.sm,
    borderWidth: 1, borderColor: Colors.light['surface-variant'],
  },
  trendingImage: { height: 128 },
  trendingItemImage: { width: '100%', height: '100%' },
  trendingInfo: { padding: Spacing.md },
  trendingName: { ...Typography['label-md'] },
  trendingSold: { ...Typography['body-sm'], fontWeight: '700' },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 32,
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#0fa958', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 8,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { ...Typography['label-sm'] },
  fab: {
    position: 'absolute', bottom: 88, right: Spacing['container-padding'],
    width: 56, height: 56, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0fa958', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
});
