import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Modal, FlatList } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { restaurantsService } from '@/services/restaurants.service';
import { ordersService } from '@/services/orders.service';
import { useOrderStore } from '@/store/orderStore';
import { User, Order } from '@/types';

export default function RidersScreen() {
  const theme = 'light';
  const [drivers, setDrivers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { orders, loadOrders } = useOrderStore();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const unassignedOrders = useMemo(() =>
    orders.filter((o) => o.status === 'restaurant_accepted' || o.status === 'ready_for_pickup'),
    [orders],
  );

  useEffect(() => {
    loadDrivers();
    loadOrders();
  }, []);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await restaurantsService.getDrivers();
      setDrivers(data);
    } catch {
      Alert.alert('Error', 'Failed to load drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAssign = async (driver: User) => {
    setSelectedDriver(driver);
    setLoadingOrders(true);
    await loadOrders();
    setLoadingOrders(false);
    setShowAssignModal(true);
  };

  const handleAssignOrder = async (orderId: string) => {
    if (!selectedDriver) return;
    setAssigningOrderId(orderId);
    setShowAssignModal(false);
    try {
      await ordersService.assignDriver(orderId, selectedDriver.id);
      await loadOrders();
      Alert.alert('Assigned', `Order assigned to ${selectedDriver.name || 'driver'}`);
    } catch {
      Alert.alert('Error', 'Failed to assign order. Please try again.');
    } finally {
      setAssigningOrderId(null);
      setSelectedDriver(null);
    }
  };

  const onDeliveryCount = orders.filter((o) =>
    ['driver_assigned', 'picked_up', 'on_the_way', 'arrived'].includes(o.status) && o.rider
  ).reduce((acc, o) => {
    if (o.rider?.id) acc.add(o.rider.id);
    return acc;
  }, new Set()).size;

  const availableCount = drivers.length - onDeliveryCount;

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Riders</Text>
        <TouchableOpacity onPress={() => { loadDrivers(); loadOrders(); }}>
          <MaterialCommunityIcons name="refresh" size={24} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.statsCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{drivers.length}</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Registered Drivers</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{onDeliveryCount}</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>On Delivery</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{availableCount}</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Available</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>All Drivers</Text>
          {unassignedOrders.length > 0 && (
            <Text style={[styles.sectionBadge, { color: Colors[theme].secondary }]}>
              {unassignedOrders.length} pending
            </Text>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginTop: 40 }} />
        ) : drivers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="truck" size={56} color={Colors[theme]['surface-variant']} />
            <Text style={[styles.emptyTitle, { color: Colors[theme]['on-surface-variant'] }]}>No drivers registered</Text>
            <Text style={[styles.emptySubtitle, { color: Colors[theme]['surface-variant'] }]}>
              Drivers register on the platform and will appear here
            </Text>
          </View>
        ) : (
          drivers.map((driver) => {
            const isOnDelivery = orders.some((o) =>
              ['driver_assigned', 'picked_up', 'on_the_way', 'arrived'].includes(o.status) && o.rider?.id === driver.id
            );
            return (
              <View key={driver.id} style={[styles.driverCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
                <View style={[styles.driverAvatar, { backgroundColor: Colors[theme]['surface-container'] }]}>
                  {driver.avatar ? (
                    <Image source={{ uri: driver.avatar }} style={styles.driverAvatarImage} />
                  ) : (
                    <MaterialCommunityIcons name="account" size={24} color={Colors[theme]['on-surface-variant']} />
                  )}
                </View>
                <View style={styles.driverInfo}>
                  <Text style={[styles.driverName, { color: Colors[theme]['on-surface'] }]}>{driver.name || 'Driver'}</Text>
                  <Text style={[styles.driverPhone, { color: Colors[theme]['on-surface-variant'] }]}>{driver.phone || 'No phone'}</Text>
                  <View style={[isOnDelivery ? styles.onDeliveryBadge : styles.availableBadge, { backgroundColor: isOnDelivery ? 'rgba(229,56,59,0.1)' : 'rgba(15,169,88,0.1)' }]}>
                    <View style={[styles.statusDot, { backgroundColor: isOnDelivery ? '#e5383b' : '#0fa958' }]} />
                    <Text style={[styles.statusText, { color: isOnDelivery ? '#e5383b' : Colors[theme].primary }]}>
                      {isOnDelivery ? 'On Delivery' : 'Available'}
                    </Text>
                  </View>
                </View>
                {unassignedOrders.length > 0 && (
                  <TouchableOpacity
                    style={[styles.assignBtn, { backgroundColor: Colors[theme].primary }]}
                    onPress={() => handleOpenAssign(driver)}
                    disabled={assigningOrderId !== null}
                  >
                    {assigningOrderId ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="bike" size={16} color="#ffffff" />
                        <Text style={styles.assignBtnText}>Assign</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>How it works</Text>
        </View>

        {[
          { icon: 'account-plus', title: 'Drivers register on the platform', desc: 'Drivers sign up with D+255 prefix and become available for deliveries' },
          { icon: 'map-marker-path', title: 'Real-time tracking', desc: 'Track driver location and delivery progress from your dashboard' },
          { icon: 'check-circle', title: 'Assign to specific rider', desc: 'Tap "Assign" on any rider to give them a specific order directly' },
        ].map((step, i) => (
          <View key={i} style={[styles.stepCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={[styles.stepIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name={step.icon as any} size={24} color={Colors[theme].primary} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, { color: Colors[theme]['on-surface'] }]}>{step.title}</Text>
              <Text style={[styles.stepDesc, { color: Colors[theme]['on-surface-variant'] }]}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showAssignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[theme].surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: Colors[theme]['on-surface'] }]}>Assign Order</Text>
                <Text style={[styles.modalSubtitle, { color: Colors[theme]['on-surface-variant'] }]}>
                  to {selectedDriver?.name || 'driver'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => { setShowAssignModal(false); setSelectedDriver(null); }}>
                <MaterialCommunityIcons name="close" size={24} color={Colors[theme]['on-surface-variant']} />
              </TouchableOpacity>
            </View>

            {loadingOrders ? (
              <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginVertical: 40 }} />
            ) : unassignedOrders.length === 0 ? (
              <View style={styles.modalEmpty}>
                <MaterialCommunityIcons name="check-circle" size={48} color={Colors[theme].primary} />
                <Text style={[styles.modalEmptyText, { color: Colors[theme]['on-surface-variant'] }]}>No orders pending</Text>
                <Text style={[styles.modalEmptySubtext, { color: Colors[theme]['surface-variant'] }]}>
                  All orders have drivers assigned
                </Text>
              </View>
            ) : (
              <FlatList
                data={unassignedOrders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.orderList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.orderItem, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
                    onPress={() => handleAssignOrder(item.id)}
                  >
                    <View style={styles.orderItemLeft}>
                      <View style={[styles.orderNumBadge, { backgroundColor: Colors[theme]['primary-container'] }]}>
                        <Text style={[styles.orderNumText, { color: Colors[theme].primary }]}>#{item.orderNumber}</Text>
                      </View>
                      <View style={styles.orderItemInfo}>
                        <Text style={[styles.orderItemItems, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>
                          {item.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </Text>
                        <Text style={[styles.orderItemStatus, { color: Colors[theme]['on-surface-variant'] }]}>
                          {item.status === 'restaurant_accepted' ? 'Accepted' : 'Ready for pickup'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.orderItemRight}>
                      <Text style={[styles.orderItemPrice, { color: Colors[theme]['on-surface'] }]}>{formatPrice(item.total)}</Text>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={Colors[theme]['outline']} />
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100 },
  statsCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.sm },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.h1, fontWeight: '700' },
  statLabel: { ...Typography['label-sm'], marginTop: 2 },
  statDivider: { width: 1, height: 36, marginHorizontal: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h2 },
  sectionBadge: { ...Typography['label-sm'], fontWeight: '600' },
  emptyState: { alignItems: 'center', gap: Spacing.sm, marginTop: 40 },
  emptyTitle: { ...Typography['body-md'] },
  emptySubtitle: { ...Typography['label-sm'] },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.light['surface-variant'], ...Shadows.sm,
  },
  driverAvatar: { width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  driverAvatarImage: { width: '100%', height: '100%' },
  driverInfo: { flex: 1 },
  driverName: { ...Typography['label-md'], fontWeight: '600' },
  driverPhone: { ...Typography['body-sm'], marginTop: 1 },
  availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginTop: 4 },
  onDeliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...Typography['label-sm'], fontWeight: '600' },
  assignBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
  },
  assignBtnText: { ...Typography['label-sm'], color: '#ffffff', fontWeight: '700' },
  stepCard: { flexDirection: 'row', gap: Spacing.md, borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
  stepIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  stepInfo: { flex: 1 },
  stepTitle: { ...Typography['label-md'], fontWeight: '600' },
  stepDesc: { ...Typography['body-sm'], marginTop: 2, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing['container-padding'], paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  modalTitle: { ...Typography.h1 },
  modalSubtitle: { ...Typography['body-sm'], marginTop: 2 },
  modalEmpty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: 40 },
  modalEmptyText: { ...Typography['body-md'] },
  modalEmptySubtext: { ...Typography['label-sm'], textAlign: 'center' },
  orderList: { gap: Spacing.sm },
  orderItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: BorderRadius.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.light['surface-variant'],
  },
  orderItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  orderNumBadge: { paddingHorizontal: Spacing.md, paddingVertical: 2, borderRadius: BorderRadius.full },
  orderNumText: { ...Typography['label-sm'], fontWeight: '700' },
  orderItemInfo: { flex: 1 },
  orderItemItems: { ...Typography['label-md'], fontWeight: '600' },
  orderItemStatus: { ...Typography['body-sm'], marginTop: 1 },
  orderItemRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  orderItemPrice: { ...Typography['label-md'], fontWeight: '700' },
});
