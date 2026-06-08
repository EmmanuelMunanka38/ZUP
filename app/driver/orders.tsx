import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useDriverStore } from '@/store/driverStore';
import { useOrderStore } from '@/store/orderStore';

export default function DriverOrdersScreen() {
  const theme = 'light';
  const { activeDelivery, requests, totalDeliveries, earnings } = useDriverStore();
  const { orders, isLoading, loadOrders } = useOrderStore();

  useEffect(() => {
    loadOrders();
  }, []);

  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>My Deliveries</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.statsBar, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{totalDeliveries}</Text>
          <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Delivered</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{formatPrice(earnings)}</Text>
          <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Earned</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{requests.length}</Text>
          <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Pending</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeDelivery && (
          <>
            <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>Active Delivery</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/driver/active-delivery')}
              style={[styles.orderCard, { backgroundColor: Colors[theme].primary, borderColor: Colors[theme].primary }]}
            >
              <View style={styles.orderHeader}>
                <MaterialCommunityIcons name="bike" size={24} color="#ffffff" />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={[styles.orderName, { color: '#ffffff' }]}>{activeDelivery.restaurant.name}</Text>
                  <Text style={[styles.orderStatus, { color: 'rgba(255,255,255,0.8)' }]}>
                    {activeDelivery.items.join(', ')}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={[styles.orderFooter, { borderTopColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={[styles.orderFee, { color: '#ffffff' }]}>{formatPrice(activeDelivery.deliveryFee)}</Text>
                <Text style={[styles.orderDistance, { color: 'rgba(255,255,255,0.8)' }]}>{activeDelivery.distance} km</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        {requests.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>Pending Requests</Text>
            {requests.map((req) => (
              <View key={req.id} style={[styles.orderCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-variant'] }]}>
                <View style={styles.orderHeader}>
                  <View style={[styles.requestDot, { backgroundColor: Colors[theme].primary }]} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={[styles.orderName, { color: Colors[theme]['on-surface'] }]}>{req.restaurant.name}</Text>
                    <Text style={[styles.orderStatus, { color: Colors[theme]['on-surface-variant'] }]}>{req.items.join(', ')}</Text>
                  </View>
                  <Text style={[styles.orderFee, { color: Colors[theme].primary }]}>{formatPrice(req.deliveryFee)}</Text>
                </View>
                <View style={[styles.orderFooter, { borderTopColor: Colors[theme]['surface-variant'] }]}>
                  <Text style={[styles.orderDistance, { color: Colors[theme]['on-surface-variant'] }]}>{req.distance} km away</Text>
                  <Text style={[styles.orderTime, { color: Colors[theme].error }]}>
                    {Math.floor(req.timeLeft / 60)}:{String(req.timeLeft % 60).padStart(2, '0')} left
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
          History ({deliveredOrders.length})
        </Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginTop: 20 }} />
        ) : deliveredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bike" size={56} color={Colors[theme]['surface-variant']} />
            <Text style={[styles.emptyText, { color: Colors[theme]['on-surface-variant'] }]}>No deliveries yet</Text>
            <Text style={[styles.emptySubtext, { color: Colors[theme]['surface-variant'] }]}>Completed orders will appear here</Text>
          </View>
        ) : (
          deliveredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/checkout/track-order?id=${order.id}`)}
              style={[styles.orderCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-variant'] }]}
            >
              <View style={styles.orderHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderName, { color: Colors[theme]['on-surface'] }]}>{order.restaurant.name}</Text>
                  <Text style={[styles.orderStatus, { color: Colors[theme]['on-surface-variant'] }]}>
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </Text>
                </View>
                <Text style={[styles.orderFee, { color: Colors[theme].primary }]}>{formatPrice(order.total)}</Text>
              </View>
              <View style={[styles.orderFooter, { borderTopColor: Colors[theme]['surface-variant'] }]}>
                <View style={[styles.deliveredBadge, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={Colors[theme].primary} />
                  <Text style={[styles.deliveredText, { color: Colors[theme].primary }]}>Delivered</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
  statsBar: {
    flexDirection: 'row', marginHorizontal: Spacing['container-padding'], marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.h2, fontWeight: '700' },
  statLabel: { ...Typography['label-sm'] },
  statDivider: { width: 1, alignSelf: 'stretch', marginHorizontal: Spacing.md },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 40 },
  sectionTitle: { ...Typography.h1, marginBottom: Spacing.md, marginTop: Spacing.md },
  orderCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, ...Shadows.sm,
  },
  orderHeader: { flexDirection: 'row', alignItems: 'center' },
  requestDot: { width: 10, height: 10, borderRadius: 5 },
  orderName: { ...Typography['label-md'], fontWeight: '600' },
  orderStatus: { ...Typography['body-sm'], marginTop: 1 },
  orderFee: { ...Typography.h2, fontWeight: '700' },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1,
  },
  orderDistance: { ...Typography['body-sm'] },
  orderTime: { ...Typography['body-sm'], fontWeight: '600' },
  deliveredBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  deliveredText: { ...Typography['label-sm'], fontWeight: '600' },
  emptyState: { alignItems: 'center', gap: Spacing.sm, marginTop: 40 },
  emptyText: { ...Typography['body-md'] },
  emptySubtext: { ...Typography['label-sm'] },
});
