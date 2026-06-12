import { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useOrderStore } from '@/store/orderStore';
import { ordersService } from '@/services/orders.service';
import { restaurantSocketService } from '@/services/restaurant-socket.service';

export default function RestaurantOrdersScreen() {
  const theme = 'light';
  const { orders, isLoading, loadOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState<'new' | 'active' | 'history'>('new');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();

    const unsub = restaurantSocketService.onOrderNotification((data) => {
      loadOrders();
    });

    restaurantSocketService.connect();

    return () => {
      unsub();
    };
  }, []);

  const newOrders = orders.filter((o) => o.status === 'pending' || o.status === 'restaurant_accepted');
  const activeOrders = orders.filter((o) => ['preparing', 'ready_for_pickup', 'driver_assigned', 'picked_up', 'on_the_way', 'arrived'].includes(o.status));
  const historyOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  const displayOrders = activeTab === 'new' ? newOrders : activeTab === 'active' ? activeOrders : historyOrders;

  const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders
      .filter((o) => o.status === 'delivered' && new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const handleAccept = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await ordersService.updateOrderStatus(orderId, 'restaurant_accepted');
      await loadOrders();
    } catch {} finally {
      setUpdatingId(null);
    }
  };

  const handlePrepare = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await ordersService.updateOrderStatus(orderId, 'preparing');
      await loadOrders();
    } catch {} finally {
      setUpdatingId(null);
    }
  };

  const handleReady = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await ordersService.updateOrderStatus(orderId, 'ready_for_pickup');
      await loadOrders();
    } catch {} finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setUpdatingId(orderId);
          try {
            await ordersService.updateOrderStatus(orderId, 'cancelled');
            await loadOrders();
          } catch {} finally {
            setUpdatingId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Orders</Text>
        <View style={[styles.revenueBadge, { backgroundColor: Colors[theme]['primary-container'] }]}>
          <Text style={[styles.revenueText, { color: Colors[theme]['on-primary-container'] }]}>
            {formatPrice(todayRevenue)} today
          </Text>
        </View>
      </View>

      <View style={[styles.orderTabs, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
        {(['new', 'active', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.orderTab, activeTab === tab && { backgroundColor: Colors[theme].surface, ...Shadows.sm }]}
          >
            <Text style={[styles.orderTabText, { color: activeTab === tab ? Colors[theme].primary : Colors[theme]['on-surface-variant'] }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {tab === 'new' && newOrders.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: Colors[theme].error }]}>
                <Text style={styles.tabBadgeText}>{newOrders.length}</Text>
              </View>
            )}
            {tab === 'active' && activeOrders.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: Colors[theme].secondary }]}>
                <Text style={styles.tabBadgeText}>{activeOrders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginTop: 40 }} />
        ) : displayOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt" size={56} color={Colors[theme]['surface-variant']} />
            <Text style={[styles.emptyTitle, { color: Colors[theme]['on-surface-variant'] }]}>
              No {activeTab} orders
            </Text>
            <Text style={[styles.emptySubtitle, { color: Colors[theme]['surface-variant'] }]}>
              {activeTab === 'new' ? 'New orders will appear here' : activeTab === 'active' ? 'Active orders show here' : 'Completed orders appear here'}
            </Text>
          </View>
        ) : (
          displayOrders.map((order) => {
            const timeAgo = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            const isUpdating = updatingId === order.id;
            return (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/checkout/track-order?id=${order.id}`)}
                style={[styles.orderCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <View style={[styles.orderNumBadge, { backgroundColor: Colors[theme]['primary-container'] }]}>
                      <Text style={[styles.orderNumText, { color: Colors[theme].primary }]}>#{order.orderNumber}</Text>
                    </View>
                    <View style={[styles.timeBadge, { backgroundColor: Colors[theme]['surface-container'] }]}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color={Colors[theme]['on-surface-variant']} />
                      <Text style={[styles.timeText, { color: Colors[theme]['on-surface-variant'] }]}>{timeAgo}m</Text>
                    </View>
                  </View>
                  <View style={[styles.amountBadge, { backgroundColor: Colors[theme]['surface-container-high'] }]}>
                    <Text style={[styles.amountText, { color: Colors[theme]['on-surface'] }]}>{formatPrice(order.total)}</Text>
                  </View>
                </View>

                <Text style={[styles.orderItems, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={1}>
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>

                <View style={styles.orderMeta}>
                  <MaterialCommunityIcons name="account" size={14} color={Colors[theme]['on-surface-variant']} />
                  <Text style={[styles.orderCustomer, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={1}>
                    {typeof order.deliveryAddress === 'object' && 'street' in order.deliveryAddress
                      ? order.deliveryAddress.street
                      : 'Unknown address'}
                  </Text>
                </View>

                <View style={[styles.orderDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />

                <View style={styles.orderActions}>
                  {order.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: Colors[theme]['error-container'] }]}
                        onPress={() => handleCancel(order.id)}
                        disabled={isUpdating}
                      >
                        <Text style={[styles.actionBtnText, { color: Colors[theme].error }]}>
                          {isUpdating ? '...' : 'Decline'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: Colors[theme].primary }]}
                        onPress={() => handleAccept(order.id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.actionBtnTextWhite}>Accept</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                  {order.status === 'restaurant_accepted' && (
                    <TouchableOpacity
                      style={[styles.actionBtnFull, { backgroundColor: Colors[theme].secondary }]}
                      onPress={() => handlePrepare(order.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.actionBtnTextWhite}>Start Preparing</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  {order.status === 'preparing' && (
                    <TouchableOpacity
                      style={[styles.actionBtnFull, { backgroundColor: Colors[theme].secondary }]}
                      onPress={() => handleReady(order.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.actionBtnTextWhite}>Mark as Ready</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  {order.status === 'ready_for_pickup' && (
                    <View style={[styles.statusChip, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                      <MaterialCommunityIcons name="package-variant-closed" size={16} color={Colors[theme].primary} />
                      <Text style={[styles.statusChipText, { color: Colors[theme].primary }]}>Awaiting driver</Text>
                    </View>
                  )}
                  {order.status === 'driver_assigned' && (
                    <View style={[styles.statusChip, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                      <MaterialCommunityIcons name="bike" size={16} color={Colors[theme].primary} />
                      <Text style={[styles.statusChipText, { color: Colors[theme].primary }]}>Driver assigned</Text>
                    </View>
                  )}
                  {order.status === 'picked_up' && (
                    <View style={[styles.statusChip, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                      <MaterialCommunityIcons name="bike" size={16} color={Colors[theme].primary} />
                      <Text style={[styles.statusChipText, { color: Colors[theme].primary }]}>Picked up</Text>
                    </View>
                  )}
                  {order.status === 'on_the_way' && (
                    <View style={[styles.statusChip, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                      <MaterialCommunityIcons name="bike" size={16} color={Colors[theme].primary} />
                      <Text style={[styles.statusChipText, { color: Colors[theme].primary }]}>On the way</Text>
                    </View>
                  )}
                  {order.status === 'arrived' && (
                    <View style={[styles.statusChip, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                      <MaterialCommunityIcons name="map-marker-check" size={16} color={Colors[theme].primary} />
                      <Text style={[styles.statusChipText, { color: Colors[theme].primary }]}>Driver arrived</Text>
                    </View>
                  )}
                  {order.status === 'delivered' && (
                    <View style={[styles.statusChip, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                      <MaterialCommunityIcons name="check-circle" size={16} color={Colors[theme].primary} />
                      <Text style={[styles.statusChipText, { color: Colors[theme].primary }]}>Delivered</Text>
                    </View>
                  )}
                  {order.status === 'cancelled' && (
                    <View style={[styles.statusChip, { backgroundColor: Colors[theme]['error-container'] }]}>
                      <MaterialCommunityIcons name="close-circle" size={16} color={Colors[theme].error} />
                      <Text style={[styles.statusChipText, { color: Colors[theme].error }]}>Cancelled</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  revenueBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full },
  revenueText: { ...Typography['label-sm'], fontWeight: '600' },
  orderTabs: {
    flexDirection: 'row', marginHorizontal: Spacing['container-padding'],
    borderRadius: BorderRadius.xl, padding: 4, marginBottom: Spacing.md,
  },
  orderTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg,
  },
  orderTabText: { ...Typography['label-md'], fontWeight: '600' },
  tabBadge: {
    minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  tabBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100 },
  emptyState: { alignItems: 'center', gap: Spacing.sm, marginTop: 60 },
  emptyTitle: { ...Typography['body-md'] },
  emptySubtitle: { ...Typography['label-sm'] },
  orderCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.light['surface-variant'], ...Shadows.sm,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  orderNumBadge: { paddingHorizontal: Spacing.md, paddingVertical: 2, borderRadius: BorderRadius.full },
  orderNumText: { ...Typography['label-sm'], fontWeight: '700' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  timeText: { ...Typography['label-sm'] },
  amountBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full },
  amountText: { ...Typography['label-sm'], fontWeight: '700' },
  orderItems: { ...Typography['body-sm'], marginBottom: Spacing.sm },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  orderCustomer: { ...Typography['body-sm'], flex: 1 },
  orderDivider: { height: 1, marginBottom: Spacing.md },
  orderActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  actionBtnText: { ...Typography['label-md'], fontWeight: '600' },
  actionBtnTextWhite: { ...Typography['label-md'], color: '#ffffff', fontWeight: '700' },
  actionBtnFull: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  statusChipText: { ...Typography['label-md'], fontWeight: '600' },
});
