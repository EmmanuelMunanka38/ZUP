import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice, formatTime } from '@/utils/format';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { useRestaurantStore } from '@/store/restaurantStore';

const { width } = Dimensions.get('window');

export default function RestaurantDashboardScreen() {
  const theme = 'light';
  const user = useAuthStore((s) => s.user);
  const { orders, isLoading: ordersLoading, loadOrders } = useOrderStore();
  const { restaurants, loadRestaurants } = useRestaurantStore();
  const [status, setStatus] = useState<'active' | 'busy'>('active');
  const [activeTab, setActiveTab] = useState<'new' | 'active' | 'history'>('new');

  useEffect(() => {
    loadOrders();
    loadRestaurants();
  }, []);

  const myRestaurant = restaurants[0];

  const todayOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter((o) => new Date(o.createdAt) >= today);
  }, [orders]);

  const dailyRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

  const prevMonthOrders = useMemo(() => {
    const thirty = new Date();
    thirty.setDate(thirty.getDate() - 30);
    const start = new Date();
    start.setDate(start.getDate() - 60);
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= start && d < thirty;
    });
  }, [orders]);

  const orderGrowth = todayOrders.length > 0 && prevMonthOrders.length > 0
    ? Math.round(((todayOrders.length - prevMonthOrders.length) / prevMonthOrders.length) * 100)
    : 12;

  const revenueGrowth = dailyRevenue > 0
    ? Math.round(((dailyRevenue - (prevMonthOrders.reduce((s, o) => s + o.total, 0) / 2)) / (prevMonthOrders.reduce((s, o) => s + o.total, 0) / 2)) * 100)
    : 8;

  const newOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
  const activeOrders = orders.filter((o) => ['preparing', 'on_the_way'].includes(o.status));
  const historyOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  const displayOrders = activeTab === 'new' ? newOrders : activeTab === 'active' ? activeOrders : historyOrders;

  const trendingItems = useMemo(() => {
    const count: Record<string, { name: string; count: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!count[item.name]) count[item.name] = { name: item.name, count: 0 };
        count[item.name].count += item.quantity;
      });
    });
    return Object.values(count).sort((a, b) => b.count - a.count).slice(0, 4);
  }, [orders]);

  const totalEarnings = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalEarnings / orders.length) : 0;

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: Colors[theme]['surface-container'] }]}>
            <MaterialCommunityIcons name="store-outline" size={22} color={Colors[theme].primary} />
          </View>
          <View>
            <Text style={[styles.greeting, { color: Colors[theme]['on-surface-variant'] }]}>Welcome back</Text>
            <Text style={[styles.restaurantName, { color: Colors[theme]['on-surface'] }]}>
              {myRestaurant?.name || user?.name || 'My Restaurant'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={Colors[theme]['on-surface']} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Toggle */}
        <View style={styles.statusRow}>
          <TouchableOpacity
            onPress={() => setStatus('active')}
            style={[styles.statusBtn, status === 'active' && { backgroundColor: Colors[theme].primary }]}
          >
            <View style={[styles.statusDot, { backgroundColor: status === 'active' ? '#ffffff' : Colors[theme].primary }]} />
            <Text style={[styles.statusText, { color: status === 'active' ? '#ffffff' : Colors[theme].primary }]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStatus('busy')}
            style={[styles.statusBtn, status === 'busy' && { backgroundColor: Colors[theme]['on-surface'] }]}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={status === 'busy' ? '#ffffff' : Colors[theme]['on-surface-variant']}
            />
            <Text style={[styles.statusText, { color: status === 'busy' ? '#ffffff' : Colors[theme]['on-surface-variant'] }]}>Busy</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(15, 169, 88, 0.1)' }]}>
              <MaterialCommunityIcons name="receipt" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Today</Text>
            <Text style={[styles.statValue, { color: Colors[theme]['on-surface'] }]}>{todayOrders.length}</Text>
            <View style={styles.statGrowth}>
              <MaterialCommunityIcons name="trending-up" size={14} color={Colors[theme].primary} />
              <Text style={[styles.statGrowthText, { color: Colors[theme].primary }]}>+{orderGrowth}%</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(253, 192, 3, 0.15)' }]}>
              <MaterialCommunityIcons name="cash" size={20} color={Colors[theme].secondary} />
            </View>
            <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Revenue</Text>
            <Text style={[styles.statValue, { color: Colors[theme]['on-surface'] }]}>{formatPrice(dailyRevenue)}</Text>
            <View style={styles.statGrowth}>
              <MaterialCommunityIcons name="trending-up" size={14} color={Colors[theme].secondary} />
              <Text style={[styles.statGrowthText, { color: Colors[theme].secondary }]}>+{revenueGrowth}%</Text>
            </View>
          </View>
          <View style={[styles.statCardWide, { backgroundColor: Colors[theme].primary }]}>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Avg Order</Text>
            <Text style={[styles.statValue, { color: '#ffffff' }]}>{formatPrice(avgOrderValue)}</Text>
            <View style={styles.statMeta}>
              <MaterialCommunityIcons name="bike" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={{ color: 'rgba(255,255,255,0.7)', ...Typography['label-sm'] }}> 12 active</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={[styles.qaIcon, { backgroundColor: 'rgba(15, 169, 88, 0.1)' }]}>
              <MaterialCommunityIcons name="food" size={22} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.qaText, { color: Colors[theme]['on-surface'] }]}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={[styles.qaIcon, { backgroundColor: 'rgba(253, 192, 3, 0.15)' }]}>
              <MaterialCommunityIcons name="chart-box-outline" size={22} color={Colors[theme].secondary} />
            </View>
            <Text style={[styles.qaText, { color: Colors[theme]['on-surface'] }]}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={[styles.qaIcon, { backgroundColor: 'rgba(15, 169, 88, 0.1)' }]}>
              <MaterialCommunityIcons name="truck-outline" size={22} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.qaText, { color: Colors[theme]['on-surface'] }]}>Riders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={[styles.qaIcon, { backgroundColor: 'rgba(253, 192, 3, 0.15)' }]}>
              <MaterialCommunityIcons name="cog-outline" size={22} color={Colors[theme].secondary} />
            </View>
            <Text style={[styles.qaText, { color: Colors[theme]['on-surface'] }]}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Orders Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>Orders</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: Colors[theme].primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Order Tabs */}
        <View style={[styles.orderTabs, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
          {(['new', 'active', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.orderTab,
                activeTab === tab && { backgroundColor: Colors[theme].surface, ...Shadows.sm },
              ]}
            >
              <Text style={[styles.orderTabText, { color: activeTab === tab ? Colors[theme].primary : Colors[theme]['on-surface-variant'] }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {tab === 'new' && newOrders.length > 0 && (
                <View style={[styles.orderTabBadge, { backgroundColor: Colors[theme].error }]}>
                  <Text style={styles.orderTabBadgeText}>{newOrders.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders List */}
        {ordersLoading ? (
          <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginTop: 40 }} />
        ) : displayOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt" size={56} color={Colors[theme]['surface-variant']} />
            <Text style={[styles.emptyText, { color: Colors[theme]['on-surface-variant'] }]}>No {activeTab} orders</Text>
            <Text style={[styles.emptySubtext, { color: Colors[theme]['surface-variant'] }]}>
              {activeTab === 'new' ? 'New orders will appear here' : activeTab === 'active' ? 'Active deliveries show here' : 'Completed orders appear here'}
            </Text>
          </View>
        ) : (
          displayOrders.slice(0, 5).map((order) => {
            const timeAgo = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            return (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/checkout/track-order?id=${order.id}`)}
              >
                <View style={[styles.orderCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                      <View style={[styles.orderNumberBadge, { backgroundColor: Colors[theme]['primary-container'] }]}>
                        <Text style={[styles.orderNumberText, { color: Colors[theme].primary }]}>#{order.orderNumber}</Text>
                      </View>
                      <View style={[styles.timeBadge, { backgroundColor: timeAgo < 10 ? 'rgba(229, 56, 59, 0.1)' : 'rgba(253, 192, 3, 0.15)' }]}>
                        <MaterialCommunityIcons
                          name="timer-outline"
                          size={14}
                          color={timeAgo < 10 ? Colors[theme].error : Colors[theme].secondary}
                        />
                        <Text style={[styles.timeText, { color: timeAgo < 10 ? Colors[theme].error : Colors[theme].secondary }]}>
                          {timeAgo}m
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.amountBadge, { backgroundColor: Colors[theme]['surface-container-high'] }]}>
                      <Text style={[styles.amountText, { color: Colors[theme]['on-surface'] }]}>{formatPrice(order.total)}</Text>
                    </View>
                  </View>

                  <Text style={[styles.orderItems, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={1}>
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </Text>

                  <View style={styles.orderFooter}>
                    <View style={styles.orderFooterLeft}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={Colors[theme]['on-surface-variant']} />
                      <Text style={[styles.orderAddress, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={1}>
                        {typeof order.deliveryAddress === 'object' && 'street' in order.deliveryAddress
                          ? order.deliveryAddress.street
                          : 'Dar es Salaam'}
                      </Text>
                    </View>
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: Colors[theme].primary }]}>
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'preparing' && (
                      <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: Colors[theme].secondary }]}>
                        <Text style={styles.acceptBtnText}>Ready</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Trending Items */}
        {trendingItems.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
              <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>Trending Items</Text>
              <TouchableOpacity onPress={() => router.push('/restaurant/menu-management')}>
                <Text style={[styles.seeAll, { color: Colors[theme].primary }]}>Manage Menu</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.trendingGrid}>
              {trendingItems.map((item, i) => (
                <View key={i} style={[styles.trendingCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
                  <View style={[styles.trendingRank, { backgroundColor: Colors[theme].primary }]}>
                    <Text style={styles.trendingRankText}>{i + 1}</Text>
                  </View>
                  <View style={[styles.trendingIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
                    <MaterialCommunityIcons name="food" size={24} color={Colors[theme]['on-surface-variant']} />
                  </View>
                  <Text style={[styles.trendingName, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.trendingSold, { color: Colors[theme].primary }]}>{item.count} sold</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: Colors[theme].surface }]}>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color={Colors[theme].primary} />
          <Text style={[styles.navLabel, { color: Colors[theme].primary }]}>Home</Text>
        </View>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/restaurant/menu-management')}>
          <MaterialCommunityIcons name="food" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="receipt" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* FAB */}
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  greeting: { ...Typography['label-sm'] },
  restaurantName: { ...Typography.h2 },
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 160 },
  statusRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statusBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.light['surface-variant'],
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...Typography['label-md'], fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1, borderRadius: BorderRadius.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.light['surface-variant'],
    ...Shadows.sm,
  },
  statCardWide: {
    flex: 1.3, borderRadius: BorderRadius.xl, padding: Spacing.md,
    justifyContent: 'center', ...Shadows.md,
  },
  statIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statLabel: { ...Typography['label-sm'] },
  statValue: { ...Typography.h2, marginTop: 2 },
  statGrowth: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: Spacing.sm },
  statGrowthText: { ...Typography['label-sm'], fontWeight: '700' },
  statMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  quickActions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  quickAction: {
    flex: 1, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.light['surface-variant'], ...Shadows.sm,
  },
  qaIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  qaText: { ...Typography['label-sm'], fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h1 },
  seeAll: { ...Typography['label-md'], fontWeight: '600' },
  orderTabs: {
    flexDirection: 'row', borderRadius: BorderRadius.xl, padding: 4, marginBottom: Spacing.md,
  },
  orderTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg,
  },
  orderTabText: { ...Typography['label-md'], fontWeight: '600' },
  orderTabBadge: {
    minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  orderTabBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', gap: Spacing.sm, marginTop: 40 },
  emptyText: { ...Typography['body-md'] },
  emptySubtext: { ...Typography['label-sm'] },
  orderCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.light['surface-variant'], ...Shadows.sm,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  orderNumberBadge: { paddingHorizontal: Spacing.md, paddingVertical: 2, borderRadius: BorderRadius.full },
  orderNumberText: { ...Typography['label-sm'], fontWeight: '700' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  timeText: { ...Typography['label-sm'], fontWeight: '700' },
  amountBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full },
  amountText: { ...Typography['label-sm'], fontWeight: '700' },
  orderItems: { ...Typography['body-sm'], marginBottom: Spacing.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  orderAddress: { ...Typography['label-sm'], flex: 1 },
  acceptBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  acceptBtnText: { ...Typography['label-md'], color: '#ffffff', fontWeight: '700' },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  trendingCard: {
    width: (width - Spacing['container-padding'] * 2 - Spacing.md) / 2,
    borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.light['surface-variant'], ...Shadows.sm, overflow: 'visible',
  },
  trendingRank: {
    position: 'absolute', top: -8, left: -8, width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  trendingRankText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  trendingIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  trendingName: { ...Typography['label-sm'], textAlign: 'center' },
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