import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useOrderStore } from '@/store/orderStore';
import { formatPrice, formatDateTime, getStatusLabel } from '@/utils/format';

export default function OrdersScreen() {
  const theme = 'light';
  const { orders, isLoading, loadOrders, cancelOrder } = useOrderStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const handleCancel = (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setCancellingId(orderId);
          try {
            await cancelOrder(orderId);
          } catch {
            Alert.alert('Error', 'Failed to cancel order');
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  const handleReorder = () => {};

  const handleSupport = () => {};

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].primary} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="map-marker" size={24} color={Colors[theme].primary} />
            <Text style={[styles.headerTitle, { color: Colors[theme].primary }]}>Orders</Text>
          </View>
          <TouchableOpacity style={[styles.cartButton, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
            <MaterialCommunityIcons name="cart-outline" size={20} color={Colors[theme].primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: Colors[theme]['on-surface-variant'] }]}>No orders yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="map-marker" size={24} color={Colors[theme].primary} />
          <Text style={[styles.headerTitle, { color: Colors[theme].primary }]}>Orders</Text>
        </View>
        <TouchableOpacity style={[styles.cartButton, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
          <MaterialCommunityIcons name="cart-outline" size={20} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors[theme].primary} />
        }
      >
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: Colors[theme]['on-surface'] }]}>Recent Orders</Text>
          <Text style={[styles.pageSubtitle, { color: Colors[theme]['on-surface-variant'] }]}>
            View and manage your previous meal selections.
          </Text>
        </View>

        <View style={styles.ordersList}>
          {orders.map((order) => {
            const isCancelled = order.status === 'cancelled';
            const isDelivered = order.status === 'delivered';
            const canCancel = !isCancelled && !isDelivered;
            const itemSummary = order.items.map((i) => i.name).join(', ');

            return (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/checkout/track-order?id=${order.id}`)}
              >
              <View style={[styles.orderCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
                <View style={styles.orderTop}>
                  <View style={styles.orderRestaurant}>
                    <View style={[styles.orderImage, { backgroundColor: Colors[theme]['surface-container'] }]} />
                    <View>
                      <Text style={[styles.orderRestaurantName, { color: Colors[theme]['on-surface'] }]}>
                        {order.restaurant.name}
                      </Text>
                      <Text style={[styles.orderDate, { color: Colors[theme]['on-surface-variant'] }]}>
                        {formatDateTime(order.createdAt)}
                      </Text>
                      <Text style={[styles.orderAmount, { color: isCancelled ? Colors[theme].tertiary : Colors[theme].primary }]}>
                        {formatPrice(order.total)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: isDelivered ? 'rgba(15, 169, 88, 0.1)' : isCancelled ? Colors[theme]['error-container'] : 'rgba(253, 192, 3, 0.1)' }]}>
                    <Text style={[styles.statusText, { color: isDelivered ? Colors[theme]['primary-container'] : isCancelled ? Colors[theme].error : Colors[theme].tertiary }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.orderDivider, { backgroundColor: Colors[theme]['surface-container'] }]} />
                <View style={styles.orderBottom}>
                  <View style={styles.orderItemsRow}>
                    <MaterialCommunityIcons
                      name={isCancelled ? 'alert-circle' : 'receipt'}
                      size={18}
                      color={Colors[theme]['on-surface-variant']}
                    />
                    <Text style={[styles.orderItems, { color: Colors[theme]['on-surface-variant'] }]}>
                      {itemSummary}
                    </Text>
                  </View>
                  {canCancel ? (
                    <TouchableOpacity
                      onPress={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                      style={[
                        styles.actionButton,
                        { backgroundColor: Colors[theme]['error-container'], borderWidth: 0 },
                      ]}
                    >
                      <Text style={[styles.actionButtonText, { color: Colors[theme].error }]}>
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                  ) : isCancelled ? (
                    <TouchableOpacity
                      onPress={handleSupport}
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: 'transparent',
                          borderWidth: 1.5,
                          borderColor: Colors[theme]['secondary-container'],
                        },
                      ]}
                    >
                      <Text style={[styles.actionButtonText, { color: Colors[theme]['secondary-container'] }]}>
                        Support
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleReorder}
                      style={[
                        styles.actionButton,
                        { backgroundColor: Colors[theme]['primary-container'], borderWidth: 0 },
                      ]}
                    >
                      <Text style={[styles.actionButtonText, { color: Colors[theme]['on-primary'] }]}>
                        Reorder
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...Typography['body-lg'] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'],
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  headerTitle: { ...Typography.h2 },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100 },
  pageHeader: { marginBottom: Spacing.lg },
  pageTitle: { ...Typography.h1, marginBottom: Spacing.xs },
  pageSubtitle: { ...Typography['body-sm'] },
  ordersList: { gap: Spacing.md },
  orderCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.light['surface-container'],
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderRestaurant: { flexDirection: 'row', gap: Spacing.md, flex: 1 },
  orderImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  orderRestaurantName: { ...Typography['label-md'] },
  orderDate: { ...Typography['body-sm'] },
  orderAmount: { ...Typography['label-md'], marginTop: 4 },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: { ...Typography['label-sm'] },
  orderDivider: { height: 1, marginVertical: Spacing.md },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  orderItems: { ...Typography['body-sm'] },
  actionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
  },
  actionButtonText: { ...Typography['label-md'] },
});
