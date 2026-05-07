import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useOrderStore } from '@/store/orderStore';
import { formatPrice, formatDateTime, getStatusLabel } from '@/utils/format';

export default function OrdersScreen() {
  const theme = 'light';
  const { orders, isLoading, loadOrders } = useOrderStore();

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            const action = isCancelled ? 'Support' : 'Reorder';
            const itemSummary = isCancelled
              ? 'Payment failed'
              : `${order.items.length} item${order.items.length !== 1 ? 's' : ''}: ${order.items.map((i) => i.menuItem.name).join(', ')}`;

            return (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
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
                  <View style={[styles.statusBadge, { backgroundColor: isDelivered ? 'rgba(15, 169, 88, 0.1)' : Colors[theme]['error-container'] }]}>
                    <Text style={[styles.statusText, { color: isDelivered ? Colors[theme]['primary-container'] : Colors[theme].error }]}>
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
                  <TouchableOpacity
                    onPress={action === 'Support' ? handleSupport : handleReorder}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: action === 'Reorder'
                          ? Colors[theme]['primary-container']
                          : 'transparent',
                        borderWidth: action === 'Support' ? 1.5 : 0,
                        borderColor: action === 'Support' ? Colors[theme]['secondary-container'] : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        {
                          color: action === 'Reorder'
                            ? Colors[theme]['on-primary']
                            : Colors[theme]['secondary-container'],
                        },
                      ]}
                    >
                      {action}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
